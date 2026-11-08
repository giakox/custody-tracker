# API del relayer (per la web app)

Il relayer (`npm run relayer` in locale, `npm run relayer:base` su Base Sepolia; porta 8787, CORS aperto) è l'unico backend. La web app legge da qui oppure, meglio, direttamente dai contratti. Gli ABI sono in `artifacts/contracts/<Nome>.sol/<Nome>.json` dopo `npx hardhat compile`, gli indirizzi in `deployments/<rete>.json` (`address` = CustodyLog, `escrow`, `token`).

## `GET /api/state`

Stato del bene più recente (un device = un bene).

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

- `rental` è `null` se il bene è disponibile (custode = proprietario).
- `tier`: 0 nessuno, 1 leggero, 2 medio, 3 forte.
- `peakCg` è in centesimi di g (4118 = 41,2 g), gravità inclusa: da fermo vale circa 100.
- Importi dUSD già convertiti in unità (6 decimali on-chain).
- `flags` è un campo di bit: bit0 = fix GPS, bit1 = urto oltre soglia, bit2 = ora presa dal GPS.
- `explorer` è null in locale.

## `POST /api/rental/start`  `{"renter": "alice" | "bob"}`

Sblocco del bene: il proprietario propone il passaggio, il cliente accetta, poi deposita il collaterale (se serve, prima si conia dUSD con `faucet()`). Sono 4–6 transazioni: su Base Sepolia richiede 10–30 s. Risposta: `{ renter, propose, accept, deposit }` (hash delle transazioni).

## `POST /api/rental/end`

Riconsegna e regolamento: il cliente propone il ritorno al proprietario, il proprietario accetta, poi `endRental` regola il collaterale. Risposta: lo stesso oggetto di `settlements[]`.

## `GET /api/proof?seq=<seq>&i=<indice>`

Merkle proof di una singola lettura e risultato di `verifyReading` sul contratto.

```json
{ "record": "0x…", "decoded": { … }, "proof": ["0x…"], "root": "0x…", "verifiedOnChain": true }
```

## `POST /batch`

Endpoint usato dal device, non dalla web app. Il formato è in `lib/protocol.mjs`.

## Eventi on-chain utili per la web app

- `CustodyLog`: `ShipmentCreated(id, deviceId, shipper, carrier, receiver)`, `HandoffProposed(id, from, to)`, `CustodyTransferred(id, from, to)`, `BatchAnchored(id, seq, root, maxPeakCg, custodian)`, `DamageDetected(id, seq, peakCg, custodian)`.
- `RentalEscrow`: `TermsSet(id, collateral, lightCg, mediumCg, strongCg)`, `RentalStarted(id, renter, period, amount)`, `RentalSettled(id, renter, period, peakCg, tier, fee, refund)`.

Letture utili: `CustodyLog.custodyPeriod(id)`, `CustodyLog.periodMaxPeakCg(id, period)`, `RentalEscrow.rentals(id)`, `RentalEscrow.terms(id)`, `RentalEscrow.tierOf(id, peakCg)`.
