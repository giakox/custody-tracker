# The black box for physical objects

Reference document for the group project (30518 Introduction to Blockchain, Bocconi). If anything in the code or the slides contradicts this file, this file wins.

## 1. The problem

**Today, the truth about the state of a physical object belongs to whoever has the most power.**

- At a car rental desk, the scratch is yours because the company says so.
- If a shipment arrives broken, the courier decides.
- With a used bike, you have to trust the seller.
- The security deposit is kept by whoever collects it.

In each of these cases, the party that keeps the record is also a **party to the dispute**. The record is kept by exactly the people who have an interest in writing it in their own favor.

## 2. The idea

**The object becomes a witness to itself.**

A chip attached to the object holds a cryptographic key that cannot leave the silicon (a secure element). It measures what happens to the object: shocks, drops, location, who has it in custody. It **signs** these measurements and writes them to a **public ledger that none of the parties controls**: a blockchain. A smart contract enforces the agreed rules, for example returning the deposit, without anyone having to trust anyone.

**The vision: every object that is shared, rented, shipped or resold has a public black box, like aircraft do.** A memory of the physical world that belongs to no one, written by the objects themselves.

What changes when objects have a black box:

| Today | With the black box |
|---|---|
| Rentals: disputes at the counter, deposit withheld at the lender's discretion | the deposit settles itself based on what the object recorded |
| Insurance: surveys, months of waiting | **parametric** policies that pay out automatically on the recorded event |
| Second-hand market: "trust me, it's never been dropped" | a verifiable history raises the value of objects that were treated well |
| International car rental: history stays in each branch's management system | the history follows the vehicle across countries, companies and owners |
| Logistics: every carrier has its own system | a single chain of custody, signed at every handoff |

## 3. The first application: rentals with collateral

This is the case discussed with the professor, and it is the one in the demo.

1. **Unlock.** The renter unlocks the object (bike, scooter, camera, car) from the app and deposits **collateral** in stablecoins on an L2 (Base). The collateral is held by the contract, not by the rental company. On-chain, the renter becomes the **custodian** of the object, through a handoff signed by both parties.
2. **Use.** The chip records continuously. Each group of readings is signed by the chip and written on-chain, attributed to the custodian at that moment.
3. **Return.** The object goes back to the owner, with another handoff signed by both.
4. **Automatic settlement.** The contract looks at the strongest shock that occurred **during that rental**:
   - no shock above threshold → collateral returned in full;
   - **light / medium / strong** shock → 10% / 40% / 100% fee withheld (values to be calibrated), and the rest goes back to the renter.
5. **History.** Even months later, anyone can see who had the object when it was dropped. The next renter cannot be charged for old damage.

Market: the professor suggests starting with **businesses** (sharing operators like Lime or ATM, and above all **international car rental**, where the history has to travel across countries), not with private individuals. Phase 2: **two-way scoring**, meaning the renter sees the vehicle's history and the rental company sees the renter's reliability, subject to the privacy constraint (see §6).

## 4. Why a blockchain and not a database

This is the central question of the course. The answer has three levels.

### 4.1 The formal test

Wüst and Gervais, *"Do you need a blockchain?"* (2018). A blockchain makes sense only if all of these conditions hold:

| Question | In our case |
|---|---|
| Is shared state needed? | yes: the object's history and who had custody of it |
| Are there multiple writers? | yes: object, owner, renters, and in future insurers and buyers |
| Is there a third party trusted by everyone and always available? | **no**: whoever runs the database is a party to the dispute or becomes the new point of trust |
| Do the parties trust each other? | **no**: they have opposing interests over who caused the damage |
| Is public verification needed? | yes: surveyors, judges, future buyers |

With these answers, the test points to a **public, or permissionless, blockchain**.

### 4.2 What a database cannot do

1. **Neutrality.** "Whose database?" If it belongs to the rental company, it can rewrite who had the object when it was dropped. If it is ours, the renter has to trust us. The blockchain removes the owner of the ledger.
2. **Survival.** The history has to outlive the company that wrote it. If the rental company goes bankrupt or changes its management system, its database disappears. The on-chain history follows the object across companies, countries and owners.
3. **Money and data in the same system.** The collateral is held by code, not by the counterparty. The renter does not have to trust that the deposit will come back: the rule is public and executes itself. A database can record a debt, but it cannot hold money neutrally.
4. **Permissionless verification.** Anyone can check a single reading with a **Merkle proof** against the public ledger, without access to anyone's server and without asking anyone for anything.

