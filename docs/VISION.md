# La scatola nera degli oggetti

Documento di riferimento del progetto di gruppo (30518 Introduction to Blockchain, Bocconi). Se qualcosa nel codice o nelle slide contraddice questo file, vale questo file.

## 1. Il problema

**Oggi la verità sullo stato di un oggetto fisico appartiene a chi ha più potere.**

- All'autonoleggio il graffio è tuo perché lo dice l'azienda.
- Se la spedizione arriva rotta, decide il corriere.
- Sulla bici usata ti devi fidare del venditore.
- Il deposito cauzionale lo trattiene chi lo incassa.

In ognuno di questi casi chi tiene il registro è anche **parte in causa** nella lite. Il registro è tenuto proprio da chi ha interesse a scriverlo a proprio favore.

## 2. L'idea

**L'oggetto diventa testimone di se stesso.**

Un chip attaccato all'oggetto ha una chiave crittografica che non può uscire dal silicio (secure element). Misura ciò che succede all'oggetto: urti, cadute, posizione, chi lo ha in custodia. **Firma** queste misure e le scrive su un **registro pubblico che nessuna delle parti controlla**: una blockchain. Uno smart contract applica le regole concordate, per esempio la restituzione del deposito, senza che nessuno debba fidarsi di nessuno.

**La visione: ogni oggetto condiviso, noleggiato, spedito o rivenduto ha una scatola nera pubblica, come gli aerei.** Una memoria del mondo fisico che non appartiene a nessuno, scritta dagli oggetti stessi.

Cosa cambia quando gli oggetti hanno una scatola nera:

| Oggi | Con la scatola nera |
|---|---|
| Noleggio: lite al banco, deposito trattenuto a discrezione | il deposito si regola da solo in base a ciò che l'oggetto ha registrato |
| Assicurazioni: perizie, mesi di attesa | polizze **parametriche** che pagano in automatico all'evento registrato |
| Mercato dell'usato: "fidati, non è mai caduta" | lo storico verificabile dell'oggetto alza il valore di chi lo ha trattato bene |
| Noleggio auto internazionale: lo storico resta nel gestionale di ogni filiale | lo storico segue il veicolo tra paesi, aziende e proprietari |
| Logistica: ogni vettore ha il suo sistema | catena di custodia unica, firmata a ogni passaggio |

## 3. La prima applicazione: il noleggio con collaterale

È il caso discusso con il professore, ed è quello della demo.

1. **Sblocco.** Il cliente sblocca il bene (bici, monopattino, telecamera, auto) dall'app e deposita un **collaterale** in stablecoin su una L2 (Base). Il collaterale lo custodisce il contratto, non il noleggiatore. On-chain il cliente diventa il **custode** del bene, con un passaggio firmato da entrambe le parti.
2. **Uso.** Il chip registra continuamente. Ogni gruppo di letture è firmato dal chip e scritto on-chain, attribuito al custode di quel momento.
3. **Riconsegna.** Il bene torna al proprietario, con un altro passaggio firmato da entrambi.
4. **Regolamento automatico.** Il contratto guarda l'urto più forte avvenuto **durante quel noleggio**:
   - nessun urto oltre soglia → collaterale restituito per intero;
   - urto **leggero / medio / forte** → trattenuta del 10% / 40% / 100% (valori da tarare), il resto torna al cliente.
5. **Storico.** Anche dopo mesi chiunque vede chi aveva il bene quando è caduto. Il cliente successivo non può vedersi addebitare un danno vecchio.

Mercato: il professore suggerisce di partire dalle **aziende** (sharing come Lime o ATM, e soprattutto il **noleggio auto internazionale**, dove lo storico deve viaggiare tra paesi), non dai privati. Fase 2: **scoring bidirezionale**, cioè il cliente vede lo storico del veicolo e il noleggiatore vede l'affidabilità del cliente, con il vincolo della privacy (vedi §6).

## 4. Perché blockchain e non un database

È la domanda centrale del corso. La risposta ha tre livelli.

### 4.1 Il test formale

Wüst e Gervais, *"Do you need a blockchain?"* (2018). Una blockchain ha senso solo se valgono tutte queste condizioni:

| Domanda | Nel nostro caso |
|---|---|
| Serve uno stato condiviso? | sì: lo storico dell'oggetto e chi ne era custode |
| Ci sono più parti che scrivono? | sì: oggetto, proprietario, clienti, in futuro assicuratori e acquirenti |
| Esiste un terzo fidato da tutti, sempre disponibile? | **no**: chiunque tenga il database è parte in causa o diventa il nuovo punto di fiducia |
| Le parti si fidano tra loro? | **no**: hanno interessi opposti su chi ha causato il danno |
| Serve verifica pubblica? | sì: periti, giudici, acquirenti futuri |

Con queste risposte il test indica una **blockchain pubblica, o permissionless**.

### 4.2 Cosa un database non può fare

