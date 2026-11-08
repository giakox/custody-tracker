# Prodotto: dove vogliamo arrivare

Fonte: confronto con il professore in aula (corso 30518). Il prototipo attuale è nato con il linguaggio delle **spedizioni** (mittente, vettori, destinatario). La direzione discussa con il professore è il **noleggio**. Il meccanismo è lo stesso, cambia il caso d'uso. Questo file descrive il prodotto obiettivo e come il prototipo ci si collega.

## L'idea in una frase

Un chip attaccato a un bene dato a noleggio (bicicletta, monopattino, telecamera, auto) rileva gli urti, li firma e li registra su blockchain. A fine noleggio il **collaterale** del cliente torna indietro intero se non ci sono urti, oppure con una **trattenuta proporzionale alla gravità** dell'urto. Lo storico è immutabile: il cliente non può vedersi attribuire danni fatti da altri, e il noleggiatore non può inventarne.

## Il flusso del noleggio

1. **Sblocco.** Il cliente apre l'app, sceglie il bene e lo sblocca depositando un **collaterale**: stablecoin su una L2 (Base) oppure pre-autorizzazione sulla carta. Da quel momento il custode del bene è il cliente.
2. **Uso.** Il chip misura continuamente. Ogni batch di letture è firmato dal secure element e registrato on-chain, attribuito al custode del momento.
3. **Fine noleggio.** Il cliente chiude dall'app (es. parte da Bocconi, chiude in Duomo). La custodia torna al proprietario.
4. **Regolamento automatico:**
   - nessun urto oltre soglia → collaterale restituito per intero;
   - urto **leggero / medio / forte** → trattenuta di una fee proporzionale, il resto torna al cliente;
   - in caso di contestazione, le parti vedono le stesse letture firmate, verificabili da chiunque con una Merkle proof.
5. **Storico del bene.** Anche a distanza di mesi, chiunque vede quali danni ha subito il bene e durante quale noleggio.

## Clienti e mercato (dalla discussione con il professore)

- **Privati (P2P):** chi ha una bici inutilizzata d'estate compra il chip e la mette a noleggio. Mercato ampio, ma frammentato e con scontrino basso.
- **Aziende di sharing e noleggio:** Lime, ATM e simili. Il professore consiglia di **partire da qui**.
- **Noleggio auto internazionale** (aeroporti, grandi marchi che operano su più paesi): il caso più forte secondo il professore. Lo storico del veicolo deve viaggiare tra paesi e tra filiali. È anche una forma di **certificazione**: chi adotta il sistema non può alterare lo storico.
- **Flotte aziendali** (auto dei manager): estensione successiva.

## Estensione: scoring bidirezionale

Proposta dal professore come seconda fase:
- il **cliente** vede lo storico danni del veicolo prima di prenderlo ("non voglio un'auto che ha già preso colpi");
- il **noleggiatore** vede l'affidabilità del cliente prima di consegnarlo ("non voglio darla a chi danneggia sistematicamente").

Risolve l'asimmetria informativa e la mancanza di fiducia tra sconosciuti al banco del noleggio. **Il limite da dire è la privacy:** uno scoring delle persone on-chain si scontra con il GDPR (diritto alla cancellazione, profilazione). Una direzione possibile: on-chain solo hash e impegni crittografici, dati personali off-chain, scoring calcolato con il consenso dell'utente.

## Dal prototipo al prodotto: corrispondenza

Il contratto attuale fa già il 70% del lavoro: identità del device, catena di custodia a due firme, batch firmati, attribuzione del danno.

| Prototipo (`CustodyLog`) | Prodotto (noleggio) | Stato |
|---|---|---|
| `Shipment` | noleggio (`Rental`) di un bene | rinominare/estendere |
| `shipper` / `receiver` | proprietario del bene | il proprietario riceve il bene a fine noleggio |
| `carrierA`, `carrierB` | clienti successivi | già supportato: un handoff per ogni noleggio |
| `proposeHandoff` / `acceptHandoff` | sblocco e fine noleggio | già supportato (due firme) |
| `maxAllowedCg` (una soglia) | soglie leggero / medio / forte | **da fare**: 3 soglie + fee per livello |
| `DamageDetected(custodian)` | danno attribuito al cliente | già supportato |
| — | **collaterale in escrow** (USDC su Base) | **da fare**: deposito allo sblocco, rilascio/trattenuta a fine noleggio |
| — | storico per bene, tra noleggi | in parte: oggi un device = una spedizione |
| — | scoring | fase 2 |

## Cosa costruire, in ordine

1. **Contratto `RentalEscrow`** (o estensione di `CustodyLog`): deposito del collaterale in USDC di test allo sblocco, rilascio a fine noleggio con trattenuta in base al livello di danno più alto registrato durante quel noleggio. Le soglie e le fee le decide il proprietario alla registrazione del bene.
2. **Soglie a tre livelli** calibrate con un test di caduta reale (vedi `docs/CALIBRATION.md`).
3. **Web app con due viste:** cliente (sblocca, vede il proprio noleggio, chiude, vede cosa gli è stato trattenuto e perché) e proprietario/flotta (beni, noleggi, storico danni, incassi).
4. **Storico del bene:** pagina pubblica per bene con tutti i noleggi e gli urti, verificabile.
5. Fase 2: scoring, pre-autorizzazione su carta, integrazione con flotte.

## Limiti da dire nella presentazione

- **Garbage-in:** il chip misura il chip. Se è staccato dal bene o montato male, misura altro. Serve un fissaggio rigido e ispezionabile.
- **Urto ≠ danno:** un picco di accelerazione è un indizio, non una perizia. Le soglie sono una convenzione contrattuale tra proprietario e cliente, accettata allo sblocco.
- **Il secure element protegge la chiave, non la verità della misura** (vedi `docs/STATUS.md`, estensioni).
- **Privacy** dello scoring e dei percorsi GPS: on-chain vanno solo root e hash, mai posizioni in chiaro di persone identificabili.
- **Connettività:** oggi WiFi tramite hotspot. In un prodotto: LTE-M/NB-IoT o BLE verso lo smartphone del cliente.
