# Integration guide (for Giacomo)

The web app only talks to `src/data/api.ts`. Today that file uses `src/data/mock/` (sample data with the
same shape as `docs/API.md` and the contract events). To connect the real system, write a new
`DataSource` (for example `src/data/live/source.ts`), set `export const source = liveSource` in `api.ts`,
and set `isMock: false` in `getNetwork()`. The screens do not change. The types in `src/data/types.ts` are
the contract: if a field cannot be filled, tell Edoardo before changing the type.

Units and conventions are at the top of `types.ts` (centi-g, dUSD as decimal strings, times in ms).

## Functions and where each value comes from

| Function | Source |
|---|---|
| `getNetwork()` | `deployments/<net>.json` + chain id. `explorer`: `https://sepolia.basescan.org`, `null` locally |
| `getStatus()` | `chain`: any read succeeds. `relayer`: `GET /api/state` answers **and** `contracts.custodyLog` equals ours (a relayer on localhost must not decorate Base Sepolia data) |
| `listObjects()` | `CustodyLog.shipmentCount()`, then the summary fields of `getObject(id)` |
| `getObject(id)` | see the table below |
| `getReadings(id, seq)` | relayer `GET /api/state` → `batches[seq].decoded` (`flags` bit0 gpsFix, bit1 shock, bit2 gpsTime; `t` is seconds there, ms here) |
| `getProof(id, seq, i)` | relayer `GET /api/proof?seq=&i=`. Better: recompute the proof in the browser from `records` and call `CustodyLog.verifyReading` through our own RPC, so “verified” does not depend on trusting the relayer |
| `getBalance(addr)` | `DemoUSD.balanceOf` (6 decimals) |
| `isWalletReady(id)` | `DemoUSD.balanceOf(me) >= collateral` and `DemoUSD.allowance(me, escrow) >= collateral` |
| `getAccount()` / `connectWallet()` | injected wallet (MetaMask), `eth_accounts` / `eth_requestAccounts`, then switch to chain 84532 or 31337 |
| `proposeHandover(id, to)` | owner wallet: `CustodyLog.proposeHandoff(id, to)` |
| `startRental(id)` | renter wallet: `acceptHandoff(id)`, `DemoUSD.faucet()` if balance < collateral, `approve(escrow, collateral)`, `RentalEscrow.startRental(id)` |
| `requestReturn(id)` | renter wallet: `proposeHandoff(id, owner)` |
| `confirmReturn(id)` | owner wallet: `acceptHandoff(id)`, then `RentalEscrow.endRental(id)` (anyone can call it) |
| `getDemoRenters()` | relayer `roles` (alice, bob) |
| `demoStartRental` / `demoEndRental` | relayer `POST /api/rental/start` `{renter}` / `POST /api/rental/end` |

### `getObject(id)` field by field

