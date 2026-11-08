# Stato del progetto e passaggio di consegne

Aggiornato all'8 novembre 2026. Questo file serve a chi entra adesso nel progetto: dice cosa funziona già, cosa manca per la demo d'esame e cosa si può aggiungere. Cosa vogliamo raccontare e perché è in `docs/VISION.md`: leggetelo prima.

## Cosa funziona già

Il percorso completo funziona dal sensore al contratto, collaterale compreso.

| Pezzo | Stato | Prova |
|---|---|---|
| ESP32 + ADXL375 | ✅ | DEVID 0xE5, circa 1700 campioni/s, ~1 g da fermo |
| GPS M100 | ✅ | NMEA a 115200 baud, fix con ora UTC |
| ATECC608 | ✅ risponde, ⏸ **non provisionato** | seriale letto; firme ancora con chiave software (vedi sotto) |
| Firmware completo | ✅ | batch da 16 letture firmati ogni 16 s, invio via hotspot iPhone |
| Alimentazione a batteria | ✅ | LiPo 2000 mAh → TP4056 → boost 5 V → ESP32, device autonomo |
| Contratto `CustodyLog` | ✅ | batch ancorati, firma P-256 verificata on-chain, picco massimo per periodo di custodia |
| Rilevazione urto (device vero) | ✅ | colpo sul tavolo → batch chiuso subito, picco 223 g, attribuito al custode |
| Contratto `RentalEscrow` + token `DemoUSD` | ✅ | noleggio con collaterale: deposito allo sblocco, trattenuta automatica a fine noleggio. Provato in locale e su Base Sepolia (con device simulato) |
| Relayer + dashboard minima | ✅ | `npm run relayer` → http://localhost:8787, pulsanti "Sblocca: Alice/Bob" e "Riconsegna e regola" |
| Test dei contratti | ✅ | `npx hardhat test` (7 test) |

**Secure element volutamente non provisionato.** `PROVISION` blocca per sempre la configurazione dell'ATECC608. Finché il protocollo può ancora cambiare, i batch sono firmati con una chiave software in NVS (`hw: false` nell'API). Lo facciamo prima della demo. Il resto del sistema non cambia: il device ottiene solo una nuova identità.

## Come funziona il noleggio on-chain

1. Il device si registra da solo al primo batch: diventa un **bene** (`createShipment` con il proprietario come primo custode e nessun destinatario finale) e il proprietario fissa le condizioni in `RentalEscrow.setTerms`.
2. **Sblocco:** il proprietario propone il passaggio, il cliente accetta (due firme), poi il cliente deposita il collaterale (`startRental`). Il noleggio copre quel **periodo di custodia** (`custodyPeriod`, +1 a ogni passaggio accettato).
3. Durante il noleggio `CustodyLog` tiene il **picco massimo del periodo** (`periodMaxPeakCg`).
4. **Riconsegna:** il cliente propone, il proprietario accetta, poi **chiunque** chiama `endRental`. Il contratto legge il picco del periodo, sceglie il livello e paga: fee al proprietario, resto al cliente (evento `RentalSettled`).

Condizioni attuali (provvisorie, da tarare con `docs/CALIBRATION.md`): collaterale 50 dUSD; soglie 8 / 30 / 80 g (picco con gravità inclusa) → trattenuta 10% / 40% / 100%.

