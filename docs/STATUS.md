# Stato del progetto e passaggio di consegne

Aggiornato all'8 novembre 2026. Questo file serve a chi entra adesso nel progetto: dice cosa funziona già, cosa manca per la demo d'esame e cosa si può aggiungere.

## Cosa funziona già (verificato sull'hardware vero)

Il percorso completo funziona dal sensore al contratto. È stato verificato con il device sul tavolo e la chain Hardhat locale.

| Pezzo | Stato | Prova |
|---|---|---|
| ESP32 + ADXL375 | ✅ | DEVID 0xE5, circa 1700 campioni/s, ~1 g da fermo |
| GPS M100 | ✅ | NMEA a 115200 baud, fix con ora UTC |
| ATECC608 | ✅ risponde, ⏸ **non provisionato** | seriale letto; firme ancora con chiave software (vedi sotto) |
| Firmware completo | ✅ | batch da 16 letture firmati ogni 16 s, invio via hotspot iPhone |
| Contratto `CustodyLog` | ✅ | batch ancorati, ~120k gas l'uno, firma P-256 verificata on-chain |
| Rilevazione urto | ✅ | colpo sul tavolo → batch chiuso subito, picco 223 g, `DamageDetected` attribuito al vettore A |
| Alimentazione a batteria | ✅ | LiPo 2000 mAh → TP4056 → boost 5 V → ESP32, device autonomo |
| Relayer + dashboard minima | ✅ | `npm run relayer` → http://localhost:8787 |
| Test del contratto | ✅ | `npx hardhat test` (3 test) |

**Secure element volutamente non provisionato.** `PROVISION` blocca per sempre la configurazione dell'ATECC608. Finché il protocollo può ancora cambiare, i batch sono firmati con una chiave software in NVS (`hw: false` nell'API). Lo facciamo prima della demo. Il resto del sistema non cambia: il device ottiene solo una nuova identità e una nuova spedizione.

## Base Sepolia (testnet pubblica)

