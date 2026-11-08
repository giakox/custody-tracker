// BringUp — test one component at a time, no WiFi or blockchain.
// Serial Monitor 115200, press enter after the command:
//   s = scan both I2C buses      a = ADXL375 live (peak g every 200 ms)
//   g = GPS: fix/satellites summary   r = GPS: raw NMEA (to see whether anything arrives)
//   e = ATECC608: serial, revision, lock (READ ONLY, locks nothing)
//   x = stop (back to the menu)
#include <Wire.h>
#include <TinyGPSPlus.h>
#include <ArduinoECCX08.h>
// same pins as CustodyTracker/config.h
#define GPS_RX_PIN 33
#define GPS_TX_PIN 32
#define ACC_SDA 21
#define ACC_SCL 22
#define SE_SDA 25
#define SE_SCL 26

TinyGPSPlus gps;
HardwareSerial GPSSerial(2);
TwoWire SEWire(1);
ECCX08Class ecc(SEWire, 0x60);
char mode = 0;
uint32_t gpsBaud = 0;

void scan(TwoWire& w, const char* name) {
  Serial.printf("%s:", name);
  int found = 0;
  for (uint8_t a = 1; a < 127; a++) {
    w.beginTransmission(a);
    if (w.endTransmission() == 0) { Serial.printf(" 0x%02X", a); found++; }
  }
  Serial.println(found ? "" : " no device (check SDA/SCL, 3V3, GND)");
}

void accInit() {
  auto wr = [](uint8_t r, uint8_t v) { Wire.beginTransmission(0x53); Wire.write(r); Wire.write(v); Wire.endTransmission(); };
  wr(0x2D, 0x00); wr(0x31, 0x0B); wr(0x2C, 0x0E); wr(0x38, 0x80 | 31); wr(0x2D, 0x08);
}

uint8_t accDevid() {
  Wire.beginTransmission(0x53); Wire.write(0x00);
  if (Wire.endTransmission(false) != 0) return 0;
  Wire.requestFrom(0x53, 1);
  return Wire.available() ? Wire.read() : 0;
}

void accLive() {
  static uint32_t t0 = millis(); static float peak = 0, last = 0; static uint32_t n = 0;
  Wire.beginTransmission(0x53); Wire.write(0x39); Wire.endTransmission(false);
  Wire.requestFrom(0x53, 1);
  uint8_t entries = Wire.read() & 0x3F;
  for (uint8_t i = 0; i < entries; i++) {
    Wire.beginTransmission(0x53); Wire.write(0x32); Wire.endTransmission(false);
    Wire.requestFrom(0x53, 6);
    int16_t x = Wire.read() | (Wire.read() << 8), y = Wire.read() | (Wire.read() << 8), z = Wire.read() | (Wire.read() << 8);
    last = sqrtf((float)x * x + (float)y * y + (float)z * z) * 0.049f;
    peak = max(peak, last); n++;
  }
  if (millis() - t0 >= 200) {
    Serial.printf("|a| now %5.2f g · peak %6.1f g · %4lu samples/s %s\n", last, peak, n * 5, peak > 15 ? "  <-- SHOCK" : "");
    t0 = millis(); peak = 0; n = 0;
  }
}