Esito della prova su Base Sepolia: caduta simulata a 41,2 g → livello medio → 20 dUSD al proprietario, 30 restituiti ([transazione](https://sepolia.basescan.org/tx/0x67fc66e4cfa258ff14f25c2f7c10930f79e291dbf54726c09ca7d42b2f6546cd)).

## Base Sepolia (testnet pubblica)

Indirizzi anche in `deployments/baseSepolia.json`.

- `CustodyLog`: [`0x0c91b997543aabe4f7b644b76b47e00ab33232eb`](https://sepolia.basescan.org/address/0x0c91b997543aabe4f7b644b76b47e00ab33232eb)
- `RentalEscrow`: [`0xe8c69ec81b8be17350e9238d9912f8e980e18eda`](https://sepolia.basescan.org/address/0xe8c69ec81b8be17350e9238d9912f8e980e18eda)
- `DemoUSD` (stablecoin finta, 6 decimali, `faucet()` libero): [`0xa750f021e6f9254fb8c30aab66404341a372b58c`](https://sepolia.basescan.org/address/0xa750f021e6f9254fb8c30aab66404341a372b58c)
- Relayer / proprietario del bene: [`0xDD15B25f8b1E18482d491992298844e54E50FC35`](https://sepolia.basescan.org/address/0xDD15B25f8b1E18482d491992298844e54E50FC35). La chiave è solo nel `.env` di Giacomo.
- Avvio: `npm run relayer:base` (stessa porta 8787, il firmware non cambia).
- **Costo misurato per batch** (16 letture, verifica P-256 on-chain): circa 145.000 gas × 0,006 gwei ≈ **8,7·10⁻⁷ ETH**; la L1 data fee è trascurabile. Un noleggio completo (sblocco + riconsegna + regolamento) costa altre ~6 transazioni dello stesso ordine. Il prezzo del gas di testnet non è quello di mainnet: in slide va presentato come ordine di grandezza.
- **Budget:** restano circa 0,00004 ETH, cioè una cinquantina di batch. **Prima della demo servono almeno 0,005 ETH dal faucet.** Quando non serve, spegnete il relayer.

Il primo deploy (solo `CustodyLog`, `0xa4ae…7f91`) resta on-chain come storico ma non è più usato.

## Cosa manca per la demo d'esame

| # | Cosa | Chi | Note |
|---|---|---|---|
| 1 | **Web app** | Edoardo | leggere `docs/AGENT_PROMPT.md` |
| 2 | **Case 3D** per il device | Edoardo (stampa del padre) | fissaggio **rigido** dell'ADXL375 alla parete; spazio per batteria, TP4056, boost; accesso alla USB-C per ricaricare e flashare |
| 3 | **"Perché blockchain"**: tabella di confronto e risposte alle obiezioni | da assegnare | base già in `docs/VISION.md` §4 |
| 4 | **Mercato**: noleggio auto internazionale, sharing, usato, assicurazioni parametriche, con fonti | da assegnare | |
| 5 | **Test di caduta** e taratura delle soglie | Giacomo + chi è a Milano | procedura in `docs/CALIBRATION.md` |
| 6 | **PROVISION ATECC608** | Giacomo | a protocollo congelato |
| 7 | **ETH di test** per la demo | Giacomo | faucet Base Sepolia |
| 8 | **Video della demo** (piano B) | tutti | stesso copione della demo live |
| 9 | **Presentazione** (ultima, con foto della web app e del device nel case) | tutti | circa 7 minuti |

### Copione della demo live (circa 90 s)

1. Dashboard o web app aperta: il bene è **disponibile**, i batch arrivano ogni 16 s.
2. **Sblocca: Alice** → 50 dUSD bloccati nel contratto, Alice è la custode on-chain.
3. Si lascia cadere la scatola: compare l'urto, attribuito ad **Alice**, con la transazione su basescan.
4. **Riconsegna e regola** → il contratto trattiene la fee e restituisce il resto, da solo.
5. **Sblocca: Bob**, nessun urto, riconsegna → Bob riceve indietro tutto: l'urto di Alice non pesa su di lui.
6. Si clicca su una lettura e si mostra la **Merkle proof** verificata dal contratto.

## Per chi fa la web app

Leggete `docs/API.md` e `docs/AGENT_PROMPT.md`. In sintesi:

- **Fonte di verità = i contratti.** La web app legge gli eventi direttamente da Base Sepolia (RPC pubblico `https://sepolia.base.org`):
  - `CustodyLog`: `ShipmentCreated`, `HandoffProposed`, `CustodyTransferred`, `BatchAnchored`, `DamageDetected`;
  - `RentalEscrow`: `TermsSet`, `RentalStarted`, `RentalSettled`.
  
  Così funziona anche pubblicata online e dimostra il punto del progetto: non serve fidarsi del nostro server.
- **Il relayer serve per tre cose:** le letture grezze (posizione, picco per secondo: on-chain c'è solo la root), le Merkle proof (`GET /api/proof`) e i pulsanti della demo (`POST /api/rental/start`, `POST /api/rental/end`). In locale gira su `:8787` con CORS aperto. Per una web app pubblicata va esposto con un tunnel (es. `cloudflared tunnel --url http://localhost:8787`).
- **Ruoli in demo:** proprietario (relayer), Alice e Bob, con le chiavi tenute dal relayer. Versione più convincente: il cliente firma dal proprio wallet (MetaMask) `acceptHandoff` e `startRental`.
- **ABI:** `artifacts/contracts/<Nome>.sol/<Nome>.json` dopo `npx hardhat compile`.
- **Linguaggio:** nel codice i beni si chiamano ancora `shipment` per ragioni storiche. Bene = shipment; cliente = custode del periodo; proprietario = `shipper`.
- **Unità:** `peakCg` è in centesimi di g (4210 = 42,1 g); importi dUSD con 6 decimali.

## Problemi noti e trappole

- **Riavvio della chain locale:** `npx hardhat node` riparte da zero. Dopo il riavvio rifate il deploy: il relayer riconosce i contratti nuovi e riparte da zero da solo.
- **Hotspot iPhone:** serve "Massimizza compatibilità", perché l'ESP32 vede solo le reti a 2,4 GHz, e il Mac deve essere sullo stesso hotspot. Il Mac tende a tornare sulla WiFi di casa: disattivate "Accedi automaticamente" su quella rete. Se l'IP del Mac cambia (di solito è `172.20.10.x`), va aggiornato `RELAYER_URL` in `config.h` e va ricaricato il firmware.
- **Relayer bloccato:** se una transazione resta appesa (es. il Mac cambia rete), il relayer la scarta dopo 90 s invece di bloccare tutti i batch successivi. Sintomo sul device: `✗ relayer -11` (timeout di lettura).
- **Coda del device:** se il relayer non è raggiungibile, il device tiene al massimo 6 batch; i più vecchi vengono scartati. Il contratto accetta i buchi in `seq`, ma i batch persi restano persi.
- **Urto a cavallo della riconsegna:** un batch inviato dopo la riconsegna viene attribuito al proprietario. Il device chiude subito il batch dopo un urto, quindi in pratica arriva prima, ma in un prodotto servirebbe un margine (riconsegna confermata solo dopo il primo batch successivo).
- **Saturazione:** l'ADXL375 arriva a ±200 g per asse. Un picco riportato oltre 200 g (modulo su 3 assi) vuol dire saturazione: il valore vero è almeno quello.

## Estensioni possibili (dopo la demo minima)

**Poco sforzo, molto effetto**
- **Sblocco dal wallet:** il cliente usa il proprio account MetaMask invece delle chiavi nel relayer. È la prova più concreta di "nessuno controlla da solo".
- **Pagina pubblica del bene:** storico di tutti i noleggi e urti, verificabile, raggiungibile da un QR code sul bene.
- **Grafico dei picchi nel tempo** con le tre soglie tracciate e i momenti di sblocco e riconsegna.

**Medio sforzo**
- **Polizza parametrica:** un secondo contratto che paga in automatico un indennizzo al proprietario quando `RentalSettled` riporta un livello forte.
- **Temperatura e inclinazione** (sensore SHT40 sullo stesso cavo STEMMA QT) per beni delicati.
- **Disponibilità dei dati:** letture grezze su IPFS o Arweave, con il CID nell'evento. Così la proof non dipende dal nostro relayer.
- **`seq` sul contatore hardware** dell'ATECC608, così non si può tornare indietro nemmeno riscrivendo la flash dell'ESP32.

**Da raccontare come "per andare in produzione" (limiti onesti)**
- **Il secure element protegge la chiave, non la verità della misura.** Con la configurazione di default il chip firma qualunque digest gli arrivi: chi sostituisce il firmware dell'ESP32 può far firmare letture false. Mitigazioni: secure boot e flash encryption sull'ESP32, contenitore che mostri la manomissione, e una configurazione dell'ATECC con firma autorizzata (IO protection key), che richiede un chip nuovo.
- **Nessuna attestazione del produttore:** il contratto si fida di qualunque chiave pubblica venga registrata, quindi `hw: true` è una dichiarazione del device. In produzione: chip già configurati da Microchip (es. ATECC608-TNGTLS) con certificato del produttore, verificato on-chain con lo stesso `P256.verify`.
- **Consumi:** oggi WiFi sempre acceso, circa 12–15 h di autonomia. In un prodotto: modem-sleep, invii ogni N minuti, LTE-M/NB-IoT o Bluetooth verso il telefono del cliente.
