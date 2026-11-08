# Custody Tracker

Progetto di gruppo per 30518 Introduction to Blockchain (Bocconi).

Un device ESP32 viaggia con il pacco. Misura posizione (GPS) e urti (ADXL375), raggruppa le letture in batch e firma la Merkle root di ogni batch con un secure element (ATECC608, ECDSA P-256). Un relayer, che non deve essere fidato, ancora la root sul contratto `CustodyLog`. Il contratto attribuisce ogni urto oltre soglia a chi aveva il pacco in quel momento.

```
firmware/BringUp/          test dei componenti uno alla volta (I2C, ADXL375, GPS, ATECC608)
firmware/CustodyTracker/   firmware completo: letture → Merkle root → firma → POST al relayer
contracts/CustodyLog.sol   registro: device, spedizioni, handoff a due firme, batch firmati, Merkle proof
lib/protocol.mjs           formato dei record, Merkle tree e digest (identici a firmware e contratto)
relayer/                   server HTTP che ancora i batch, dashboard minima, device simulato
test/                      test del contratto
docs/HARDWARE.md           cablaggio e build in 2 ore
docs/API.md                API del relayer per il frontend
docs/DESIGN.md             tesi, scelte di protocollo, limiti, divisione del lavoro
docs/STATUS.md             stato attuale, cosa manca per la demo, estensioni: partite da qui
```

## Avvio rapido (senza hardware)

```bash
npm install
npx hardhat test
npx hardhat node                                          # terminale 1
npx hardhat run scripts/deploy.mjs --network localhost    # terminale 2
npm run relayer                                           # terminale 2 → http://localhost:8787
node relayer/simulate.mjs --batches 6 --drop 3            # terminale 3: device simulato con una caduta
```

## Frontend

La dashboard in `relayer/public/` è volutamente minima. Una web app vera si costruisce sopra `docs/API.md`, oppure leggendo direttamente gli eventi del contratto.

## Base Sepolia

```bash
# .env (escluso da git) con PRIVATE_KEY=0x... di una chiave creata solo per il progetto
npm run deploy:base
npm run relayer:base
```

Usate una chiave creata solo per il progetto e finanziata da un faucet. Non committatela mai: `.env` e `data/` sono già esclusi da git.
