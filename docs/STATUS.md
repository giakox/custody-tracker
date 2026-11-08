# Project status and handover

Updated November 8, 2026. This file is for anyone joining the project now: it says what already works, what is missing for the exam demo, and what could be added. What we want to tell and why is in `docs/VISION.md`: read it first.

## What already works

The full path works from sensor to contract, collateral included.

| Component | Status | Evidence |
|---|---|---|
| ESP32 + ADXL375 | ✅ | DEVID 0xE5, about 1700 samples/s, ~1 g at rest |
| GPS M100 | ✅ | NMEA at 115200 baud, fix with UTC time |
| ATECC608 | ✅ responds, ⏸ **not provisioned** | serial number read; signatures still use a software key (see below) |
| Full firmware | ✅ | batches of 16 readings signed every 16 s, sent via iPhone hotspot |
| Battery power | ✅ | 2000 mAh LiPo → TP4056 → 5 V boost → ESP32, standalone device |
| `CustodyLog` contract | ✅ | batches anchored, P-256 signature verified on-chain, maximum peak per custody period |
| Shock detection (real device) | ✅ | hit on the table → batch closed immediately, 223 g peak, attributed to the custodian |
| `RentalEscrow` contract + `DemoUSD` token | ✅ | rental with collateral: deposit at unlock, automatic fee withheld at the end of the rental. Tested locally and on Base Sepolia (with a simulated device) |
| Relayer + minimal dashboard | ✅ | `npm run relayer` → http://localhost:8787, buttons "Unlock: Alice/Bob" and "Return & settle" |
| Contract tests | ✅ | `npx hardhat test` (7 tests) |

**Secure element deliberately not provisioned.** `PROVISION` locks the ATECC608 configuration forever. As long as the protocol may still change, batches are signed with a software key in NVS (`hw: false` in the API). We will do it before the demo. The rest of the system does not change: the device just gets a new identity.

## How the on-chain rental works

1. The device registers itself on its first batch: it becomes an **object** (`createShipment` with the owner as first custodian and no final recipient) and the owner sets the terms in `RentalEscrow.setTerms`.
2. **Unlock:** the owner proposes the handoff, the renter accepts (two signatures), then the renter deposits the collateral (`startRental`). The rental covers that **custody period** (`custodyPeriod`, +1 on every accepted handoff).
3. During the rental, `CustodyLog` keeps the **maximum peak of the period** (`periodMaxPeakCg`).
4. **Return:** the renter proposes, the owner accepts, then **anyone** calls `endRental`. The contract reads the period's peak, picks the level and pays out: fee to the owner, the rest to the renter (event `RentalSettled`).

Current terms (provisional, to be calibrated with `docs/CALIBRATION.md`): collateral 50 dUSD; thresholds 8 / 30 / 80 g (peak including gravity) → fee withheld 10% / 40% / 100%.

