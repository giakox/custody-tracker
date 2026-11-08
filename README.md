# Custody Tracker

Progetto di gruppo per 30518 Introduction to Blockchain (Bocconi).

**La scatola nera degli oggetti.** Un chip attaccato a un oggetto (bici, telecamera, auto a noleggio) misura urti e posizione, firma le misure con una chiave che non lascia il secure element e le scrive su un registro pubblico che nessuna delle parti controlla. Primo caso d'uso: il noleggio con collaterale, regolato da solo dal contratto in base a ciò che l'oggetto ha registrato. Visione completa e perché serve una blockchain: [`docs/VISION.md`](docs/VISION.md).

*EN — The black box for physical objects: a secure-element chip signs what happens to an object (shocks, location, custody) and anchors it on a public ledger no party controls; first use case is rentals where the deposit settles itself. Docs are in Italian; `docs/AGENT_PROMPT.md` works in any language.*

Tecnicamente: ESP32 + ADXL375 + GPS + ATECC608 (ECDSA P-256) → Merkle root di ogni batch firmata dal device → relayer non fidato → `CustodyLog` su Base Sepolia (verifica P-256 on-chain, catena di custodia a due firme) → `RentalEscrow` (collaterale e trattenuta per livello di urto).

```
firmware/BringUp/          test dei componenti uno alla volta (I2C, ADXL375, GPS, ATECC608)
firmware/CustodyTracker/   firmware completo: letture → Merkle root → firma → POST al relayer
contracts/CustodyLog.sol   registro: device, beni, passaggi di custodia a due firme, batch firmati, Merkle proof
contracts/RentalEscrow.sol collaterale del noleggio: deposito, trattenuta automatica per livello di urto
contracts/DemoUSD.sol      stablecoin finta per la testnet
lib/protocol.mjs           formato dei record, Merkle tree e digest (identici a firmware e contratto)
relayer/                   server HTTP che ancora i batch, dashboard minima, device simulato
test/                      test del contratto
docs/HARDWARE.md           cablaggio e build in 2 ore
docs/API.md                API del relayer per il frontend
docs/DESIGN.md             tesi, scelte di protocollo, limiti, divisione del lavoro
docs/STATUS.md             stato attuale, indirizzi on-chain, cosa manca, chi fa cosa
docs/VISION.md             LA VISIONE: scatola nera degli oggetti, perché blockchain, limiti, demo. Partite da qui
docs/CALIBRATION.md        calibrazione dell'accelerometro e soglie leggero/medio/forte
docs/AGENT_PROMPT.md       prompt da dare al proprio agente AI per lavorare sul progetto
```

**Nuovi nel gruppo?** Aprite `docs/AGENT_PROMPT.md` e seguite le istruzioni.

## Avvio rapido (senza hardware)

```bash
npm install
npx hardhat test
npx hardhat node                                          # terminale 1
npx hardhat run scripts/deploy.mjs --network localhost    # terminale 2
npm run relayer                                           # terminale 2 → http://localhost:8787
node relayer/simulate.mjs --batches 1                     # terminale 3: il device simulato registra il bene
# dashboard: "Sblocca: Alice", poi:
node relayer/simulate.mjs --batches 2 --drop 2            # caduta durante il noleggio
# dashboard: "Riconsegna e regola" → il contratto trattiene la fee e restituisce il resto
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
