#pragma once
// ---- edit these ----
#define WIFI_SSID     "iPhone di Giacomo"      // phone hotspot (2.4 GHz!)
#define WIFI_PASS     "password-hotspot"
#define RELAYER_URL   "http://172.20.10.2:8787/batch"  // Mac IP on the hotspot: the relayer prints it at startup

// ---- pin (ELEGOO ESP32-WROOM-32) ----
#define GPS_RX_PIN    33   // ESP32 D33  <- TX del GPS
#define GPS_TX_PIN    32   // ESP32 D32  -> RX del GPS
#define ACC_SDA       21   // I2C bus #0: ADXL375 only (continuous sampling)
#define ACC_SCL       22
#define SE_SDA        25   // I2C bus #1: ATECC608 only (signing holds the bus ~60 ms)
#define SE_SCL        26
#define LED_PIN       2    // on-board blue LED

// ---- parameters ----
#define RECORD_MS        1000   // one reading per second
#define BATCH_SIZE       16     // readings per Merkle root (batch closed early on a shock)
#define SHOCK_CG         1500   // local shock threshold: 15 g (same threshold as the on-chain shipment)
#define ACC_ODR_CODE     0x0E   // BW_RATE ADXL375: 0x0D=800 Hz, 0x0E=1600 Hz, 0x0F=3200 Hz
#define ACC_MG_PER_LSB   49     // ADXL375: 49 mg/LSB
