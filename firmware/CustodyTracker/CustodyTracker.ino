// CustodyTracker — ESP32 + GPS u-blox M10 + ADXL375 + ATECC608
// Ogni secondo: una lettura (posizione, picco di accelerazione). Ogni 16 letture (o subito dopo un
// urto): Merkle root SHA-256 -> digest del batch -> firma ECDSA P-256 nel secure element -> POST al
// relayer, che la ancora sul contratto CustodyLog. Formato identico a lib/protocol.mjs.
//
// Comandi da Serial Monitor (115200): INFO = stampa chiave pubblica · PROVISION = configura e
// blocca l'ATECC608 (IRREVERSIBILE) e genera la chiave nello slot 0.

#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <TinyGPSPlus.h>
#include <ArduinoECCX08.h>
#include <mbedtls/sha256.h>
#include <mbedtls/ecdsa.h>
#include <esp_random.h>
#include <time.h>
#include "config.h"

// ------------------------------------------------------------------ stato globale
TinyGPSPlus gps;
HardwareSerial GPSSerial(2);
TwoWire SEWire(1);
ECCX08Class ecc(SEWire, 0x60);
Preferences prefs;

bool hwSigner = false;          // true = ATECC608, false = chiave software in NVS (fallback dichiarato)
uint8_t pubKey[64];             // X || Y
uint8_t deviceId[32];           // sha256(X || Y), come nel contratto
mbedtls_ecdsa_context swKey;

// picco di accelerazione: scritto dal task di campionamento, letto/azzerato dal loop
portMUX_TYPE accMux = portMUX_INITIALIZER_UNLOCKED;
volatile uint16_t windowPeakCg = 0;
volatile uint32_t accSamples = 0;
bool accOk = false;

struct Record { uint32_t n, t; int32_t lat, lon; uint16_t peakCg; uint8_t flags; };
Record batch[BATCH_SIZE];
uint8_t batchLen = 0;
uint32_t recordCounter = 0;
bool shockInBatch = false;

// batch firmati in attesa di invio (se il WiFi cade non si perde nulla, fino a 6 batch)
struct Pending { String json; };
Pending pending[6];
uint8_t pendingCount = 0;

// ------------------------------------------------------------------ utilità
static void sha256(const uint8_t* a, size_t la, const uint8_t* b, size_t lb, const uint8_t* c, size_t lc, uint8_t out[32]) {
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  if (la) mbedtls_sha256_update(&ctx, a, la);
  if (lb) mbedtls_sha256_update(&ctx, b, lb);
  if (lc) mbedtls_sha256_update(&ctx, c, lc);
  mbedtls_sha256_finish(&ctx, out);
  mbedtls_sha256_free(&ctx);
}

static String toHex(const uint8_t* b, size_t n) {
  static const char* H = "0123456789abcdef";
  String s = "0x";
  s.reserve(2 + 2 * n);
  for (size_t i = 0; i < n; i++) { s += H[b[i] >> 4]; s += H[b[i] & 15]; }
  return s;
}

static void be32(uint8_t* p, uint32_t v) { p[0] = v >> 24; p[1] = v >> 16; p[2] = v >> 8; p[3] = v; }
static void be16(uint8_t* p, uint16_t v) { p[0] = v >> 8; p[1] = v; }

static int rng(void*, unsigned char* out, size_t len) { esp_fill_random(out, len); return 0; }

// ------------------------------------------------------------------ ADXL375 (registri diretti)
static void accWrite(uint8_t reg, uint8_t v) {
  Wire.beginTransmission(0x53); Wire.write(reg); Wire.write(v); Wire.endTransmission();
}

static bool accBegin() {
  Wire.begin(ACC_SDA, ACC_SCL, 400000);
  Wire.beginTransmission(0x53); Wire.write(0x00); Wire.endTransmission(false);
  if (Wire.requestFrom(0x53, 1) != 1 || Wire.read() != 0xE5) return false;  // DEVID
  accWrite(0x2D, 0x00);            // POWER_CTL: standby durante la configurazione
  accWrite(0x31, 0x0B);            // DATA_FORMAT: bit fissi richiesti dall'ADXL375, giustificato a destra
  accWrite(0x2C, ACC_ODR_CODE);    // BW_RATE
  accWrite(0x38, 0x80 | 31);       // FIFO_CTL: stream mode, 32 campioni
  accWrite(0x2D, 0x08);            // POWER_CTL: measure
  return true;
}

