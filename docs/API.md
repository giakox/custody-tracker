# API del relayer (per il frontend)

Il relayer (`npm run relayer`, porta 8787, CORS aperto) è l'unico backend. Il frontend legge da qui, oppure direttamente dal contratto (ABI in `artifacts/contracts/CustodyLog.sol/CustodyLog.json` dopo `npx hardhat compile`).

## `GET /api/state`

Stato della spedizione più recente.

```json
{
  "network": "localhost", "chainId": 31337, "contract": "0x…", "explorer": null,
  "roles": { "carrierA": "0x…", "carrierB": "0x…", "receiver": "0x…" },
  "shipment": { "id": 1, "custodian": "carrierA", "qx": "0x…", "qy": "0x…" },
  "onchain": { "custodian": "0x…", "lastSeq": "12", "delivered": false, "damaged": true, "maxAllowedCg": 1500 },
  "maxCg": 1500,
  "batches": [{
    "shipmentId": 1, "seq": 12, "root": "0x…", "maxPeakCg": 4210, "hw": true, "custodian": "carrierA",
    "tx": "0x…", "gasUsed": "120143", "at": 1794141338000,
    "records": ["0x…19 byte…"],
    "decoded": [{ "n": 190, "t": 1794141338, "lat": 45.4505, "lon": 9.189, "peakCg": 4210, "flags": 7 }]
  }],
  "relayerBalance": "9999.99"
}
```

- `peakCg` è in centesimi di g: 4210 = 42,1 g.
- `flags` è un campo di bit: bit0 = fix GPS, bit1 = urto oltre soglia, bit2 = ora presa dal GPS.
- `explorer` è null in locale; su Base Sepolia contiene l'URL base per i link alle transazioni.

## `GET /api/proof?seq=<seq>&i=<indice>`

Restituisce la Merkle proof di una singola lettura e il risultato di `verifyReading` sul contratto.

```json
{ "record": "0x…", "decoded": { … }, "proof": ["0x…"], "root": "0x…", "verifiedOnChain": true }
```

## `POST /api/handoff`  `{"to": "carrierB" | "receiver"}`

Passa la custodia al ruolo indicato: il custode attuale propone, il nuovo accetta. In demo il relayer tiene le chiavi dei ruoli; in un'app reale ogni parte firmerebbe dal proprio wallet chiamando `proposeHandoff` e `acceptHandoff` sul contratto.

## `POST /batch`

Endpoint usato dal device, non dal frontend. Il formato è in `lib/protocol.mjs`.

## Eventi del contratto utili per il frontend

`ShipmentCreated`, `HandoffProposed`, `CustodyTransferred`, `BatchAnchored`, `DamageDetected(id, seq, peakCg, custodian)`, `Delivered(id, damaged)`.
