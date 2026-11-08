# Relayer API (for the web app)

The relayer (`npm run relayer` locally, `npm run relayer:base` on Base Sepolia; port 8787, open CORS) is the only backend. The web app reads from here or, better, directly from the contracts. The ABIs are in `artifacts/contracts/<Name>.sol/<Name>.json` after `npx hardhat compile`, the addresses in `deployments/<network>.json` (`address` = CustodyLog, `escrow`, `token`).

## `GET /api/state`

State of the most recent object (one device = one object).

```json
{
  "network": "baseSepolia", "chainId": 84532, "explorer": "https://sepolia.basescan.org",
  "contract": "0x…",
  "contracts": { "custodyLog": "0x…", "escrow": "0x…", "token": "0x…" },
  "roles": { "owner": "0x…", "alice": "0x…", "bob": "0x…" },
  "terms": { "collateral": "50", "lightCg": 800, "mediumCg": 3000, "strongCg": 8000,
             "lightBps": 1000, "mediumBps": 4000, "strongBps": 10000 },
  "shipment": { "id": 1, "custodian": "alice", "qx": "0x…", "qy": "0x…" },
  "onchain": { "custodian": "0x…", "custodianRole": "alice", "lastSeq": "7", "damaged": true, "period": 1 },
  "rental": { "renter": "alice", "period": 1, "collateral": "50", "peakCg": 4118, "tier": 2 },
  "balances": { "owner": "20", "alice": "980", "bob": "1000" },
  "settlements": [{
    "shipmentId": 1, "renter": "alice", "period": 1, "peakCg": 4118, "tier": 2,
    "fee": "20", "refund": "30", "tx": "0x…", "at": 1794160889870
  }],
  "batches": [{
    "shipmentId": 1, "seq": 7, "root": "0x…", "maxPeakCg": 4118, "hw": false, "custodian": "alice",
    "tx": "0x…", "gasUsed": "147458", "at": 1794160880000,
    "records": ["0x…19 byte…"],
    "decoded": [{ "n": 190, "t": 1794141338, "lat": 45.4505, "lon": 9.189, "peakCg": 4118, "flags": 7 }]
  }],
  "maxCg": 800,
  "relayerBalance": "0.00004"
}
```

- `rental` is `null` if the object is available (custodian = owner).
- `tier`: 0 none, 1 light, 2 medium, 3 strong.
- `peakCg` is in hundredths of a g (4118 = 41.2 g), gravity included: at rest it is about 100.
- dUSD amounts are already converted to units (6 decimals on-chain).
- `flags` is a bit field: bit0 = GPS fix, bit1 = shock over threshold, bit2 = time taken from GPS.
- `explorer` is null locally.

## `POST /api/rental/start`  `{"renter": "alice" | "bob"}`

Unlocking the object: the owner proposes the handover, the renter accepts, then deposits the collateral (if needed, dUSD is first minted with `faucet()`). That is 4–6 transactions: on Base Sepolia it takes 10–30 s. Response: `{ renter, propose, accept, deposit }` (transaction hashes).

## `POST /api/rental/end`

Return and settlement: the renter proposes the return to the owner, the owner accepts, then `endRental` settles the collateral. Response: the same object as in `settlements[]`.

## `GET /api/proof?seq=<seq>&i=<index>`

Merkle proof of a single reading and the result of `verifyReading` on the contract.

```json
{ "record": "0x…", "decoded": { … }, "proof": ["0x…"], "root": "0x…", "verifiedOnChain": true }
```

## `POST /batch`

Endpoint used by the device, not by the web app. The format is in `lib/protocol.mjs`.

## On-chain events useful for the web app

- `CustodyLog`: `ShipmentCreated(id, deviceId, shipper, carrier, receiver)`, `HandoffProposed(id, from, to)`, `CustodyTransferred(id, from, to)`, `BatchAnchored(id, seq, root, maxPeakCg, custodian)`, `DamageDetected(id, seq, peakCg, custodian)`.
- `RentalEscrow`: `TermsSet(id, collateral, lightCg, mediumCg, strongCg)`, `RentalStarted(id, renter, period, amount)`, `RentalSettled(id, renter, period, peakCg, tier, fee, refund)`.

Useful reads: `CustodyLog.custodyPeriod(id)`, `CustodyLog.periodMaxPeakCg(id, period)`, `RentalEscrow.rentals(id)`, `RentalEscrow.terms(id)`, `RentalEscrow.tierOf(id, peakCg)`.
