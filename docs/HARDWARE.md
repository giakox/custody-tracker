# Hardware — build in 2 ore

Obiettivo: alla fine delle 2 ore il device colpito sul tavolo produce un batch firmato, ancorato on-chain e visibile nella dashboard.

## Componenti

| # | Componente | Ruolo | Bus / pin ESP32 |
|---|---|---|---|
| 1 | ELEGOO ESP32-WROOM-32 (USB-C) | MCU, WiFi verso l'hotspot | — |
| 2 | HGLRC M100 Mini (u-blox M10) | posizione e ora UTC | UART2: GPS TX → GPIO33 (D33), GPS RX → GPIO32 (D32), 5V, GND. Mai su RX0/TX0: sono la USB |
| 3 | ADXL375 (±200 g, 49 mg/LSB) | urti e cadute | I2C #0: SDA → GPIO21, SCL → GPIO22, **VCC e VS → 3V3**, GND, **CS → 3V3, SDO → GND** (0x53). INT1/INT2 scollegati |
| 4 | Adafruit ATECC608 (4314) | firma ECDSA P-256, la chiave non esce dal chip | I2C #1: SDA → **GPIO25**, SCL → **GPIO26**, 3V3, GND (0x60) |
| 5 | Cavi STEMMA QT ↔ Dupont | collegano l'ATECC608 | rosso V+, nero GND, blu SDA, giallo SCL |
| 6–8 | LiPo 2000 mAh + TP4056 + boost 5 V | alimentazione autonoma | LiPo → TP4056 B+/B−, OUT+/OUT− → boost IN, boost 5V → ESP32 5V/VIN |
| 9 | Breadboard + jumper | prototipazione | — |

Perché due bus I2C: la firma dell'ATECC608 tiene il bus per circa 60 ms. Se ADXL375 e ATECC608 condividessero il bus, l'urto arrivato durante la firma andrebbe perso. L'ESP32 ha due controller I2C, quindi basta spostare due fili.

Perché VS: il chip ha due alimentazioni, VS per il sensore e VDDIO (VCC) per l'interfaccia. Con solo VCC i pull-up I2C sono alimentati ma il sensore è spento: il bus sembra a posto e non risponde nessuno. È il guasto che abbiamo avuto al primo bring-up.

Perché CS e SDO: con CS alto l'ADXL375 resta in modalità I2C, con SDO a massa risponde all'indirizzo 0x53. Lasciati flottanti, il chip può non rispondere o spostarsi su 0x1D.

## Schema

```
                 ┌──────────── ESP32 (ELEGOO) ────────────┐
 GPS M100  5V ───┤ 5V/VIN                         3V3 ├─── VCC+VS+CS ADXL375, V+ ATECC608
           GND ──┤ GND                            GND ├─── GND ADXL375, SDO ADXL375, GND ATECC608
           TX ───┤ GPIO33 (D33)            GPIO21 SDA ├─── SDA ADXL375
           RX ───┤ GPIO32 (D32)            GPIO22 SCL ├─── SCL ADXL375
                 │                         GPIO25 SDA ├─── SDA ATECC608 (blu)
                 │                         GPIO26 SCL ├─── SCL ATECC608 (giallo)
                 └────────────────────────────────────┘
```

Il pin 5V dell'ESP32 viene dalla USB attraverso un diodo, quindi arriva a circa 4,7 V: va bene per il GPS, che ha un suo regolatore.

## Piano a checkpoint

### 0:00–0:20 · Cablaggio, solo USB

- Monta l'ESP32 a cavallo della scanalatura centrale della breadboard e porta 3V3 e GND sulle rail laterali.
- Collega ADXL375 e ATECC608 come nella tabella. Per l'ADXL375 ricorda **CS → 3V3 e SDO → GND**.
- Collega il GPS per ultimo. Il TX del GPS va sul pin RX dell'ESP32: un errore frequente è collegare TX con TX.
- Niente batteria per ora.

### 0:20–0:40 · Bring-up dei componenti, uno alla volta

```bash
arduino-cli board list          # trova la porta, di solito /dev/cu.usbserial-XXXX o /dev/cu.wchusbserial-XXXX
arduino-cli upload  --fqbn esp32:esp32:esp32 -p <porta> firmware/BringUp
arduino-cli monitor -p <porta> -c baudrate=115200
```

Se l'upload si blocca su `Connecting....`, tieni premuto BOOT finché non parte.

All'avvio lo sketch esegue da solo questi controlli:

| Riga attesa | Se non la vedi |
|---|---|
| `I2C#0 …: 0x53` | controlla SDA/SCL invertiti, 3V3, CS e SDO |
| `I2C#1 …: 0x60` | controlla il cavo STEMMA (blu = SDA) e che il V+ sia collegato |
| `ADXL375 DEVID: 0xE5 ok` | se lo scan vede 0x1D, SDO non è a massa; se non vede nulla ma la sonda pin dice D21/D22 "tirato su da fuori", manca **VS** o CS non è a 3V3 |
| `GPS: NMEA valido a N baud` (il nostro M100 va a 115200) | se i caratteri ricevuti sono 0, TX/RX sono invertiti o manca il 5V; se ci sono caratteri ma nessun NMEA valido, la velocità è insolita: usa `r` per vedere il flusso grezzo |
| `ATECC608: seriale … non bloccato` | se dice "non risponde", controlla il bus #1 |

Poi i comandi interattivi:
- `a` stampa l'accelerazione dal vivo. Da fermo deve leggere circa 1 g (±0,4 g è normale per l'offset di fabbrica). Un colpo secco sul tavolo deve superare 15 g.
- `g` mostra lo stato del GPS. Vicino a una finestra o all'aperto il fix arriva in circa 30–60 s a freddo; al chiuso, lontano dalle finestre, può non arrivare mai.

**Checkpoint 1:** tutte e cinque le righe ok, e l'accelerometro reagisce al colpo.

### 0:40–1:10 · Firmware completo + blockchain in locale

Terminale 1:
```bash
npm install
npx hardhat node
```

Terminale 2:
```bash
npx hardhat run scripts/deploy.mjs --network localhost
npm run relayer        # stampa l'URL da usare per il device
```

- Sull'iPhone attiva l'hotspot con **"Massimizza compatibilità"**: l'ESP32 vede solo le reti a 2,4 GHz.
- Collega anche il Mac all'hotspot e riavvia il relayer, così stampa l'IP giusto (di solito `172.20.10.x`).
- In `firmware/CustodyTracker/config.h` imposta `WIFI_SSID`, `WIFI_PASS` e `RELAYER_URL`. Il file è escluso da git perché contiene la password dell'hotspot; se non c'è, copialo da `config.example.h`.

```bash
arduino-cli upload --fqbn esp32:esp32:esp32 -p <porta> firmware/CustodyTracker
arduino-cli monitor -p <porta> -c baudrate=115200
```

Atteso ogni 16 s: `batch seq N · 16 letture · firmato (sw)` seguito da `✓ ancorato`. Su http://localhost:8787 compare il batch.

**Checkpoint 2:** un colpo sul tavolo chiude subito il batch, la dashboard mostra "DANNO REGISTRATO" e lo attribuisce al vettore A.

### 1:10–1:30 · Secure element

Nel Serial Monitor del firmware principale scrivi `PROVISION`.

> **Attenzione: è irreversibile.** Scrive la configurazione TLS di default nell'ATECC608 e la blocca, poi genera la chiave privata nello slot 0. La chiave non lascia mai il chip.

Dopo il riavvio, `INFO` deve mostrare `signer: ATECC608 (slot 0)` e la dashboard non mostra più "(sw)". Il device ha ora una nuova chiave, cioè una nuova identità: il relayer lo registra di nuovo e apre una nuova spedizione. È il comportamento corretto.

**Checkpoint 3:** batch firmati dall'hardware e accettati on-chain.

### 1:30–2:00 · Batteria e scatola

1. Collega il boost alla USB del TP4056 senza carico e misura l'uscita: deve dare 5,0 V.
2. Collega LiPo → TP4056 (B+/B−), poi OUT+/OUT− → IN del boost.
3. Collega l'uscita 5V del boost a 5V/VIN dell'ESP32 e unisci le masse.
4. Non tenere USB e boost collegati insieme: quando flashi, stacca il boost.
5. Per caricare la LiPo usa un cavo USB-A → C. I TP4056 economici non hanno le resistenze sui pin CC e con un cavo C↔C non caricano: per questo c'è l'adattatore da 5,1 kΩ.
6. Metti tutto in una scatola, fissando l'ADXL375 rigido alla parete con nastro biadesivo spesso. Se il sensore è appoggiato su gommapiuma, la gommapiuma assorbe il picco e la misura risulta più bassa.

**Checkpoint 4:** device autonomo nella scatola, a batteria, collegato all'hotspot. Una caduta della scatola da 30–50 cm deve registrare il danno.

## Consumi (stima, da misurare)

Il consumo è dominato dal WiFi sempre acceso: ESP32 circa 100–160 mA in media, GPS M10 circa 25–30 mA in tracking, ADXL375 e ATECC608 trascurabili. Con la LiPo da 2000 mAh l'autonomia stimata è di **12–15 ore**. Per una demo basta e avanza. In un prodotto reale si userebbero modem-sleep e invii meno frequenti.