### 4.3 The technical subtlety

Are the chip's signatures enough, without a blockchain? **No.** A signature guarantees that a reading is **authentic**, but whoever stores the signed readings can always **omit** one, for example the batch containing the shock. The blockchain guarantees **completeness and ordering**: every batch has an increasing sequence number, and on-chain it is immediately visible if one is missing. You can also see when it was written and who was the custodian at the time.

**Signing at the source = authenticity. Public ledger = nobody hides, deletes or reorders.** You need both.

### 4.4 The predictable objections, with answers

- *"A database shared among the companies in the industry?"* That is a consortium: it works as long as the members trust the operator. It does not include the renter, it does not hold money, and it dies with the consortium.
- *"A digital notary, a timestamping service?"* It guarantees the date, not completeness. It remains a single intermediary and does not handle the collateral.
- *"Isn't blockchain slow and expensive?"* On an L2 like Base, a group of 16 readings costs about 145,000 gas, i.e. **less than 10⁻⁶ ETH on testnet**, a fraction of a cent. Only a fingerprint (Merkle root) goes on-chain every 16 readings, not the data.

## 5. What already exists (verified on hardware)

- Chip: ESP32 + ADXL375 accelerometer (up to 200 g, 1600 measurements/s) + GPS + ATECC608 secure element, battery-powered.
- Every 16 seconds, or immediately after a shock, the chip signs a group of readings and sends it.
- `CustodyLog` contract on **Base Sepolia**: verifies the chip's signature on-chain, records the chain of custody with two-signature handoffs, and attributes each shock to the custodian at that moment.
- `RentalEscrow` contract on Base Sepolia: test-stablecoin collateral, automatic fee withheld by shock level. Tested end-to-end.
- Minimal dashboard and API for the web app.

Details: `docs/STATUS.md`. Technical choices: `docs/DESIGN.md`.

## 6. Limitations (to state before the professor does)

- **The oracle problem.** The blockchain guarantees the data it receives, not that the data is true. Our answer is to sign at the source with a secure element: the data cannot be altered afterwards. Physical tampering remains (chip detached, sensor shielded), which is limited by rigid mounting and an enclosure that shows if it has been opened.
- **A shock is not damage.** An acceleration peak is an indication, not a survey. The thresholds are a rule the renter accepts at unlock, calibrated with real drop tests (`docs/CALIBRATION.md`).
- **Privacy.** GPS routes and scoring of individuals must not end up in the clear on-chain (GDPR, right to erasure). Only cryptographic fingerprints go on-chain; personal data stays off-chain, under the user's control.
- **Data availability.** The chain proves that the readings have not been altered, but someone still has to store the readings themselves. Evolution: decentralized storage (IPFS/Arweave).
- **Connectivity and power.** Today it uses WiFi, with about 12–15 h of battery life. In a product: LTE-M/NB-IoT or Bluetooth to the renter's phone, and lower power consumption.

## 7. Roadmap

1. **Today:** rentals with collateral (the demo).
2. **Next:** a public history per object, valid across companies and countries (international car rental, fleets).
3. **Next:** parametric insurance that reads the history and pays out automatically.
4. **Next:** a second-hand market with verifiable history; two-way scoring with privacy protection.
5. **Vision:** the black box as the standard for any valuable object that changes hands.

## 8. The demo (about 90 seconds)

1. The "bike" (the box with the chip) belongs to the owner. The renter unlocks it and **50 test USD** go into the contract.
2. The renter uses it and the readings arrive on-chain.
3. **The box is dropped.** The shock appears, attributed to the renter, with the link to the transaction on basescan.
4. The renter returns it. **The contract withholds the fee and returns the rest, on its own.**
5. Click on a reading and show the cryptographic proof verified on-chain: anyone can check it.

Plan B: a recorded video of the same sequence.