| Field | Source |
|---|---|
| `label`, `ownerName` | off-chain display names (object name, owner's business name). Not on-chain today: `null` falls back to "Object N" and the short address |
| `deviceId`, `owner`, `custodian` | `CustodyLog.shipments(id)`: `deviceId`, `shipper`, `custodian` |
| `status` | `pendingCustodian != 0` → `handoff-pending`; `RentalEscrow.rentals(id).active` → `rented`; custodian = owner → `available`; otherwise `held-without-deposit` |
| `terms` | `RentalEscrow.terms(id)`. **Not** `/api/state.terms`: that is a constant in the relayer (`set: false`), not the on-chain value |
| `created` | `ShipmentCreated` event |
| `periods[]` | period 0 starts at `ShipmentCreated` (custodian = `carrier` arg); each `CustodyTransferred` ends one and starts the next. `maxPeakCg`: `CustodyLog.periodMaxPeakCg(id, p)`, but **`null` when the period has no `BatchAnchored`** (the contract returns 0, which would read as a measurement) |
| `batches[]` | `BatchAnchored(id, seq, root, maxPeakCg, custodian)` + tx hash + block timestamp. `count`, `tStart`, `tEnd` from `CustodyLog.batches(id, seq)`. `period` = number of `CustodyTransferred` before it. `hw`, `gasUsed` from the relayer, `null` if offline |
| `batches[].recordedBeforeHandoff` | `tStart` (device clock) earlier than the start of the batch's period: readings taken during one custody, anchored in the next |
| `gaps`, `firstSeq`, `lastSeq` | computed from the ordered `seq` list. `firstSeq` can be > 1 (on Base Sepolia today it is 6): not a gap |
| `rentals[]` | `RentalStarted(id, renter, period, amount)`; `settlement` from `RentalSettled(id, renter, period, peakCg, tier, fee, refund)`. `causeSeq`: the batch of that period with the highest `maxPeakCg` |
| `rentals[].current` (active only) | `periodMaxPeakCg(id, period)` → `tierOf(id, peak)` → fee = collateral × bps / 10000 |
| `pendingHandoff` | last `HandoffProposed` not followed by `CustodyTransferred` |
| `totalFees` | sum of `RentalSettled.fee` |

Ignore `DamageDetected`, `Delivered` and `shipments().damaged`: they use the old single shipment threshold
(`maxAllowedCg`), not the three rental tiers.

## Pitfalls already measured (2026-11-09, read-only)

- **`https://sepolia.base.org` caps `eth_getLogs` at 200 blocks**, and Base Sepolia makes ~5 blocks/s, so 200
  blocks ≈ 40 s. Use it for `eth_call` only. `https://base-sepolia-rpc.publicnode.com` accepts 50,000-block
  ranges (it prunes old state, so no historical `getCode`).
- **No deploy block in `deployments/*.json`.** The first event of the current contracts is at block
  **56195362**: start log scans there. All events up to block ~56.7M = 12 logs, 17 calls, ~3 s.
  Proposal: have `scripts/deploy.mjs` write `deployBlock`.
- **`artifacts/` is gitignored**: a published build cannot import ABIs from it. Copy them into `src/` as
  `as const` TypeScript (a working script is in Edoardo's step-0 code, ask him).
- **Local chain restart**: Hardhat redeploys to the same addresses, so a cache keyed by address keeps stale
  events. Check the hash of the last synced block before extending and start over if it changed.
- **Relayer demo endpoints answer only at the end** (4–6 txs, 10–30 s on Base Sepolia). The UI expects step
  updates through `onSteps`: emit them by watching `HandoffProposed` / `CustodyTransferred` / `RentalStarted` /
  `RentalSettled` while the POST is in flight.
- **Do not mix wallet and relayer flows in one demo run**: the relayer keeps its own `custodian` per object in
  `data/<net>.json`; after a wallet rental it is stale and its Unlock/Return buttons fail.
- **Relayer POSTs have no authentication**: exposed through a tunnel, anyone can trigger rentals and spend the
  testnet ETH. A published web app on https also cannot call `http://localhost` (Chrome blocks it).
- **Unlock is not atomic**: `acceptHandoff` and `startRental` are separate transactions. If the deposit fails
  the renter holds the object with no collateral (`held-without-deposit`). Contract topic, not web app.
- **Polling**: keep it at 2 s locally and ≥ 4 s on the public RPCs; pause when the tab is hidden.

## Pairing a chip with an object (the "Add an object" flow) — contract topics

Today the owner of every object is the relayer: on the first batch it calls `registerDevice` and
`createShipment` itself. A real owner pairing their own chip from the web app runs into three problems.
None is fixable in the web app.

- **Anyone can claim any chip.** `createShipment(deviceId, …)` accepts any registered `deviceId` from any
  sender. Whoever reads the chip's QR (its public key) can create an object for it first and become its owner.
  A safe pairing needs a proof that the caller holds the chip, e.g. a challenge signed by the secure element.
- **One chip can back several objects, and its batches can be replayed into each of them.** `batchDigest`
  covers `deviceId` and `seq` but not the shipment id, and `lastSeq` is tracked per shipment. A batch signed
  for object A is also valid for any other object created on the same `deviceId`.
- **The relayer would race the owner.** `ensureAsset` in `relayer/server.mjs` creates an object as soon as an
  unknown device sends a batch. With owner pairing, the relayer must wait for the owner's `createShipment`
  instead of creating one with itself as owner.

Thresholds suggested by object type come from the table in `docs/CALIBRATION.md` (indicative, not yet
measured). Peaks include gravity (+1 g), and anything ≥ 200 g on an axis is saturated, so a "strong"
threshold above ~180 g can never be told apart from saturation.

## Trying the states

Every UI state has a mock scenario: `?scenario=<name>&as=owner|alice|bob|none`. The list with
descriptions is in `src/data/mock/scenarios.ts`. When the live source is in, keep the mock reachable
(for example `?mock=1`) for the presentation screenshots and plan B.

## Gaps found while designing the flows (contract topics, for Giacomo)

- **The deposit can be held hostage.** A return counts only after the owner's `acceptHandoff`, and nothing
  expires: if the owner never confirms, `endRental` can never run and the deposit stays locked. Proposal: a
  deadline (e.g. 24 h after `proposeHandoff` to the owner) after which anyone can close the custody period and
  settle. Careful: a pure timeout lets a renter "return" on paper and keep the bike, so it needs a counterweight
  (the owner can dispute within the window, or the recorder's position at the return).
- **There is no rental price.** `RentalEscrow` only holds the deposit and withholds damage fees, so the owner's
  only on-chain income is damage. The wireframes show a price ("2 dUSD/hour") marked "not in today's
  contract". Paying it outside the contract brings back the trust problem; it belongs in `startRental` /
  `endRental` (price × duration from the block timestamps).
- **Demo timing.** The unlock is 4 transactions for a fresh wallet (`acceptHandoff`, `faucet`, `approve`,
  `startRental`). Before the demo, run `faucet` and one `approve` with an allowance covering several rentals,
  so the live unlock is 2 signatures. Today the relayer approves exactly the collateral each time.

## The map (`getFleet`)

- List only objects that are free now: `custodian == shipper`, no pending handoff, no active rental.
  **Never list a rented object and never expose its position**: it is the position of a person (VISION §6).
- Position of a free bike: the owner's spot (off-chain, set when the object is added), not the last GPS
  reading. The last reading can be where the renter left it before the owner confirmed the return.
- `record`: settled rentals and drops from `RentalSettled` (`tier > 0`), most recent first.
- Only the demo bike is `live: true`. The rest of the map is `src/data/mock/fleet.ts`, labelled "Sample fleet":
  keep it that way in the demo, or remove it; never mark sample bikes as live.
- Tiles: OpenStreetMap, darkened in CSS. CARTO's dark basemap now needs an API key (not usable from a
  public front-end without exposing it). Tiles need internet: test the classroom network before the demo.

## The renting path (`startRental`, `requestReturn`, demo confirm)

- **Who offers the bike.** A renter can't start alone: `acceptHandoff` needs the owner's `proposeHandoff` first.
  In the UI the first step is "The owner offers you the bike", signed by the owner's side without a wallet
  prompt. For real this needs an owner-side service (the relayer with an endpoint "offer object N to address A")
  or a contract change where the owner pre-authorises handovers. Today the relayer's `/api/rental/start` only
  knows alice and bob.
- **Allowance.** The mock approves 10 deposits at once, so from the second rental the unlock is 2 signatures
  (accept, deposit). Trade-off: the escrow can pull up to that amount. An exact approval each time is safer but
  costs one signature more.
- **Demo "have the owner confirm now"** on the waiting page calls `demoEndRental`. With the real relayer that
  endpoint proposes the return with the renter's key, which it holds only for alice and bob: for a wallet renter
  it needs an endpoint that only accepts (`acceptHandoff` + `endRental`).
- **The ride map shows readings** (positions) of the current rental, to the renter only. The relayer's
  `GET /api/state` serves every reading to anyone today: before real users, the raw readings need access control.

## Adding an object (`lookupRecorder`, `addObject`)

- `lookupRecorder(qr)`: the QR on the recorder carries its public key (qx, qy). `deviceId = sha256(qx || qy)`;
  `registered` from `CustodyLog.devices(deviceId)`; `objects` = `ShipmentCreated` events with that `deviceId`.
  `lastSeenAt` / `batteryPct` come from the relayer (the last batch it received), `null` if unknown.
- `addObject`: `registerDevice(qx, qy)` (skip if already registered) → `createShipment(deviceId, owner, 0x0, lightCg)`
  → `RentalEscrow.setTerms(id, terms)`, all from the owner's wallet. `label`, `kind`, `spot` and `pricePerHour` are
  off-chain. Until pairing needs a signature from the recorder (see the pairing gaps above), the UI warns when
  a recorder already has objects but cannot stop it.
