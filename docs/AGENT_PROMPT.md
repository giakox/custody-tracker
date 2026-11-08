# Prompt per il vostro agente AI

Copiate tutto il blocco qui sotto e incollatelo come primo messaggio al vostro agente (Claude Code, Cursor, Codex…), aperto **nella cartella del repo clonato**.

Per clonare il repo:

```
git clone https://github.com/giakox/custody-tracker.git
cd custody-tracker
```

---

```text
Sei il mio partner tecnico per un progetto universitario di gruppo: corso 30518 Introduction to Blockchain (Bocconi). Il progetto vale l'80% del voto e si chiude con una presentazione di circa 7 minuti con demo dal vivo. Io non ho esperienza di programmazione: spiegami le cose in modo semplice, un passo alla volta, e dimmi sempre esattamente quali comandi lanciare e cosa devo vedere.

## Il progetto

Un chip (ESP32 + accelerometro ADXL375 + GPS + secure element ATECC608) si attacca a un bene dato a noleggio: bicicletta, monopattino, telecamera, auto. Il chip rileva gli urti, firma le letture e le registra su blockchain (Base Sepolia, una testnet L2 di Ethereum). A fine noleggio il collaterale del cliente viene restituito intero se non ci sono urti, oppure con una trattenuta proporzionale alla gravità dell'urto (leggero / medio / forte). Lo storico del bene è immutabile: il cliente non può vedersi addebitare danni fatti da altri, il noleggiatore non può inventarli.

Hardware, firmware, smart contract e relayer li ha già fatti e testati Giacomo e funzionano: il device vero registra batch firmati su Base Sepolia. Il nostro compito è la **web app** e il materiale per la presentazione.

## Prima di tutto: leggi e capisci il repo

Leggi questi file in quest'ordine, poi fammi un riassunto in italiano semplice di cosa fa il sistema, come passano i dati dal chip alla blockchain alla web app, e cosa manca:

1. README.md — mappa del repo
2. docs/PRODUCT.md — il prodotto che vogliamo presentare (noleggio + collaterale), discusso con il professore. È la direzione da seguire.
3. docs/STATUS.md — cosa funziona già, cosa manca, problemi noti, indirizzi su Base Sepolia
4. docs/API.md — API del relayer (il server che riceve i dati dal chip)
5. docs/DESIGN.md — scelte tecniche e perché serve una blockchain e non un database
6. docs/CALIBRATION.md — come misuriamo gli urti
7. contracts/CustodyLog.sol — lo smart contract (eventi ShipmentCreated, CustodyTransferred, BatchAnchored, DamageDetected, Delivered)
8. relayer/server.mjs e relayer/public/index.html — relayer e dashboard minima già esistente
9. lib/protocol.mjs — formato delle letture e Merkle tree

Attenzione: il codice usa il linguaggio delle "spedizioni" (shipment, carrierA, carrierB, receiver) perché è nato così. Nel prodotto: shipment = noleggio, carrier = cliente che ha il bene in quel momento, receiver/shipper = proprietario del bene. La tabella di corrispondenza è in docs/PRODUCT.md.

## Regole

- NON modificare firmware/, contracts/, lib/protocol.mjs né relayer/server.mjs senza chiederlo prima a Giacomo: sono testati sull'hardware vero. Se serve una modifica lì, scrivi una proposta in un file docs/PROPOSTE.md e fermati.
- La web app va in una cartella nuova, webapp/.
- Mai mettere chiavi private, password o file .env nel repo. Non servono chiavi per leggere la blockchain.
- Lavora su un branch git tuo (es. webapp-<nome>) e apri una pull request verso main: non fare push diretti su main.
- Prima di dire che una cosa funziona, provala davvero e dimmi come l'hai verificata.

## Come far girare tutto sul mio computer (senza hardware)

Guidami passo passo, verificando ogni passaggio:
1. installa Node.js LTS se manca; poi nel repo: npm install, npx hardhat test (devono passare 3 test)
2. terminale 1: npx hardhat node (blockchain locale)
3. terminale 2: npx hardhat run scripts/deploy.mjs --network localhost, poi npm run relayer → dashboard su http://localhost:8787
4. terminale 3: node relayer/simulate.mjs --batches 6 --drop 3 → un chip simulato manda letture con un urto al terzo batch
Se riavvii la blockchain locale, cancella prima data/localhost.json (vedi docs/STATUS.md).

## Cosa costruire: la web app

Architettura (importante):
- **La fonte di verità è lo smart contract.** La web app legge gli eventi direttamente da Base Sepolia con viem (RPC pubblico https://sepolia.base.org, contratto in deployments/baseSepolia.json, ABI in artifacts/contracts/CustodyLog.sol/CustodyLog.json dopo npx hardhat compile). Così la web app funziona anche pubblicata online e dimostra che non serve fidarsi del nostro server.
- Il relayer (docs/API.md) serve solo per i dati che on-chain non ci sono: le letture grezze (posizione, picco per secondo) e le Merkle proof. Rendi la web app capace di funzionare anche se il relayer non è raggiungibile (mostra solo i dati on-chain).
- Stack consigliato: Vite + React + TypeScript + viem, mappa con Leaflet. Niente backend nuovo.

Schermate, in ordine di priorità:
1. Storico del bene: timeline dei noleggi (chi aveva il bene e quando), urti con livello di gravità, link alle transazioni su sepolia.basescan.org.
2. Noleggio attivo: chi è il cliente, letture in arrivo, mappa del percorso con gli urti evidenziati.
3. Verifica di una lettura: si sceglie una lettura, la web app prende la Merkle proof dal relayer e chiama verifyReading sul contratto. Deve mostrare in modo chiaro "verificata on-chain".
4. Riepilogo di fine noleggio: urti registrati, livello massimo, quanto collaterale sarebbe trattenuto e perché. (Il contratto di collaterale non esiste ancora: per ora calcola la trattenuta in front-end, con soglie e fee configurabili, e scrivilo chiaramente in UI come simulazione.)
5. (Extra) Connessione wallet (MetaMask) per fare lo sblocco/fine noleggio firmando dal proprio account, chiamando proposeHandoff / acceptHandoff.

Unità: peakCg è in centesimi di g (4210 = 42,1 g). Lingua dell'interfaccia: inglese. Stile: pulito, sobrio, niente estetica "crypto".

## Come procedere

1. Leggi i file, fammi il riassunto e una lista di domande se qualcosa non è chiaro.
2. Proponimi un piano per la web app, diviso in passi piccoli, e aspetta il mio ok.
3. Fai un passo alla volta: dopo ognuno dimmi cosa hai fatto, come l'ho verificato e cosa devo vedere sullo schermo.
4. Alla fine aggiorna webapp/README.md con le istruzioni per avviarla.
```

---

## Note per chi fa le slide o il business

Lo stesso agente può aiutare anche qui. Dopo il riassunto, chiedetegli per esempio:
- "Prepara la struttura di una presentazione di 7 minuti basata su docs/PRODUCT.md e docs/DESIGN.md, con la demo dal vivo al centro e i limiti onesti alla fine."
- "Fai un'analisi di mercato del noleggio auto e delle aziende di sharing in Europa per il nostro prodotto, citando le fonti."
- "Calcola il costo on-chain per noleggio usando i numeri misurati in docs/STATUS.md."
