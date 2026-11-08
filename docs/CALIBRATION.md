# Calibrazione dell'accelerometro e soglie di urto

## Cosa ci ha passato l'altro team

Un driver MicroPython per ADXL375 su Raspberry Pi Pico (I2C su GP0/GP1). In sintesi:

- `BW_RATE = 0x0A`, cioè **100 Hz** di output data rate (banda utile circa 50 Hz);
- lettura dei 6 byte `DATAX0..DATAZ1`, complemento a due, scala 49 mg/LSB convertita in m/s²;
- **calibrazione statica**: 100 campioni a dispositivo fermo e in piano, poi `offset_x = media_x`, `offset_y = media_y`, `offset_z = media_z − 1 g`, sottratti a ogni lettura;
- nell'esempio la lettura è un polling ogni 500 ms.

### Cosa vale la pena prendere

- **L'azzeramento dell'offset è corretto e utile.** Il nostro sensore da fermo legge 0,77–1,15 g invece di 1,00 g: è l'offset di fabbrica per asse (fino a qualche centinaio di mg), coerente con il datasheet. Per la soglia "forte" (decine di g) non conta; per una soglia "leggera" di pochi g sì.

### Cosa non va preso, e perché

1. **100 Hz sono troppo pochi per gli urti.** Un impatto su una superficie rigida dura 1–5 ms. Con un campione ogni 10 ms, un picco di 2 ms viene visto in media una volta su cinque. In più il filtro interno del chip a 50 Hz di banda attenua proprio il picco. Il risultato è una sottostima sistematica e casuale del picco. Il nostro firmware campiona a **1600 Hz** (circa 800 Hz di banda) in FIFO stream, svuotata ogni 5 ms: nessun campione perso.
2. **Polling ogni 500 ms** senza FIFO: in pratica si perdono tutti gli urti. Serve la FIFO, o almeno un interrupt di soglia (`THRESH_SHOCK` su INT1).
3. **La calibrazione assume Z verso l'alto.** Se il chip è montato di lato (su un telaio di bici, in verticale), `z − 1 g` introduce un errore di 1 g su un asse e lo "nasconde" su un altro. Il dispositivo deve funzionare in qualunque orientamento.

## Cosa facciamo noi

### 1. Picco dinamico, indipendente dall'orientamento

Oggi il firmware registra `peakCg = max |a|`, cioè il modulo del vettore, che **include la gravità**: da fermo vale circa 1 g, indipendentemente da come è montato. Per le soglie conviene la componente dinamica:

- **semplice:** `|a| − 1 g` (errore massimo ±1 g, irrilevante sopra i 5 g);
- **corretto:** stimare la gravità con un passa-basso per asse (τ ≈ 0,5–1 s) a dispositivo fermo, poi `peak = max |a − g_stimata|`. Funziona in qualunque orientamento e anche se il bene si inclina lentamente.

### 2. Azzeramento dell'offset, in hardware

L'ADXL375 ha i registri `OFSX/OFSY/OFSZ` (0x1E–0x20, 0,196 g/LSB, complemento a due) che sottraggono l'offset dentro il chip. Procedura (comando seriale `CAL` da aggiungere al firmware):

1. dispositivo fermo, in qualunque orientamento noto (meglio: in piano);
2. media di circa 1600 campioni (1 s);
3. offset per asse = media − valore atteso (0, 0, ±1 g sull'asse verticale), arrotondato a 0,196 g;
4. scrittura in `OFS*` e salvataggio in NVS, poi riapplicazione a ogni avvio.

Residuo atteso dopo la calibrazione: meno di 0,1 g, cioè sotto il rumore di quantizzazione (49 mg/LSB).

### 3. Soglie a tre livelli (leggero / medio / forte)

Il prodotto (vedi `docs/PRODUCT.md`) trattiene una fee in base alla gravità dell'urto. Le soglie **vanno misurate**, non inventate, perché il picco dipende quasi tutto da **come** il bene si ferma:

- da un'altezza h la velocità d'impatto è v = √(2gh);
- se l'arresto avviene in uno spazio d, il picco medio è a/g ≈ h/d;
- 50 cm su un pavimento rigido con d ≈ 1–2 mm danno **250–500 g**, oltre il fondo scala di 200 g; la stessa caduta dentro una scatola imbottita con d ≈ 1 cm dà circa **50 g**.

**Quindi lo stesso urto dà numeri diversi a seconda di bene, fissaggio e superficie: la calibrazione si fa per tipo di bene, con il chip montato come nel prodotto.**

Ordini di grandezza indicativi, da sostituire con le nostre misure:

| Contesto | Picchi tipici |
|---|---|
| bici: buche, marciapiedi | 5–20 g sul telaio |
| bici o monopattino a terra da fermo | 20–80 g |
| oggetto (telecamera) caduto su superficie dura | 100–500 g, spesso in saturazione |
| auto: urto a bassa velocità (parcheggio) | 3–10 g, ma lungo (50–150 ms) |

L'ultima riga mostra il limite del solo picco: un tamponamento ha picco basso ma dura molto. Per le auto serve anche il **Δv** (integrale dell'accelerazione dinamica durante l'evento), che è un indicatore di danno migliore del picco.

### Procedura di test di caduta

1. Chip fissato rigido al bene (o alla scatola della demo), firmware normale con `CAL` già fatto.
2. Altezze: 10, 20, 30, 50, 80 cm; superfici: tavolo di legno, pavimento, tappetino. **5 ripetizioni** per combinazione.
3. Per ogni prova: picco registrato (dal batch on-chain o dal log seriale), segnando se è in saturazione (≥ 200 g su un asse).
4. Tabella e grafico picco vs altezza per superficie, con media e dispersione.
5. Soglie proposte: **leggero** = sopra il rumore d'uso normale (massimo di 10 minuti di uso senza cadute) + margine; **medio** = caduta da circa 30 cm; **forte** = caduta da circa 80 cm o saturazione.

Il grafico è materiale per le slide: mostra che le soglie vengono da misure, non da un numero scelto a caso.

## Stato

- [x] Campionamento a 1600 Hz in FIFO, picco per secondo, chiusura immediata del batch dopo un urto.
- [ ] Comando `CAL` con offset in `OFS*` + NVS.
- [ ] Picco dinamico (gravità sottratta).
- [ ] Tre soglie al posto di `SHOCK_CG` / `maxAllowedCg` (firmware + contratto).
- [ ] Test di caduta e tabella.