- Contratto `CustodyLog`: [`0xa4ae868952eaf7b248bd70a986954f1c4c3f7f91`](https://sepolia.basescan.org/address/0xa4ae868952eaf7b248bd70a986954f1c4c3f7f91) (chain 84532). Indirizzo anche in `deployments/baseSepolia.json`.
- Relayer / deployer: [`0xDD15B25f8b1E18482d491992298844e54E50FC35`](https://sepolia.basescan.org/address/0xDD15B25f8b1E18482d491992298844e54E50FC35). La chiave è solo nel `.env` di Giacomo.
- Avvio: `npm run relayer:base` (stessa porta 8787, il firmware non cambia).
- **Costo misurato per batch** (16 letture, verifica P-256 on-chain): 120.119 gas × 0,006 gwei ≈ **7,2·10⁻⁷ ETH**; la L1 data fee è trascurabile (~5·10⁻¹⁶ ETH). Con un batch ogni 16 s sono ~0,00016 ETH/h. Il prezzo del gas su testnet non è quello di mainnet: per le slide va dichiarato come stima.
- **Budget:** il faucet ha dato 0,0001 ETH, che bastano per circa 120 batch (~30 minuti di device acceso). Prima della demo servono almeno 0,005 ETH da un faucet. Quando non serve, spegnete il relayer: i batch non inviati vengono scartati dal device, non c'è altro effetto.

## Cosa manca per la demo d'esame

In ordine di priorità.

| # | Cosa | Chi | Note |
|---|---|---|---|
| 1 | ~~Deploy su Base Sepolia~~ ✅ | chain (Giacomo) | fatto: vedi sezione "Base Sepolia" sotto. **Da fare:** più ETH di test sull'indirizzo del relayer prima della demo |
| 2 | **Web app** | frontend (compagni) | vedi sotto: deve leggere gli eventi dal contratto, non solo il relayer |
| 3 | **Scatola** | hardware | batteria già funzionante; manca il montaggio rigido dell'ADXL375 nella scatola e il test di caduta da 30–50 cm (`docs/HARDWARE.md`, ultimo checkpoint) |
| 4 | **PROVISION ATECC608** | hardware | a protocollo congelato, almeno 2 giorni prima della demo |
| 5 | **Piano B per la demo** | tutti | video registrato della demo + `node relayer/simulate.mjs --drop 3` se in aula il WiFi non funziona |
| 6 | **Copione della demo live** | pitch | vedi sotto: 90 secondi |
| 7 | **Repo GitHub** | Giacomo | `git init`, push; `config.h` (password hotspot) e `data/` sono già esclusi da git |

### Copione proposto della demo live (circa 90 s)

1. Dashboard aperta, spedizione in custodia al **vettore A**, batch che arrivano ogni 16 s.
2. Si clicca **handoff → vettore B**: il vettore A propone e il vettore B accetta, con due firme.
3. Si lascia cadere la scatola da 30–50 cm: compare **DANNO REGISTRATO**, attribuito al **vettore B**, con la transazione on-chain.
4. Handoff al **destinatario** → spedizione consegnata, con il danno già registrato.
5. Si clicca su una lettura e si mostra la **Merkle proof** verificata dal contratto (`verifiedOnChain: true`): chiunque può controllare che il dato non è stato modificato.

## Per chi fa il frontend

Leggete `docs/API.md`. In sintesi:

- **Fonte di verità = il contratto.** La web app dovrebbe leggere gli eventi (`ShipmentCreated`, `CustodyTransferred`, `BatchAnchored`, `DamageDetected`, `Delivered`) direttamente da Base Sepolia, con viem o ethers e l'RPC pubblico `https://sepolia.base.org`. Così funziona anche ospitata su Vercel o Netlify, e dimostra il punto del progetto: non serve fidarsi del nostro server.
- **Il relayer serve per due cose che il contratto non ha:** le letture grezze (posizione, picco per secondo), perché on-chain c'è solo la root, e le Merkle proof (`GET /api/proof`). In locale gira su `:8787` con CORS aperto. Per una web app ospitata va esposto con un tunnel (es. `cloudflared tunnel --url http://localhost:8787`).
- **Ruoli in demo:** le chiavi di vettore A, vettore B e destinatario stanno nel relayer (`POST /api/handoff`). Versione più convincente: ogni ruolo firma con il proprio wallet (MetaMask) chiamando `proposeHandoff` / `acceptHandoff`. Vedi "estensioni".
- **ABI:** `artifacts/contracts/CustodyLog.sol/CustodyLog.json` dopo `npx hardhat compile`. Indirizzo in `deployments/<rete>.json`.
- **Unità:** `peakCg` è in centesimi di g (4210 = 42,1 g); `lat`/`lon` on-chain non ci sono, solo nel relayer.

Schermate che servono: timeline della spedizione (custodi e handoff), mappa del percorso con i punti degli urti, lista dei batch con link a basescan, pagina "verifica lettura" con la proof, stato finale (consegnato / danneggiato, e da chi).

## Problemi noti e trappole

- **Riavvio della chain locale:** `npx hardhat node` riparte da zero, ma `data/localhost.json` del relayer resta. Prima di rifare il deploy cancellare `data/localhost.json`, altrimenti il relayer cerca spedizioni che non esistono più.
- **Hotspot iPhone:** serve "Massimizza compatibilità", perché l'ESP32 vede solo le reti a 2,4 GHz, e il Mac deve essere sullo stesso hotspot. Il Mac tende a tornare sulla WiFi di casa: disattivate "Accedi automaticamente" su quella rete. Se l'IP del Mac cambia (di solito è `172.20.10.x`), va aggiornato `RELAYER_URL` in `config.h` e va ricaricato il firmware.
- **Relayer bloccato:** se una transazione resta appesa (es. il Mac cambia rete), il relayer ora la scarta dopo 90 s invece di bloccare tutti i batch successivi. Sintomo sul device: `✗ relayer -11` (timeout di lettura).
- **Coda del device:** se il relayer non è raggiungibile, il device tiene al massimo 6 batch; i più vecchi vengono scartati. Il contratto accetta i buchi in `seq`, ma i batch persi restano persi.
- **Saturazione:** l'ADXL375 arriva a ±200 g per asse. Un picco riportato oltre 200 g (modulo su 3 assi) vuol dire saturazione: il valore vero è almeno quello.

## Estensioni possibili (dopo la demo minima)

Ordinate per rapporto valore per la presentazione / sforzo.

**Poco sforzo, molto effetto**
- **Handoff dal wallet:** ogni ruolo usa il proprio account MetaMask invece delle chiavi nel relayer. È la dimostrazione più concreta di "nessuna parte controlla da sola la catena di custodia".
- **Rimborso automatico:** un contratto escrow o assicurativo che legge `damaged` e il custode responsabile, e paga il destinatario con un token di test (es. USDC su Base Sepolia). Trasforma il registro in un processo che si esegue da solo.
- **Grafico dei picchi nel tempo** con la soglia tracciata e i momenti di handoff.

**Medio sforzo**
- **Soglie per spedizione:** oggi c'è un solo valore, `maxAllowedCg`. Si possono aggiungere temperatura (serve un sensore, es. SHT40 sullo stesso cavo STEMMA QT) e inclinazione ("questo lato in alto").
- **Geofence:** urti fuori dal percorso previsto o fermi troppo lunghi.
- **Disponibilità dei dati:** pubblicare le letture grezze su IPFS o Arweave e mettere il CID nell'evento. Così la proof non dipende dal nostro relayer.
- **`seq` sul contatore hardware** dell'ATECC608, così non si può tornare indietro nemmeno riscrivendo la flash dell'ESP32.

**Da raccontare come "per andare in produzione" (limiti onesti)**
- **Il secure element protegge la chiave, non la verità della misura.** Con la configurazione di default il chip firma qualunque digest gli arrivi: chi sostituisce il firmware dell'ESP32 può far firmare letture false. Mitigazioni: secure boot e flash encryption sull'ESP32, scatola che mostri la manomissione, e una configurazione dell'ATECC con firma autorizzata (IO protection key). Quest'ultima non è più possibile su un chip già bloccato in configurazione TLS: serve un chip nuovo.
- **Nessuna attestazione del produttore:** il contratto si fida di qualunque chiave pubblica venga registrata, quindi `hw: true` è una dichiarazione del device. In produzione: chip già configurati da Microchip (es. ATECC608-TNGTLS) con certificato del produttore, verificato on-chain con lo stesso `P256.verify`.
- **Consumi:** oggi WiFi sempre acceso, circa 12–15 h di autonomia. In un prodotto: modem-sleep, invii ogni N minuti, LTE-M/NB-IoT al posto del WiFi.
- **Costo per spedizione:** da calcolare con il gas misurato su Base Sepolia × numero di batch, e confrontarlo con il valore della merce e con i data logger esistenti.