1. **Neutralità.** "Il database di chi?" Se è del noleggiatore, può riscrivere chi aveva il bene durante la caduta. Se è nostro, il cliente deve fidarsi di noi. La blockchain toglie il proprietario del registro.
2. **Sopravvivenza.** Lo storico deve durare più dell'azienda che lo ha scritto. Se il noleggiatore fallisce o cambia gestionale, il suo database sparisce. Lo storico on-chain segue l'oggetto tra aziende, paesi e proprietari.
3. **Soldi e dati nello stesso sistema.** Il collaterale lo custodisce il codice, non la controparte. Il cliente non deve fidarsi che il deposito gli torni: la regola è pubblica e si esegue da sola. Un database può registrare un debito, non custodire denaro in modo neutrale.
4. **Verifica senza permesso.** Chiunque controlla una singola lettura con una **Merkle proof** contro il registro pubblico, senza accesso al server di nessuno e senza chiedere niente a nessuno.

### 4.3 La sottigliezza tecnica

Bastano le firme del chip, senza blockchain? **No.** La firma garantisce che una lettura è **autentica**, ma chi conserva le letture firmate può sempre **ometterne** una, per esempio il batch dell'urto. La blockchain garantisce **completezza e ordine**: ogni batch ha un numero di sequenza crescente e on-chain si vede subito se ne manca uno. Si vede anche quando è stato scritto e mentre chi era custode.

**Firma alla fonte = autenticità. Registro pubblico = nessuno nasconde, cancella o riordina.** Servono entrambe.

### 4.4 Le obiezioni prevedibili, con risposta

- *"Un database condiviso tra le aziende del settore?"* È un consorzio: funziona finché i membri si fidano dell'operatore. Non include il cliente, non custodisce denaro e muore con il consorzio.
- *"Un notaio digitale, un servizio di timestamping?"* Garantisce la data, non la completezza. Resta un intermediario unico e non gestisce il collaterale.
- *"La blockchain è lenta e costosa?"* Su una L2 come Base un gruppo di 16 letture costa circa 145.000 gas, cioè **meno di 10⁻⁶ ETH su testnet**, frazioni di centesimo. Sulla catena va solo un'impronta (Merkle root) ogni 16 letture, non i dati.

## 5. Cosa esiste già (verificato sull'hardware)

- Chip: ESP32 + accelerometro ADXL375 (fino a 200 g, 1600 misure/s) + GPS + secure element ATECC608, a batteria.
- Ogni 16 secondi, o subito dopo un urto, il chip firma un gruppo di letture e lo invia.
- Contratto `CustodyLog` su **Base Sepolia**: verifica la firma del chip on-chain, registra la catena di custodia con passaggi a due firme e attribuisce ogni urto al custode del momento.
- Contratto `RentalEscrow` su Base Sepolia: collaterale in stablecoin di test, trattenuta automatica per livello di urto. Provato end-to-end.
- Dashboard minima e API per la web app.

Dettagli: `docs/STATUS.md`. Scelte tecniche: `docs/DESIGN.md`.

## 6. Limiti (da dire prima che li dica il professore)

- **Il problema dell'oracolo.** La blockchain garantisce i dati che riceve, non che siano veri. La nostra risposta è firmare alla fonte con un secure element: il dato non si può alterare dopo. Resta la manomissione fisica (chip staccato, sensore schermato), che si limita con un fissaggio rigido e un contenitore che mostra se è stato aperto.
- **Un urto non è un danno.** Un picco di accelerazione è un indizio, non una perizia. Le soglie sono una regola che il cliente accetta allo sblocco, tarata con test di caduta reali (`docs/CALIBRATION.md`).
- **Privacy.** Percorsi GPS e scoring delle persone non devono finire in chiaro on-chain (GDPR, diritto alla cancellazione). On-chain vanno solo impronte crittografiche; i dati personali restano off-chain, sotto il controllo dell'utente.
- **Disponibilità dei dati.** La catena prova che le letture non sono state alterate, ma le letture stesse vanno conservate da qualcuno. Evoluzione: archiviazione decentralizzata (IPFS/Arweave).
- **Connettività ed energia.** Oggi WiFi, circa 12–15 h di autonomia. In un prodotto: LTE-M/NB-IoT o Bluetooth verso il telefono del cliente, e consumi ridotti.

## 7. Roadmap

1. **Oggi:** noleggio con collaterale (la demo).
2. **Poi:** storico pubblico per oggetto, valido tra aziende e paesi (noleggio auto internazionale, flotte).
3. **Poi:** assicurazioni parametriche che leggono lo storico e pagano in automatico.
4. **Poi:** mercato dell'usato con storico verificabile; scoring bidirezionale con tutela della privacy.
5. **Visione:** la scatola nera come standard per qualunque oggetto di valore che cambia mano.

## 8. La demo (circa 90 secondi)

1. La "bici" (la scatola con il chip) è del proprietario. Il cliente la sblocca e **50 USD di test** vanno nel contratto.
2. Il cliente la usa e le letture arrivano on-chain.
3. **La scatola cade.** Compare l'urto, attribuito al cliente, con il link alla transazione su basescan.
4. Il cliente la riconsegna. **Il contratto trattiene la fee e restituisce il resto, da solo.**
5. Si clicca su una lettura e si mostra la prova crittografica verificata on-chain: chiunque può controllarla.

Piano B: video registrato della stessa sequenza.