// Task ad alta priorità: svuota la FIFO ogni 5 ms (a 1600 Hz la FIFO copre 20 ms), nessun campione perso.
static void accTask(void*) {
  for (;;) {
    Wire.beginTransmission(0x53); Wire.write(0x39); Wire.endTransmission(false);
    Wire.requestFrom(0x53, 1);
    uint8_t entries = Wire.read() & 0x3F;
    uint16_t localPeak = 0;
    for (uint8_t i = 0; i < entries; i++) {
      Wire.beginTransmission(0x53); Wire.write(0x32); Wire.endTransmission(false);
      if (Wire.requestFrom(0x53, 6) != 6) break;
      int16_t x = Wire.read() | (Wire.read() << 8);
      int16_t y = Wire.read() | (Wire.read() << 8);
      int16_t z = Wire.read() | (Wire.read() << 8);
      float mg = sqrtf((float)x * x + (float)y * y + (float)z * z) * ACC_MG_PER_LSB;
      uint16_t cg = (uint16_t)min(mg / 10.0f, 65535.0f);
      if (cg > localPeak) localPeak = cg;
    }
    portENTER_CRITICAL(&accMux);
    if (localPeak > windowPeakCg) windowPeakCg = localPeak;
    accSamples += entries;
    portEXIT_CRITICAL(&accMux);
    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

// ------------------------------------------------------------------ GPS
static void gpsBegin() {
  GPSSerial.setRxBufferSize(4096);
  const uint32_t bauds[] = {115200, 38400, 9600, 57600};
  for (uint32_t b : bauds) {
    GPSSerial.begin(b, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
    uint32_t t0 = millis();
    uint32_t before = gps.passedChecksum();
    while (millis() - t0 < 1500) while (GPSSerial.available()) gps.encode(GPSSerial.read());
    if (gps.passedChecksum() > before) { Serial.printf("GPS: NMEA valido a %lu baud\n", b); return; }
    GPSSerial.end();
  }
  Serial.println("GPS: nessun NMEA valido (cablaggio TX/RX invertito? alimentazione?). Continuo senza fix.");
  GPSSerial.begin(115200, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
}

static uint32_t gpsUnix() {
  if (!gps.date.isValid() || !gps.time.isValid() || gps.date.year() < 2024) return 0;
  struct tm tm = {};
  tm.tm_year = gps.date.year() - 1900; tm.tm_mon = gps.date.month() - 1; tm.tm_mday = gps.date.day();
  tm.tm_hour = gps.time.hour(); tm.tm_min = gps.time.minute(); tm.tm_sec = gps.time.second();
  setenv("TZ", "UTC0", 1); tzset();
  return (uint32_t)mktime(&tm);
}

// ------------------------------------------------------------------ firma
static bool signerBegin() {
  SEWire.begin(SE_SDA, SE_SCL, 100000);
  prefs.begin("custody", false);
  if (ecc.begin()) {
    if (!ecc.locked()) {
      Serial.println("ATECC608 trovato ma NON configurato. Scrivi PROVISION per bloccarlo (irreversibile).");
      Serial.println("Nel frattempo uso la chiave software.");
    } else if (ecc.generatePublicKey(0, pubKey)) {
      hwSigner = true;
    }
  } else {
    Serial.println("ATECC608 non risponde su I2C#1 (GPIO25/26): uso chiave software (fallback).");
  }
  if (!hwSigner) {
    // Chiave P-256 software persistita in NVS: stessa interfaccia, garanzia più debole (estraibile dalla flash).
    mbedtls_ecdsa_init(&swKey);
    uint8_t d[32];
    if (prefs.getBytes("swkey", d, 32) == 32) {
      mbedtls_ecp_group_load(&swKey.MBEDTLS_PRIVATE(grp), MBEDTLS_ECP_DP_SECP256R1);
      mbedtls_mpi_read_binary(&swKey.MBEDTLS_PRIVATE(d), d, 32);
      mbedtls_ecp_mul(&swKey.MBEDTLS_PRIVATE(grp), &swKey.MBEDTLS_PRIVATE(Q), &swKey.MBEDTLS_PRIVATE(d),
                      &swKey.MBEDTLS_PRIVATE(grp).G, rng, nullptr);
    } else {
      mbedtls_ecdsa_genkey(&swKey, MBEDTLS_ECP_DP_SECP256R1, rng, nullptr);
      mbedtls_mpi_write_binary(&swKey.MBEDTLS_PRIVATE(d), d, 32);
      prefs.putBytes("swkey", d, 32);
    }
    uint8_t q[65]; size_t ql;
    mbedtls_ecp_point_write_binary(&swKey.MBEDTLS_PRIVATE(grp), &swKey.MBEDTLS_PRIVATE(Q),
                                   MBEDTLS_ECP_PF_UNCOMPRESSED, &ql, q, sizeof q);
    memcpy(pubKey, q + 1, 64);
  }
  sha256(pubKey, 64, nullptr, 0, nullptr, 0, deviceId);
  return true;
}

static bool signDigest(const uint8_t h[32], uint8_t sig[64]) {
  if (hwSigner) return ecc.ecSign(0, h, sig);
  mbedtls_mpi r, s;
  mbedtls_mpi_init(&r); mbedtls_mpi_init(&s);
  int rc = mbedtls_ecdsa_sign(&swKey.MBEDTLS_PRIVATE(grp), &r, &s, &swKey.MBEDTLS_PRIVATE(d), h, 32, rng, nullptr);
  if (rc == 0) { mbedtls_mpi_write_binary(&r, sig, 32); mbedtls_mpi_write_binary(&s, sig + 32, 32); }
  mbedtls_mpi_free(&r); mbedtls_mpi_free(&s);
  return rc == 0;
}

static void provision() {
  if (!ecc.begin()) { Serial.println("ATECC608 non trovato."); return; }
  if (ecc.locked()) { Serial.println("Già bloccato."); }
  else {
    if (!ecc.writeConfiguration() || !ecc.lock()) { Serial.println("Configurazione/lock fallito."); return; }
    Serial.println("Config TLS di default scritta e bloccata.");
  }
  if (!ecc.generatePrivateKey(0, pubKey)) { Serial.println("generatePrivateKey fallito."); return; }
  Serial.println("Chiave generata nello slot 0 (non esce mai dal chip). Riavvio...");
  delay(500);
  ESP.restart();
}

// ------------------------------------------------------------------ Merkle + batch
static void encodeRecord(const Record& r, uint8_t out[19]) {
  be32(out, r.n); be32(out + 4, r.t); be32(out + 8, (uint32_t)r.lat); be32(out + 12, (uint32_t)r.lon);
  be16(out + 16, r.peakCg); out[18] = r.flags;
}

// leaf = sha256(0x00||rec), node = sha256(0x01||l||r), nodo dispari promosso invariato
static void merkleRoot(uint8_t recs[][19], uint8_t n, uint8_t root[32]) {
  uint8_t level[BATCH_SIZE][32];
  const uint8_t L = 0x00, N = 0x01;
  for (uint8_t i = 0; i < n; i++) sha256(&L, 1, recs[i], 19, nullptr, 0, level[i]);
  while (n > 1) {
    uint8_t m = 0;
    for (uint8_t i = 0; i < n; i += 2, m++) {
      if (i + 1 < n) sha256(&N, 1, level[i], 32, level[i + 1], 32, level[m]);
      else memmove(level[m], level[i], 32);
    }
    n = m;
  }
  memcpy(root, level[0], 32);
}

static void closeBatch() {
  if (!batchLen) return;
  uint8_t recs[BATCH_SIZE][19];
  uint16_t maxPeak = 0;
  for (uint8_t i = 0; i < batchLen; i++) { encodeRecord(batch[i], recs[i]); maxPeak = max(maxPeak, batch[i].peakCg); }
  uint8_t root[32];
  merkleRoot(recs, batchLen, root);

  uint32_t seq = prefs.getUInt("seq", 0) + 1;   // monotono e persistente: il contratto rifiuta seq <= ultimo
  prefs.putUInt("seq", seq);
  uint32_t tStart = batch[0].t, tEnd = batch[batchLen - 1].t;

  // "CLv1" | deviceId | seq | root | count | maxPeakCg | tStart | tEnd
  uint8_t pre[4 + 32 + 4 + 32 + 4 + 2 + 4 + 4], *p = pre;
  memcpy(p, "CLv1", 4); p += 4;
  memcpy(p, deviceId, 32); p += 32;
  be32(p, seq); p += 4;
  memcpy(p, root, 32); p += 32;
  be32(p, batchLen); p += 4;
  be16(p, maxPeak); p += 2;
  be32(p, tStart); p += 4;
  be32(p, tEnd);
  uint8_t digest[32], sig[64];
  sha256(pre, sizeof pre, nullptr, 0, nullptr, 0, digest);
  uint32_t t0 = millis();
  if (!signDigest(digest, sig)) { Serial.println("✗ firma fallita, batch scartato"); batchLen = 0; return; }
  Serial.printf("batch seq %lu · %u letture · picco %.1f g · firmato (%s) in %lu ms\n",
                seq, batchLen, maxPeak / 100.0, hwSigner ? "ATECC608" : "sw", millis() - t0);

  String j = "{\"seq\":" + String(seq) + ",\"count\":" + String(batchLen) + ",\"maxPeakCg\":" + String(maxPeak) +
             ",\"tStart\":" + String(tStart) + ",\"tEnd\":" + String(tEnd) + ",\"root\":\"" + toHex(root, 32) +
             "\",\"deviceId\":\"" + toHex(deviceId, 32) + "\",\"qx\":\"" + toHex(pubKey, 32) +
             "\",\"qy\":\"" + toHex(pubKey + 32, 32) + "\",\"r\":\"" + toHex(sig, 32) + "\",\"s\":\"" + toHex(sig + 32, 32) +
             "\",\"hw\":" + (hwSigner ? "true" : "false") + ",\"records\":[";
  for (uint8_t i = 0; i < batchLen; i++) { if (i) j += ","; j += "\"" + toHex(recs[i], 19) + "\""; }
  j += "]}";

  if (pendingCount == 6) { for (int i = 1; i < 6; i++) pending[i - 1] = pending[i]; pendingCount--; }
  pending[pendingCount++].json = j;
  batchLen = 0;
  shockInBatch = false;
}

static void flushPending() {
  if (!pendingCount || WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.setTimeout(15000);  // il relayer risponde dopo la conferma della tx
  http.begin(RELAYER_URL);
  http.addHeader("content-type", "application/json");
  int code = http.POST(pending[0].json);
  String resp = http.getString();
  http.end();
  if (code == 200) {
    Serial.println("  ✓ ancorato: " + resp.substring(0, 120));
    for (int i = 1; i < pendingCount; i++) pending[i - 1] = pending[i];
    pendingCount--;
  } else {
    Serial.printf("  ✗ relayer %d: %s\n", code, resp.c_str());
    if (code == 400) { for (int i = 1; i < pendingCount; i++) pending[i - 1] = pending[i]; pendingCount--; } // rifiutato: non ritentare
  }
}

static void printInfo() {
  Serial.printf("signer: %s\nqx: %s\nqy: %s\ndeviceId: %s\nseq: %lu\nacc campioni totali: %lu\nGPS: fix=%d sats=%lu chars=%lu ok=%lu\n",
                hwSigner ? "ATECC608 (slot 0)" : "software (NVS)", toHex(pubKey, 32).c_str(), toHex(pubKey + 32, 32).c_str(),
                toHex(deviceId, 32).c_str(), prefs.getUInt("seq", 0), (unsigned long)accSamples, gps.location.isValid(),
                gps.satellites.value(), gps.charsProcessed(), gps.passedChecksum());
}

// ------------------------------------------------------------------ setup / loop
void setup() {
  Serial.begin(115200);
  delay(300);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("\n== CustodyTracker ==");

  accOk = accBegin();
  Serial.println(accOk ? "ADXL375 ok (0xE5)" : "ADXL375 NON trovato su I2C#0 (GPIO21/22)");
  if (accOk) xTaskCreatePinnedToCore(accTask, "acc", 4096, nullptr, 5, nullptr, 1);

  gpsBegin();
  signerBegin();
  printInfo();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
}

void loop() {
  static uint32_t lastRecord = 0, lastWifiLog = 0;
  while (GPSSerial.available()) gps.encode(GPSSerial.read());

  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n'); cmd.trim();
    if (cmd == "INFO") printInfo();
    else if (cmd == "PROVISION") provision();
  }

  if (millis() - lastRecord >= RECORD_MS) {
    lastRecord = millis();
    uint16_t peak;
    portENTER_CRITICAL(&accMux); peak = windowPeakCg; windowPeakCg = 0; portEXIT_CRITICAL(&accMux);

    Record r{};
    r.n = recordCounter++;
    uint32_t gt = gpsUnix();
    r.t = gt ? gt : millis() / 1000;
    bool fix = gps.location.isValid() && gps.location.age() < 3000;
    r.lat = fix ? (int32_t)lround(gps.location.lat() * 1e7) : 0;
    r.lon = fix ? (int32_t)lround(gps.location.lng() * 1e7) : 0;
    r.peakCg = peak;
    bool shock = peak > SHOCK_CG;
    r.flags = (fix ? 1 : 0) | (shock ? 2 : 0) | (gt ? 4 : 0);
    batch[batchLen++] = r;
    if (shock) { shockInBatch = true; Serial.printf("⚠ URTO %.1f g\n", peak / 100.0); }
    digitalWrite(LED_PIN, shock || (r.n & 1));

    if (batchLen == BATCH_SIZE || shockInBatch) closeBatch();
  }

  if (WiFi.status() != WL_CONNECTED && millis() - lastWifiLog > 10000) {
    lastWifiLog = millis();
    Serial.printf("WiFi: non connesso a \"%s\" (pending %u)\n", WIFI_SSID, pendingCount);
  }
  flushPending();
}