void gpsDetect() {
  const uint32_t bauds[] = {115200, 38400, 9600, 57600};
  for (uint32_t b : bauds) {
    GPSSerial.begin(b, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
    uint32_t t0 = millis(), ok0 = gps.passedChecksum();
    while (millis() - t0 < 1500) while (GPSSerial.available()) gps.encode(GPSSerial.read());
    if (gps.passedChecksum() > ok0) { gpsBaud = b; Serial.printf("GPS: valid NMEA at %lu baud\n", b); return; }
    GPSSerial.end();
  }
  Serial.printf("GPS: no valid NMEA (chars received: %lu). TX/RX swapped? 5V?\n", gps.charsProcessed());
  GPSSerial.begin(115200, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
}

void eccInfo() {
  if (!ecc.begin()) { Serial.println("ATECC608: no answer at 0x60 on GPIO25/26"); return; }
  byte sn[12]; ecc.serialNumber(sn);
  Serial.print("ATECC608: serial ");
  for (byte b : sn) Serial.printf("%02X", b);
  Serial.printf(" · %s\n", ecc.locked() ? "LOCKED (already configured)" : "unlocked (ready for PROVISION in the main firmware)");
}

void menu() { Serial.println("\ncommands: s=I2C scan  a=accelerometer  g=GPS  r=raw NMEA  e=ATECC608  x=stop"); }

// Pin probe before enabling I2C/UART: with the internal pull-down, a pin reading 1
// is pulled up externally (pull-up of a powered module, or idle GPS TX).
// pd=0 pu=1 -> floating (nothing connected or module off); pu=0 -> grounded.
void probe() {
  const struct { uint8_t pin; const char* what; } P[] = {
    {ACC_SDA, "D21 SDA ADXL"}, {ACC_SCL, "D22 SCL ADXL"}, {SE_SDA, "D25 SDA ATECC"},
    {SE_SCL, "D26 SCL ATECC"}, {GPS_RX_PIN, "D33 <- TX GPS"}, {GPS_TX_PIN, "D32 -> RX GPS"}};
  Serial.println("pin probe (pd = with pull-down, pu = with pull-up):");
  for (auto& p : P) {
    pinMode(p.pin, INPUT_PULLDOWN); delay(5); int pd = digitalRead(p.pin);
    pinMode(p.pin, INPUT_PULLUP);   delay(5); int pu = digitalRead(p.pin);
    const char* v = pd ? "pulled up externally (powered)" : pu ? "FLOATING (not connected / module off)" : "grounded / pulled down";
    Serial.printf("  %-14s pd=%d pu=%d  %s\n", p.what, pd, pu, v);
    pinMode(p.pin, INPUT);
  }
  // activity on the two GPS wires: a powered GPS transmits NMEA every second
  for (uint8_t pin : {(uint8_t)GPS_RX_PIN, (uint8_t)GPS_TX_PIN}) {
    pinMode(pin, INPUT_PULLDOWN);
    uint32_t edges = 0, t0 = millis(); int last = digitalRead(pin);
    while (millis() - t0 < 1500) { int v = digitalRead(pin); if (v != last) { edges++; last = v; } }
    Serial.printf("  GPIO%u: %lu transitions in 1.5 s %s\n", pin, edges, edges > 50 ? "<- data arriving here" : "");
    pinMode(pin, INPUT);
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\n== BringUp ==");
  probe();
  Wire.begin(ACC_SDA, ACC_SCL, 400000);
  SEWire.begin(SE_SDA, SE_SCL, 100000);
  GPSSerial.setRxBufferSize(4096);
  scan(Wire, "I2C#0 GPIO21/22 (expected 0x53)");
  scan(SEWire, "I2C#1 GPIO25/26 (expected 0x60)");
  uint8_t id = accDevid();
  if (id != 0xE5) {  // try swapped SDA/SCL via software
    Wire.end(); Wire.begin(ACC_SCL, ACC_SDA, 100000);
    scan(Wire, "I2C#0 with SDA/SCL swapped (SDA=D22, SCL=D21)");
    id = accDevid();
    if (id == 0xE5) Serial.println(">>> ADXL375 found with SDA/SCL SWAPPED: the wires on D21/D22 are swapped");
    else { Wire.end(); Wire.begin(ACC_SDA, ACC_SCL, 100000); }
  }
  Serial.printf("ADXL375 DEVID: 0x%02X %s\n", id, id == 0xE5 ? "ok" : "(expected 0xE5: check CS->3V3 and SDO->GND)");
  if (id == 0xE5) accInit();
  gpsDetect();
  eccInfo();
  menu();
}

void loop() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') return;
    mode = c;
    if (c == 's') { scan(Wire, "I2C#0"); scan(SEWire, "I2C#1"); mode = 0; }
    if (c == 'e') { eccInfo(); mode = 0; }
    if (c == 'x') { mode = 0; menu(); }
  }
  if (mode == 'a') accLive();
  if (mode == 'r') { while (GPSSerial.available()) Serial.write(GPSSerial.read()); }
  else while (GPSSerial.available()) gps.encode(GPSSerial.read());
  if (mode == 'g') {
    static uint32_t t = 0;
    if (millis() - t > 1000) {
      t = millis();
      Serial.printf("GPS %lu baud · sats %lu · fix %s · %.6f, %.6f · HDOP %.1f · %02d:%02d:%02d UTC · ok %lu / err %lu\n",
                    gpsBaud, gps.satellites.value(), gps.location.isValid() ? "YES" : "no",
                    gps.location.lat(), gps.location.lng(), gps.hdop.hdop(),
                    gps.time.hour(), gps.time.minute(), gps.time.second(), gps.passedChecksum(), gps.failedChecksum());
    }
  }
  delay(mode == 'a' ? 5 : 1);
}
