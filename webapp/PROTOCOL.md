# Protocollo dei giri «make it better»

Rileggi questo file per intero all'inizio di OGNI giro: si aggiorna mentre lavori, e vale sempre l'ultima versione.
**Versione: 4** (dopo il giro 150). La prima riga di ogni giro in ROUNDS.md è «Protocollo v4 letto». Fra i giri 72 e
100 avevi smesso di rileggerlo e hai lavorato con regole vecchie per 30 giri: non deve succedere più.
Le citazioni tra virgolette sono di Edoardo, testuali.

## Il prompt di ogni giro
«Look at the site first. Then innovate: think about the user experience and think outside the box. Make one bold
change that improves conversions or the look and feel, not a small tweak. Use any tool you have. You must ship a change
every time.»

## La visione
Sharify è bello, umano, semplice, per tutti, come il sito del caffè del video di Nate Herk. Tema B · Day. «Multilivello e
ultra curato». Un giro che rende il sito più tecnico, più affollato o più simile a un template è sbagliato.

## I passi di ogni giro
1. **Guarda**: scatti a 1440 e a 375 px della schermata più debole in quel momento. A rotazione tutte (mappa, pagina
   della bici, noleggio, ricevuta, proprietario, Add, Verify, How it's designed, testata, piè di pagina, menu).
   «Niente è definitivo»: dopo averle toccate tutte, si riparte e si rimette in gioco anche quello già rifatto. Registro
   «schermata → ultimo giro» in ROUNDS.md.
2. **Audit di gerarchia** (obbligatorio): elenca ogni blocco; per ognuno chiediti a chi serve, quando, e cosa succede se
   sparisce; togli, accorpa o nascondi dietro un'azione quello che non regge. Una sola cosa primaria per schermata o zona,
   al massimo 2–3 secondarie, il resto terziario, e deve vedersi (dimensione, peso, colore, spazio). Test dello sguardo
   sullo scatto sfocato: l'occhio cade prima sulla cosa primaria e segue un percorso ovvio. «SERVE GERARCHIA,
   POSIZIONAMENTO E PERFEZIONE. IN TUTTO.»
3. **Confronta**: 2 riferimenti veri di altissimo livello (Airbnb, Linear, Stripe, Apple, Flighty, Lime, siti premiati
   su godly.website / awwwards). Scatti anche di quelli, e perché la nostra schermata sembra più cheap.
4. **Idee**: 3 idee coraggiose a livello di STRUTTURA (layout, composizione, livelli, gerarchia, spazio). Scarta le due
   più deboli con una riga di motivo. Le idee sono tue: nessuno te le suggerisce.
5. **Fai**, ultra curato, con le skill `impeccable` (critique, polish, layout, typeset) e `design-taste-frontend`.
6. **Test**: prima e dopo fianco a fianco. «A colpo d'occhio è un'altra schermata?» Se no, il giro non è finito.
7. **Spedisci**: un commit locale per giro («round N: …»), ROUNDS.md aggiornato (audit, riferimenti, 3 idee, scelta,
   test). Un giro su 5 è un passo indietro (stesso protocollo; l'idea è cosa togliere o accorpare). Ogni 10 giri un
   riepilogo. Fino al 200 senza fermarti; ti fermi solo al 200, con il build rotto senza rimedio, o al tetto di righe.

## Giri 151–200: la rifinitura (versione 4)
Edoardo, dopo il giro 150, guardando il sito in Safari: «Sono soddisfatto ma c'è ancora da migliorare. Posizioni,
colori, simmetrie, gestione dimensioni, animazioni, curvature... insomma a lavoro!» E sulla card del prezzo nella pagina
della bici: «sto box non ha gli angoli stondati».
- La struttura ora va: questi 50 giri sono di **rifinitura**, schermata per schermata, a rotazione. Il prompt di ogni
  giro e i passi restano; il cambio coraggioso ora può stare nel dettaglio, purché si veda.
- **Le sei voci di Edoardo, ogni giro, sulla schermata del giro**, ognuna con una riga in ROUNDS.md su cosa hai trovato e
  corretto: **posizioni** (griglia, allineamenti, margini, niente che sborda o è tagliato), **colori** (coerenza dei
  fondi e degli accenti, contrasto), **simmetrie** (colonne, spazi a destra e a sinistra, centri), **dimensioni** (scala
  dei testi, dei bottoni, delle foto, a 1440, 1024, 768 e 375 px), **animazioni** (entrate, hover, pressione, scroll,
  reduced-motion), **curvature** (un solo raggio, applicato davvero ovunque, anche a foto, mappe e card).
- **Bug segnalato da Edoardo, da chiudere nel giro 151:** in Safari la card del prezzo (`.book-card`) e la card della mappa
  («Parked outside Bocconi») hanno gli angoli dritti. Cerca la causa vera (WebKit e il ritaglio dei figli con
  `overflow: hidden` + `border-radius`), non mascherarla. Poi cerca lo stesso difetto in tutto il sito.
- **Edoardo guarda il sito in Safari.** Ogni giro, oltre agli scatti con Chromium, controlla la schermata in WebKit. Se
  WebKit di Playwright non è installato, non scaricarlo da sola: scrivi in ROUNDS.md che manca e continua.

## Il metro: il sito del caffè (aggiunto dopo il giro 82)
Edoardo, dopo il giro 82: «Ancora non sono soddisfatto. Rimane piatto e noioso il sito. Non bello e accogliente come
quello del cafè.»
- In `webapp/foto-sabato/cafe/` ci sono 12 fotogrammi del sito del caffè finito (dal video di Nate Herk, bassa
  risoluzione). Sono il metro di paragone fisso, in più ai 2 riferimenti di ogni giro. Non si committano (sono di altri).
- **Il prossimo giro che inizi (86 o 87) è un giro di studio, senza codice.** Guarda i 12 fotogrammi accanto alla pagina intera
  di Sharify, e scrivi in ROUNDS.md, con parole tue, cosa rende quel sito caldo, accogliente e non piatto, e cosa rende
  il nostro piatto e noioso, punto per punto, sezione per sezione. Non copiare il caffè (tema, colori, oggetti): capisci i
  principi e traducili per Sharify, restando nel tema B · Day e nella palette. Questo giro si committa con il solo
  ROUNDS.md e conta nel numero dei giri.
- Da lì in poi, **a ogni giro**: affianca lo scatto della schermata ai fotogrammi del caffè e rispondi per iscritto «è
  accogliente come il caffè? cosa manca ancora?». Il giro deve accorciare quella distanza.

## Contro il ritocco (aggiunto dopo il giro 82)
Dal giro 64 la struttura del sito non è cambiata: gli ultimi giri sistemano cosa c'è dentro le card, non com'è fatta la
pagina. Da adesso:
- **Un giro su cinque è un giro di composizione** (diverso dal passo indietro): rimette in gioco come è costruita
  un'intera pagina (ordine delle sezioni, ritmo, larghezze, cosa sta sopra cosa), non un blocco. Si giudica sullo
  **scatto della pagina intera**, dall'alto al fondo, prima e dopo, non sulla prima schermata.
- **Niente file di card identiche** (stessa forma, stessa misura, una accanto all'altra), né righe di elementi tutti
  uguali. Dove ci sono oggi, a rotazione, vanno ripensate.
- **Il test «è un'altra schermata?» si fa sugli scatti sfocati**, prima e dopo affiancati. Se la risposta onesta è no,
  il giro non è finito: si rifà, non si committa. Scrivi in ROUNDS.md la risposta onesta, anche quando è no.

## Cura di tutto (ogni giro)
- **Effetti e movimento**: entrate, transizioni tra pagine e stati, timing ed easing coerenti, `prefers-reduced-motion`.
- **Scroll**: cosa succede scorrendo (testata, sticky, apparizioni, parallasse misurato, snap dove serve).
- **Posizionamento**: griglia vera, allineamenti esatti, simmetrie sensate, scala unica di spaziature, più spazio tra i
  gruppi che dentro un gruppo, niente incollato ai bordi, niente che galleggia senza allineamento.
- **Ombre**: una scala sola, coerente con i livelli.
- **Selezioni e stati**: hover, pressed, focus visibile, selected, disabled di ogni elemento interattivo (pin, card, chip,
  righe), anche la selezione del testo.
- **Raggio unico** ovunque (pillole a parte). Icone di una sola famiglia. Stati vuoti, di caricamento ed errori curati.
- Negli scatti: almeno uno stato di interazione, e un fotogramma a metà animazione nei giri di movimento.

## Come si dividono le zone
«NON PUÒ SEMPRE USARE LINEE ORIZZONTALI GRIGIE E MORTE PER DIVIDERE LE ZONE... NON DICO CHE IL PROBLEMA È IL COLORE DELLA
LINEA, È PROPRIO LA LINEA, LE ZONE SI DEVONO DIVIDERE IN MODO INNOVATIVO... QUI COME OVUNQUE.»
- Le righe divisorie (`border-top/bottom`, `<hr>`, filetti da 1 px tra sezioni o righe) non sono più il modo di dividere
  le zone. Toglile da tutto il sito, a partire dalle schermate che tocchi e poi a rotazione in tutte le altre.
- Per ogni separazione trova tu un modo migliore e adatto a quel caso, e scrivi in ROUNDS.md quale hai scelto e perché.
  Una riga può restare solo dove è il contenuto stesso (per esempio l'asse di una timeline), mai come separatore.

## Vincoli fissi
- Una sola bici vera («Live · on-chain»), le altre «Sample fleet». Niente frasi che promettono più di quanto fa il
  sistema. Niente upsell, punti, timer finti, popup. Contratti, firmware, relayer e `lib/protocol.mjs` non si toccano.
- Contrasto ≥ 4,5:1 per il testo (Electric Blue #0297DE pieno solo per bottoni e accenti; per i testi la variante scura).
- Tetto di righe di `webapp/src`: +100% rispetto a 463f724 (10.560 righe), solo per codice visivo, mai per nuove funzioni.
- Foto nuove generabili in locale con la GPU (Z-Image Turbo), una alla volta, senza testo, controllate prima dell'uso.
- Mai push, mai su main.
