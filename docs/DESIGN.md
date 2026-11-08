
# Custody Tracker — design e pitch

**Tesi tecnica (una sola, per i 3–4 minuti di tecnologia):** chi ha rotto il pacco? Mittente, vettori, destinatario e assicuratore sono parti indipendenti con incentivi opposti sull'attribuzione del danno. Un device con secure element firma le misure alla fonte. Un registro append-only, che nessuna delle parti controlla da sola, lega ogni urto al custode di quel momento. Il relayer e il backend non sono fidati: se alterano un batch, la verifica P-256 on-chain fallisce.

**Risposta all'obiezione "basta un database condiviso":** il database di chi? Se è del vettore, il vettore può riscrivere chi aveva il pacco durante la caduta; se è dell'assicuratore, il vettore non ha motivo di fidarsi. Il contratto aggiunge tre garanzie che un DB di un singolo operatore non dà:
1. ordine e immutabilità dei batch (`seq` monotono, niente replay o riordino);
2. handoff a due firme, quindi nessuno riscrive da solo la catena di custodia;
3. verificabilità da parte di chiunque, con una Merkle proof contro la root ancorata.

Limiti da dire nel pitch, prima che li dica il prof:
- garbage-in: il sensore può essere manomesso fisicamente o il device staccato dal pacco;
- la soglia di danno è una convenzione contrattuale;
- la disponibilità dei dati off-chain dipende da chi conserva le letture (la root prova l'integrità, non la disponibilità).


## Scelte di protocollo (per le domande del prof)

- **Record** di 19 byte: `n | t | latE7 | lonE7 | peakCg | flags`. Le flag indicano fix GPS, urto oltre soglia e orario da GPS.
- **Merkle SHA-256** con domain separation: foglia `0x00‖rec`, nodo `0x01‖l‖r`. Il nodo dispari viene promosso senza duplicarlo, il che evita la seconda preimmagine "alla Bitcoin" (CVE-2012-2459).
- **Digest firmato:** `sha256("CLv1"‖deviceId‖seq‖root‖count‖maxPeakCg‖tStart‖tEnd)`. `deviceId = sha256(Qx‖Qy)`: l'identità del device è la sua chiave pubblica.
- **Verifica on-chain:** `P256.verify` di OpenZeppelin, che usa il precompile RIP-7212 dove c'è e altrimenti un fallback in Solidity. OZ accetta solo firme low-s, quindi il relayer normalizza `s → n − s` (una firma ECDSA resta valida). Non è un problema di sicurezza perché il replay è bloccato da `seq`.
- **Campionamento:** ADXL375 a 1600 Hz in FIFO stream, svuotata ogni 5 ms da un task FreeRTOS. Il picco per secondo è il modulo massimo. Una lettura al secondo, batch da 16 o chiusura immediata dopo un urto.
- **`seq`** oggi è un contatore in NVS. Upgrade possibile: il monotonic counter hardware dell'ATECC, così il seq non è riavvolgibile nemmeno riscrivendo la flash.

## Divisione del lavoro proposta (gruppo da 3–5)

| Persona | Cosa |
|---|---|
| Hardware/firmware | Bring-up, scatola, test di caduta con misure (g osservati vs altezza) |
| Chain/relayer | Deploy Base Sepolia, gas reale per batch, costo per spedizione |
| Business | Cliente (spedizioni di valore: farmaceutico, elettronica, arte), processo attuale dei reclami, confronto con data logger esistenti, pricing |
| Pitch | Deck da 7 minuti con demo dal vivo e video di backup |

## Numeri misurati

- Gas per batch da 16 letture: ~120k (`submitBatch` con verifica P-256), uguale in locale e su Base Sepolia.
- Costo su Base Sepolia (8 novembre 2026): 120.119 gas × 0,006 gwei ≈ 7,2·10⁻⁷ ETH per batch, L1 data fee trascurabile. Prezzo del gas di testnet: in slide va presentato come ordine di grandezza.
