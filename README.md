# Custody Tracker

Group project for 30518 Introduction to Blockchain (Bocconi).

**The black box for physical objects.** A chip attached to an object (a bike, a camera, a rental car) measures shocks and location, signs the measurements with a key that never leaves the secure element, and writes them to a public ledger that none of the parties controls. First use case: rentals with collateral, settled automatically by the contract based on what the object recorded. Full vision and why a blockchain is needed: [`docs/VISION.md`](docs/VISION.md).

Technically: ESP32 + ADXL375 + GPS + ATECC608 (ECDSA P-256) → Merkle root of each batch signed by the device → untrusted relayer → `CustodyLog` on Base Sepolia (on-chain P-256 verification, two-signature chain of custody) → `RentalEscrow` (collateral and deduction by shock level).

```
firmware/BringUp/          test the components one at a time (I2C, ADXL375, GPS, ATECC608)
firmware/CustodyTracker/   full firmware: readings → Merkle root → signature → POST to the relayer
contracts/CustodyLog.sol   registry: devices, objects, two-signature custody handovers, signed batches, Merkle proofs
contracts/RentalEscrow.sol rental collateral: deposit, automatic deduction by shock level
contracts/DemoUSD.sol      fake stablecoin for the testnet
lib/protocol.mjs           record format, Merkle tree and digest (identical to firmware and contract)
relayer/                   HTTP server that anchors the batches, minimal dashboard, simulated device
test/                      contract tests
docs/HARDWARE.md           wiring and 2-hour build
docs/API.md                relayer API for the frontend
docs/DESIGN.md             thesis, protocol choices, limits, division of work
docs/STATUS.md             current status, on-chain addresses, what's missing, who does what
docs/VISION.md             THE VISION: the black box for objects, why blockchain, limits, demo. Start here
docs/CALIBRATION.md        accelerometer calibration and light/medium/strong thresholds
docs/AGENT_PROMPT.md       prompt to give your own AI agent to work on the project
```

**New to the group?** Open `docs/AGENT_PROMPT.md` and follow the instructions.

## Quick start (no hardware)

```bash
npm install
npx hardhat test
npx hardhat node                                          # terminal 1
npx hardhat run scripts/deploy.mjs --network localhost    # terminal 2
npm run relayer                                           # terminal 2 → http://localhost:8787
node relayer/simulate.mjs --batches 1                     # terminal 3: the simulated device registers the object
# dashboard: "Unlock: Alice", then:
node relayer/simulate.mjs --batches 2 --drop 2            # drop during the rental
# dashboard: "Return & settle" → the contract withholds the fee and returns the rest
```

## Frontend

The dashboard in `relayer/public/` is deliberately minimal. A real web app is built on top of `docs/API.md`, or by reading the contract events directly.

## Base Sepolia

```bash
# .env (git-ignored) with PRIVATE_KEY=0x... of a key created only for this project
npm run deploy:base
npm run relayer:base
```

Use a key created only for this project and funded from a faucet. Never commit it: `.env` and `data/` are already git-ignored.
