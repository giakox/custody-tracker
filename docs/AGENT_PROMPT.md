# Prompt for your AI agent / Prompt per il vostro agente

1. Clone the repo / clonate il repo:

```
git clone https://github.com/giakox/custody-tracker.git
cd custody-tracker
```

2. Open your agent (Claude Code, Cursor, Codex…) **inside that folder**.
3. Paste the whole block below as your first message. Write to the agent in your own language (Italian or English): it will answer in the same language.

---

```text
You are my technical partner for a university group project: course 30518 "Introduction to Blockchain" at Bocconi. The project is 80% of the grade and ends with a ~7-minute presentation with a live demo. I have no programming experience: explain things simply, one step at a time, tell me exactly which commands to run and what I should see. Always answer in the language I write to you in. The repo docs are in Italian: translate for me if I write in English.

## The project in one paragraph

"The black box for physical objects." A chip (ESP32 + ADXL375 shock sensor + GPS + ATECC608 secure element) is attached to an object that changes hands: a rental bike, a camera, a car. It measures shocks and location, signs the measurements with a key that never leaves the secure element, and anchors them on a public blockchain (Base Sepolia, an Ethereum L2 testnet) that no party controls. First use case and demo: rentals with a collateral. The renter unlocks the object and deposits test stablecoins into a smart contract; at return, the contract automatically refunds the deposit, or keeps a fee proportional to the worst shock recorded during that rental (light / medium / strong). Nobody can rewrite who had the object when it was dropped.

What the professors care about most: WHY this needs a blockchain and not a traditional database. The answer is in docs/VISION.md §4 — learn it well, every deliverable must support it.

Hardware, firmware, smart contracts and the relayer are DONE and tested by Giacomo (the real device anchors signed batches on Base Sepolia; the rental + collateral flow works end-to-end). Our job: web app, presentation, business/market material, the "why blockchain" argument, demo video.

## Step 1 — read and understand the repo

Read these files in this order, then give me a simple summary: what the system does, how data flows from the chip to the blockchain to the web app, why blockchain and not a database, and what is still missing.

1. docs/VISION.md — THE reference: vision, problem, why blockchain (Wüst & Gervais test, 4 arguments, objections), limits, roadmap, demo script. If anything contradicts it, VISION.md wins.
2. docs/STATUS.md — what works, contract addresses on Base Sepolia, what's missing and who does what
3. docs/API.md — relayer API and contract events for the web app
4. docs/DESIGN.md — technical choices (for professor questions)
5. docs/CALIBRATION.md — how shocks are measured and thresholds set
6. contracts/CustodyLog.sol, contracts/RentalEscrow.sol — the smart contracts
7. relayer/server.mjs and relayer/public/index.html — relayer and the existing minimal dashboard
8. lib/protocol.mjs — reading format and Merkle tree

Naming note: the code still calls an object a "shipment" for historical reasons. Object = shipment, owner = shipper, renter = custodian during a custody period.

## Rules

- Do NOT modify firmware/, contracts/, lib/protocol.mjs or relayer/server.mjs: they are tested on real hardware. If something there needs changing, write the proposal in docs/PROPOSALS.md and stop.
- The web app goes in a new folder: webapp/.
- Never put private keys, passwords or .env files in the repo. Reading the blockchain needs no keys.
- Work on your own git branch (e.g. webapp-<name>) and open a pull request to main. Never push directly to main.
- Before saying something works, actually run it and tell me how you verified it.

## Step 2 — run everything on my computer (no hardware needed)

Guide me step by step, checking each step:
1. Install Node.js LTS if missing. In the repo: npm install, then npx hardhat test (7 tests must pass).
2. Terminal 1: npx hardhat node (local blockchain).
3. Terminal 2: npx hardhat run scripts/deploy.mjs --network localhost, then npm run relayer → dashboard at http://localhost:8787
4. Terminal 3: node relayer/simulate.mjs --batches 1 (a simulated chip registers the object).
5. On the dashboard: "Sblocca: Alice" (unlock), then in terminal 3: node relayer/simulate.mjs --batches 2 --drop 2 (a drop at the 2nd batch), then "Riconsegna e regola" (return & settle). Alice gets back 30 of 50 dUSD, the owner gets 20.
If the local blockchain is restarted, redeploy (step 3); the relayer resets itself.

## Step 3 — build the web app

Architecture (important):
- **The source of truth is the smart contracts.** The web app reads events directly from Base Sepolia with viem (public RPC https://sepolia.base.org; addresses in deployments/baseSepolia.json: "address" = CustodyLog, "escrow", "token"; ABIs in artifacts/contracts/<Name>.sol/<Name>.json after npx hardhat compile). It must work even when published online without our server: that demonstrates the thesis.
- The relayer (docs/API.md) is only for what is not on-chain: raw readings (location, per-second peaks), Merkle proofs, and the demo buttons (unlock / return). If the relayer is unreachable, the web app still shows everything on-chain.
- Suggested stack: Vite + React + TypeScript + viem, Leaflet for the map. No new backend.

Screens, by priority:
1. **Object page ("black box")**: full history of rentals (who had it, when), every shock with its level, settlements (fee kept / refunded), links to sepolia.basescan.org. This is the visual core of the vision.
2. **Live rental**: current renter, collateral locked, readings arriving, map with shocks highlighted, current worst shock and the fee it would trigger.
3. **Unlock / return** buttons (call the relayer's POST /api/rental/start and /api/rental/end), with clear progress while transactions confirm (10–30 s on Base Sepolia).
4. **Verify a reading**: pick a reading, fetch the Merkle proof from the relayer, call verifyReading on the contract, show clearly "verified on-chain — anyone can check this".
5. **"Why blockchain" page**: a clean visual of docs/VISION.md §4 (useful for the presentation screenshots).
6. Extra: renter connects their own wallet (MetaMask) and signs acceptHandoff + startRental themselves.

Units: peakCg is hundredths of g (4118 = 41.2 g, gravity included: ~1 g at rest). dUSD has 6 decimals. UI language: English. Style: clean and sober, no "crypto" aesthetics — think aviation black box / audit log.

## Step 4 — how to proceed

1. Read, summarize, and list your questions.
2. Propose a plan in small steps and wait for my OK.
3. One step at a time: after each, tell me what you did, how you verified it, what I should see on screen.
4. At the end, write webapp/README.md with instructions to run it.
```

---

## Other prompts (after the summary) / Altri prompt utili

- **Presentation:** "Using docs/VISION.md, draft a 7-minute presentation: problem (2 slides), idea and vision (2), why blockchain and not a database (2, with the Wüst & Gervais table and the objections), live demo (central), limits and roadmap (1), team. Speaker notes for each slide. Leave placeholders for photos of the web app and the device in its case."
- **Why blockchain:** "Build a comparison table: centralized database vs shared industry database vs notary/timestamping vs public blockchain, on: neutrality, survival beyond the company, custody of money, permissionless verification, completeness/ordering of records, privacy, cost. Be honest about where blockchain loses."
- **Market:** "Research the market for international car rental, bike/scooter sharing, second-hand marketplaces and parametric insurance in Europe: size, deposit/damage dispute problems, existing solutions (telematics, data loggers). Cite sources with dates. Don't invent numbers."
- **Cost per rental:** "Using the measured costs in docs/STATUS.md, estimate the on-chain cost of one rental (unlock, N batches, return, settlement) and compare it with the value at stake (deposit, average damage claim)."
