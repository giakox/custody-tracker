
# Custody Tracker — design and pitch

The thesis, why a blockchain, the limits and the demo are in `docs/VISION.md`. This file collects the technical choices, to answer the professor's questions.

## Protocol choices (for the professor's questions)

- **Record** of 19 bytes: `n | t | latE7 | lonE7 | peakCg | flags`. The flags indicate GPS fix, shock over threshold and time taken from GPS.
- **Merkle SHA-256** with domain separation: leaf `0x00‖rec`, node `0x01‖l‖r`. The odd node is promoted without being duplicated, which avoids the Bitcoin-style second preimage (CVE-2012-2459).
- **Signed digest:** `sha256("CLv1"‖deviceId‖seq‖root‖count‖maxPeakCg‖tStart‖tEnd)`. `deviceId = sha256(Qx‖Qy)`: the device's identity is its public key.
- **On-chain verification:** OpenZeppelin's `P256.verify`, which uses the RIP-7212 precompile where available and a Solidity fallback otherwise. OZ accepts only low-s signatures, so the relayer normalizes `s → n − s` (an ECDSA signature stays valid). This is not a security issue because replay is blocked by `seq`.
- **Sampling:** ADXL375 at 1600 Hz in FIFO stream mode, drained every 5 ms by a FreeRTOS task. The per-second peak is the maximum magnitude. One reading per second, batches of 16 or immediate closure after a shock.
- **`seq`** is currently a counter in NVS. Possible upgrade: the ATECC's hardware monotonic counter, so the seq cannot be rolled back even by rewriting the flash.

## Collateral (RentalEscrow)

- **Custody periods:** `CustodyLog.custodyPeriod(id)` increases with every accepted handover; `periodMaxPeakCg(id, period)` holds the maximum peak of that period. One rental = one period, so one renter's shock cannot weigh on the next, and the escrow does not have to iterate over the batches.
- **Settlement without an arbiter:** `endRental` can be called by anyone, but only after custody has passed to someone else (`StillInCustody`). The outcome depends only on thresholds fixed before the unlock and on the batches signed by the device.
- **Terms locked during the rental:** the owner cannot change thresholds or deductions while a rental is active (`RentalActive`).
- **Token:** `DemoUSD`, a 6-decimal ERC-20 like USDC, freely mintable: it is for the testnet only. In production: USDC on Base.

## Measured numbers

- Gas per 16-reading batch: ~120k with `CustodyLog` alone, ~145k after adding the per-period peak (one extra storage write).
- Cost on Base Sepolia (8 November 2026): ~145k gas × 0.006 gwei ≈ 8.7·10⁻⁷ ETH per batch, L1 data fee negligible. Testnet gas price: on the slides it should be presented as an order of magnitude.
