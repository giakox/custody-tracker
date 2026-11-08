
# Custody Tracker — design e pitch

La tesi, il perché della blockchain, i limiti e la demo sono in `docs/VISION.md`. Questo file raccoglie le scelte tecniche, per rispondere alle domande del professore.

## Scelte di protocollo (per le domande del prof)

- **Record** di 19 byte: `n | t | latE7 | lonE7 | peakCg | flags`. Le flag indicano fix GPS, urto oltre soglia e orario da GPS.
- **Merkle SHA-256** con domain separation: foglia `0x00‖rec`, nodo `0x01‖l‖r`. Il nodo dispari viene promosso senza duplicarlo, il che evita la seconda preimmagine "alla Bitcoin" (CVE-2012-2459).
- **Digest firmato:** `sha256("CLv1"‖deviceId‖seq‖root‖count‖maxPeakCg‖tStart‖tEnd)`. `deviceId = sha256(Qx‖Qy)`: l'identità del device è la sua chiave pubblica.
- **Verifica on-chain:** `P256.verify` di OpenZeppelin, che usa il precompile RIP-7212 dove c'è e altrimenti un fallback in Solidity. OZ accetta solo firme low-s, quindi il relayer normalizza `s → n − s` (una firma ECDSA resta valida). Non è un problema di sicurezza perché il replay è bloccato da `seq`.
- **Campionamento:** ADXL375 a 1600 Hz in FIFO stream, svuotata ogni 5 ms da un task FreeRTOS. Il picco per secondo è il modulo massimo. Una lettura al secondo, batch da 16 o chiusura immediata dopo un urto.
- **`seq`** oggi è un contatore in NVS. Upgrade possibile: il monotonic counter hardware dell'ATECC, così il seq non è riavvolgibile nemmeno riscrivendo la flash.

## Collaterale (RentalEscrow)

- **Periodi di custodia:** `CustodyLog.custodyPeriod(id)` aumenta a ogni passaggio accettato; `periodMaxPeakCg(id, periodo)` tiene il picco massimo di quel periodo. Un noleggio = un periodo, quindi l'urto di un cliente non può pesare sul successivo, e l'escrow non deve scorrere i batch.
- **Regolamento senza arbitro:** `endRental` è chiamabile da chiunque, ma solo dopo che la custodia è passata ad altri (`StillInCustody`). L'esito dipende solo da soglie fissate prima dello sblocco e dai batch firmati dal device.
- **Condizioni bloccate durante il noleggio:** il proprietario non può cambiare soglie o trattenute mentre un noleggio è attivo (`RentalActive`).
- **Token:** `DemoUSD`, ERC-20 a 6 decimali come USDC, coniabile liberamente: è solo per la testnet. In produzione: USDC su Base.

## Numeri misurati

- Gas per batch da 16 letture: ~120k con il solo `CustodyLog`, ~145k dopo l'aggiunta del picco per periodo (una scrittura in storage in più).
- Costo su Base Sepolia (8 novembre 2026): ~145k gas × 0,006 gwei ≈ 8,7·10⁻⁷ ETH per batch, L1 data fee trascurabile. Prezzo del gas di testnet: in slide va presentato come ordine di grandezza.