Result of the test on Base Sepolia: simulated drop at 41.2 g → medium level → 20 dUSD to the owner, 30 returned ([transaction](https://sepolia.basescan.org/tx/0x67fc66e4cfa258ff14f25c2f7c10930f79e291dbf54726c09ca7d42b2f6546cd)).

## Base Sepolia (public testnet)

Addresses also in `deployments/baseSepolia.json`.

- `CustodyLog`: [`0x0c91b997543aabe4f7b644b76b47e00ab33232eb`](https://sepolia.basescan.org/address/0x0c91b997543aabe4f7b644b76b47e00ab33232eb)
- `RentalEscrow`: [`0xe8c69ec81b8be17350e9238d9912f8e980e18eda`](https://sepolia.basescan.org/address/0xe8c69ec81b8be17350e9238d9912f8e980e18eda)
- `DemoUSD` (fake stablecoin, 6 decimals, open `faucet()`): [`0xa750f021e6f9254fb8c30aab66404341a372b58c`](https://sepolia.basescan.org/address/0xa750f021e6f9254fb8c30aab66404341a372b58c)
- Relayer / object owner: [`0xDD15B25f8b1E18482d491992298844e54E50FC35`](https://sepolia.basescan.org/address/0xDD15B25f8b1E18482d491992298844e54E50FC35). The key is only in Giacomo's `.env`.
- Start: `npm run relayer:base` (same port 8787, the firmware does not change).
- **Measured cost per batch** (16 readings, on-chain P-256 verification): about 145,000 gas × 0.006 gwei ≈ **8.7·10⁻⁷ ETH**; the L1 data fee is negligible. A complete rental (unlock + return + settlement) costs about 6 more transactions of the same order. The testnet gas price is not the mainnet one: in the slides it should be presented as an order of magnitude.
- **Budget:** about 0.00004 ETH left, i.e. roughly fifty batches. **Before the demo we need at least 0.005 ETH from the faucet.** Turn the relayer off when it is not needed.

The first deploy (`CustodyLog` only, `0xa4ae…7f91`) stays on-chain as history but is no longer used.

## What is missing for the exam demo

| # | What | Who | Notes |
|---|---|---|---|
| 1 | **Web app** | Edoardo | read `docs/AGENT_PROMPT.md` |
| 2 | **3D case** for the device | Edoardo (printed by his father) | **rigid** mounting of the ADXL375 to the wall; room for battery, TP4056, boost; access to the USB-C port for charging and flashing |
| 3 | **"Why blockchain"**: comparison table and answers to objections | to be assigned | foundation already in `docs/VISION.md` §4 |
| 4 | **Market**: international car rental, sharing, second-hand, parametric insurance, with sources | to be assigned | |
| 5 | **Drop tests** and threshold calibration | Giacomo + whoever is in Milan | procedure in `docs/CALIBRATION.md` |
| 6 | **PROVISION ATECC608** | Giacomo | once the protocol is frozen |
| 7 | **Test ETH** for the demo | Giacomo | Base Sepolia faucet |
| 8 | **Demo video** (plan B) | everyone | same script as the live demo |
| 9 | **Presentation** (last, with photos of the web app and the device in its case) | everyone | about 7 minutes |

### Live demo script (about 90 s)

1. Dashboard or web app open: the object is **available**, batches arrive every 16 s.
2. **Unlock: Alice** → 50 dUSD locked in the contract, Alice is the on-chain custodian.
3. The box is dropped: the shock appears, attributed to **Alice**, with the transaction on basescan.
4. **Return & settle** → the contract withholds the fee and returns the rest, on its own.
5. **Unlock: Bob**, no shock, return → Bob gets everything back: Alice's shock does not count against him.
6. Click on a reading and show the **Merkle proof** verified by the contract.

## For whoever builds the web app

Read `docs/API.md` and `docs/AGENT_PROMPT.md`. In short:

- **Source of truth = the contracts.** The web app reads events directly from Base Sepolia (public RPC `https://sepolia.base.org`):
  - `CustodyLog`: `ShipmentCreated`, `HandoffProposed`, `CustodyTransferred`, `BatchAnchored`, `DamageDetected`;
  - `RentalEscrow`: `TermsSet`, `RentalStarted`, `RentalSettled`.
  
  This way it also works when published online and demonstrates the point of the project: there is no need to trust our server.
- **The relayer is needed for three things:** raw readings (location, peak per second: on-chain there is only the root), Merkle proofs (`GET /api/proof`) and the demo buttons (`POST /api/rental/start`, `POST /api/rental/end`). Locally it runs on `:8787` with open CORS. For a published web app it must be exposed through a tunnel (e.g. `cloudflared tunnel --url http://localhost:8787`).
- **Demo roles:** owner (relayer), Alice and Bob, with the keys held by the relayer. More convincing version: the renter signs `acceptHandoff` and `startRental` from their own wallet (MetaMask).
- **ABI:** `artifacts/contracts/<Name>.sol/<Name>.json` after `npx hardhat compile`.
- **Terminology:** in the code, objects are still called `shipment` for historical reasons. Object = shipment; renter = custodian of the period; owner = `shipper`.
- **Units:** `peakCg` is in hundredths of a g (4210 = 42.1 g); dUSD amounts have 6 decimals.

## Known issues and pitfalls

- **Local chain restart:** `npx hardhat node` starts again from scratch. After a restart, redo the deploy: the relayer recognizes the new contracts and restarts from zero on its own.
- **iPhone hotspot:** "Maximize Compatibility" is required, because the ESP32 only sees 2.4 GHz networks, and the Mac must be on the same hotspot. The Mac tends to go back to the home WiFi: turn off "Auto-Join" on that network. If the Mac's IP changes (usually `172.20.10.x`), `RELAYER_URL` in `config.h` must be updated and the firmware reflashed.
- **Stuck relayer:** if a transaction hangs (e.g. the Mac switches network), the relayer drops it after 90 s instead of blocking all subsequent batches. Symptom on the device: `✗ relayer -11` (read timeout).
- **Device queue:** if the relayer is unreachable, the device keeps at most 6 batches; the oldest are discarded. The contract accepts gaps in `seq`, but lost batches stay lost.
- **Shock straddling the return:** a batch sent after the return is attributed to the owner. The device closes the batch immediately after a shock, so in practice it arrives first, but a product would need a margin (return confirmed only after the next batch).
- **Saturation:** the ADXL375 reaches ±200 g per axis. A reported peak above 200 g (magnitude over 3 axes) means saturation: the true value is at least that.

## Possible extensions (after the minimal demo)

**Low effort, high impact**
- **Unlock from the wallet:** the renter uses their own MetaMask account instead of keys in the relayer. It is the most concrete proof of "nobody controls it alone".
- **Public object page:** history of all rentals and shocks, verifiable, reachable from a QR code on the object.
- **Chart of peaks over time** with the three thresholds drawn and the unlock and return moments marked.

**Medium effort**
- **Parametric policy:** a second contract that automatically pays the owner a compensation when `RentalSettled` reports a strong level.
- **Temperature and tilt** (SHT40 sensor on the same STEMMA QT cable) for delicate objects.
- **Data availability:** raw readings on IPFS or Arweave, with the CID in the event. This way the proof does not depend on our relayer.
- **`seq` on the ATECC608 hardware counter**, so it cannot be rolled back even by rewriting the ESP32 flash.

**To present as "to go to production" (honest limitations)**
- **The secure element protects the key, not the truth of the measurement.** With the default configuration the chip signs any digest it receives: whoever replaces the ESP32 firmware can have false readings signed. Mitigations: secure boot and flash encryption on the ESP32, an enclosure that shows tampering, and an ATECC configuration with authorized signing (IO protection key), which requires a new chip.
- **No manufacturer attestation:** the contract trusts any public key that gets registered, so `hw: true` is a claim by the device. In production: chips pre-configured by Microchip (e.g. ATECC608-TNGTLS) with a manufacturer certificate, verified on-chain with the same `P256.verify`.
- **Power consumption:** today WiFi is always on, about 12–15 h of battery life. In a product: modem-sleep, sending every N minutes, LTE-M/NB-IoT or Bluetooth to the renter's phone.
