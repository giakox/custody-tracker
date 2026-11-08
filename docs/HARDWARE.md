# Hardware — 2-hour build

Goal: by the end of the 2 hours, the device hit on the table produces a signed batch, anchored on-chain and visible in the dashboard.

## Components

| # | Component | Role | ESP32 bus / pin |
|---|---|---|---|
| 1 | ELEGOO ESP32-WROOM-32 (USB-C) | MCU, WiFi to the hotspot | — |
| 2 | HGLRC M100 Mini (u-blox M10) | position and UTC time | UART2: GPS TX → GPIO33 (D33), GPS RX → GPIO32 (D32), 5V, GND. Never on RX0/TX0: they are the USB |
| 3 | ADXL375 (±200 g, 49 mg/LSB) | shocks and drops | I2C #0: SDA → GPIO21, SCL → GPIO22, **VCC and VS → 3V3**, GND, **CS → 3V3, SDO → GND** (0x53). INT1/INT2 disconnected |
| 4 | Adafruit ATECC608 (4314) | ECDSA P-256 signing, the key never leaves the chip | I2C #1: SDA → **GPIO25**, SCL → **GPIO26**, 3V3, GND (0x60) |
| 5 | STEMMA QT ↔ Dupont cables | connect the ATECC608 | red V+, black GND, blue SDA, yellow SCL |
| 6–8 | 2000 mAh LiPo + TP4056 + 5 V boost | standalone power | LiPo → TP4056 B+/B−, OUT+/OUT− → boost IN, boost 5V → ESP32 5V/VIN |
| 9 | Breadboard + jumpers | prototyping | — |

Why two I2C buses: the ATECC608 signature holds the bus for about 60 ms. If the ADXL375 and ATECC608 shared a bus, a shock arriving during signing would be lost. The ESP32 has two I2C controllers, so it is enough to move two wires.

Why VS: the chip has two supplies, VS for the sensor and VDDIO (VCC) for the interface. With only VCC the I2C pull-ups are powered but the sensor is off: the bus looks fine and nothing answers. This is the fault we had at the first bring-up.

Why CS and SDO: with CS high the ADXL375 stays in I2C mode, with SDO to ground it answers at address 0x53. Left floating, the chip may not respond or may move to 0x1D.

## Schematic

```
                 ┌──────────── ESP32 (ELEGOO) ────────────┐
 GPS M100  5V ───┤ 5V/VIN                         3V3 ├─── VCC+VS+CS ADXL375, V+ ATECC608
           GND ──┤ GND                            GND ├─── GND ADXL375, SDO ADXL375, GND ATECC608
           TX ───┤ GPIO33 (D33)            GPIO21 SDA ├─── SDA ADXL375
           RX ───┤ GPIO32 (D32)            GPIO22 SCL ├─── SCL ADXL375
                 │                         GPIO25 SDA ├─── SDA ATECC608 (blue)
                 │                         GPIO26 SCL ├─── SCL ATECC608 (yellow)
                 └────────────────────────────────────┘
```

The ESP32's 5V pin comes from the USB through a diode, so it arrives at about 4.7 V: this is fine for the GPS, which has its own regulator.

## Checkpoint plan

### 0:00–0:20 · Wiring, USB only

- Mount the ESP32 straddling the central groove of the breadboard and bring 3V3 and GND to the side rails.
- Connect the ADXL375 and ATECC608 as in the table. For the ADXL375 remember **CS → 3V3 and SDO → GND**.
- Connect the GPS last. The GPS TX goes to the ESP32's RX pin: a frequent mistake is connecting TX to TX.
- No battery for now.

### 0:20–0:40 · Component bring-up, one at a time

```bash
arduino-cli board list          # find the port, usually /dev/cu.usbserial-XXXX or /dev/cu.wchusbserial-XXXX
arduino-cli upload  --fqbn esp32:esp32:esp32 -p <port> firmware/BringUp
arduino-cli monitor -p <port> -c baudrate=115200
```

If the upload hangs on `Connecting....`, hold BOOT until it starts.

At startup the sketch runs these checks on its own:

| Expected line | If you don't see it |
|---|---|
| `I2C#0 GPIO21/22 (expected 0x53)` | check swapped SDA/SCL, 3V3, CS and SDO |
| `I2C#1 GPIO25/26 (expected 0x60)` | check the STEMMA cable (blue = SDA) and that V+ is connected |
| `ADXL375 DEVID: 0xE5 ok` | if the scan sees 0x1D, SDO is not grounded; if it sees nothing but the pin probe says D21/D22 "pulled up externally", **VS** is missing or CS is not at 3V3 |
| `GPS: valid NMEA at N baud` (our M100 runs at 115200) | if the received characters are 0, TX/RX are swapped or 5V is missing; if there are characters but no valid NMEA, the baud rate is unusual: use `r` to see the raw stream |
| `ATECC608: serial … unlocked` | if it says "not responding", check bus #1 |

Then the interactive commands:
- `a` prints live acceleration. At rest it should read about 1 g (±0.4 g is normal for the factory offset). A sharp knock on the table should exceed 15 g.
- `g` shows the GPS status. Near a window or outdoors the fix arrives in about 30–60 s from cold; indoors, away from windows, it may never arrive.

**Checkpoint 1:** all five lines ok, and the accelerometer reacts to the knock.

### 0:40–1:10 · Full firmware + blockchain locally

Terminal 1:
```bash
npm install
npx hardhat node
```

Terminal 2:
```bash
npx hardhat run scripts/deploy.mjs --network localhost
npm run relayer        # prints the URL to use for the device
```

- On the iPhone turn on the hotspot with **"Maximize Compatibility"**: the ESP32 only sees 2.4 GHz networks.
- Also connect the Mac to the hotspot and restart the relayer, so it prints the right IP (usually `172.20.10.x`).
- In `firmware/CustodyTracker/config.h` set `WIFI_SSID`, `WIFI_PASS` and `RELAYER_URL`. The file is git-ignored because it contains the hotspot password; if it is missing, copy it from `config.example.h`.

```bash
arduino-cli upload --fqbn esp32:esp32:esp32 -p <port> firmware/CustodyTracker
arduino-cli monitor -p <port> -c baudrate=115200
```

Expected every 16 s: `batch seq N · 16 readings · signed (sw)` followed by `✓ anchored`. The batch appears at http://localhost:8787.

**Checkpoint 2:** after "Unlock: Alice" on the dashboard, a knock on the table closes the batch immediately and the shock appears attributed to Alice; "Return & settle" then withholds the fee for that shock level.

### 1:10–1:30 · Secure element

In the main firmware's Serial Monitor type `PROVISION`.

> **Warning: this is irreversible.** It writes the default TLS configuration into the ATECC608 and locks it, then generates the private key in slot 0. The key never leaves the chip.

After the reboot, `INFO` must show `signer: ATECC608 (slot 0)` and the dashboard no longer shows "(sw)". The device now has a new key, i.e. a new identity: the relayer registers it again and opens a new shipment. This is the correct behavior.

**Checkpoint 3:** hardware-signed batches accepted on-chain.

### 1:30–2:00 · Battery and box

1. Connect the boost to the TP4056's USB with no load and measure the output: it must read 5.0 V.
2. Connect LiPo → TP4056 (B+/B−), then OUT+/OUT− → boost IN.
3. Connect the boost's 5V output to the ESP32's 5V/VIN and join the grounds.
4. Do not keep USB and boost connected together: when flashing, disconnect the boost.
5. To charge the LiPo use a USB-A → C cable. Cheap TP4056 boards lack the resistors on the CC pins and do not charge with a C↔C cable: that is why there is the 5.1 kΩ adapter.
6. Put everything in a box, fixing the ADXL375 rigidly to the wall with thick double-sided tape. If the sensor rests on foam, the foam absorbs the peak and the measurement comes out lower.

**Checkpoint 4:** standalone device in the box, on battery, connected to the hotspot. A drop of the box from 30–50 cm must record the damage.

## Power consumption (estimate, to be measured)

Consumption is dominated by the always-on WiFi: ESP32 about 100–160 mA on average, GPS M10 about 25–30 mA in tracking, ADXL375 and ATECC608 negligible. With the 2000 mAh LiPo the estimated runtime is **12–15 hours**. That is more than enough for a demo. A real product would use modem-sleep and less frequent uploads.
