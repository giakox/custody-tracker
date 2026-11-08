#pragma once
// ---- da modificare ----
#define WIFI_SSID     "iPhone di Giacomo"      // hotspot del telefono (2,4 GHz!)
#define WIFI_PASS     "password-hotspot"
#define RELAYER_URL   "http://172.20.10.2:8787/batch"  // IP del Mac sull'hotspot: lo stampa il relayer all'avvio

// ---- pin (ELEGOO ESP32-WROOM-32) ----
#define GPS_RX_PIN    33   // ESP32 D33  <- TX del GPS
#define GPS_TX_PIN    32   // ESP32 D32  -> RX del GPS
#define ACC_SDA       21   // bus I2C #0: solo ADXL375 (campionamento continuo)
#define ACC_SCL       22
#define SE_SDA        25   // bus I2C #1: solo ATECC608 (la firma tiene il bus ~60 ms)
#define SE_SCL        26
#define LED_PIN       2    // LED blu on-board

// ---- parametri ----
#define RECORD_MS        1000   // una lettura al secondo
#define BATCH_SIZE       16     // letture per Merkle root (batch chiuso prima se c'è un urto)
#define SHOCK_CG         1500   // soglia locale di urto: 15 g (stessa soglia della spedizione on-chain)
#define ACC_ODR_CODE     0x0E   // BW_RATE ADXL375: 0x0D=800 Hz, 0x0E=1600 Hz, 0x0F=3200 Hz
#define ACC_MG_PER_LSB   49     // ADXL375: 49 mg/LSB
