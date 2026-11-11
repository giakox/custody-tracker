// Data contract between the interface and the real integration.
// The UI only imports from src/data (this file and api.ts). Today api.ts is backed by mocks;
// Giacomo replaces the implementations, not these types. Sources of every field: INTEGRATION.md.
//
// Conventions
// - Addresses and hashes: 0x-prefixed hex strings.
// - Peaks: integer hundredths of g, gravity included (4118 = 41.2 g, ~100 at rest). Same as docs/API.md.
// - dUSD amounts: decimal strings already converted from 6 decimals ("50", "20", "12.5"). Same as docs/API.md.
// - Times: unix milliseconds.

export type Hex = `0x${string}`;
export type Address = Hex;
export type TxHash = Hex;

/** Damage tier from RentalEscrow.tierOf: 0 none, 1 light, 2 medium, 3 strong. */
export type Tier = 0 | 1 | 2 | 3;

export type NetworkInfo = {
  id: "localhost" | "baseSepolia";
  label: string;
  chainId: number;
  /** Block explorer base URL, null on the local chain. */
  explorer: string | null;
  contracts: { custodyLog: Address; escrow: Address; token: Address };
  /** True while the data is sample data. The UI must say so visibly. */
  isMock: boolean;
};

/** Health of the two data sources. The chain is required; the relayer is optional. */
export type SourceStatus = {
  chain: "ok" | "unreachable";
  /** Relayer: raw readings, map, Merkle proofs, demo buttons. Everything else works without it. */
  relayer: "ok" | "offline";
};

/** An address with an optional human label (demo roles come from the relayer: owner, alice, bob). */
export type Party = {
  address: Address;
  label: string | null;
  role: "owner" | "renter" | "unknown";
};

/** The on-chain transaction that proves a fact. */
export type Anchor = { tx: TxHash; block: number; at: number };

export type Terms = {
  collateral: string;
  lightCg: number;
  mediumCg: number;
  strongCg: number;
  /** Share of the collateral withheld per tier, in basis points (1000 = 10%). */
  lightBps: number;
  mediumBps: number;
  strongBps: number;
};

export type Batch = {
  /** Device sequence number. Strictly increasing; gaps are possible (see ObjectDetail.gaps). */
  seq: number;
  root: Hex;
  /** Number of readings in the batch (usually 16, fewer if closed early by a shock). */
  count: number;
  maxPeakCg: number;
  /** First and last reading time according to the device clock. */
  tStart: number;
  tEnd: number;
  /** Custodian stored by the contract when the batch was anchored: the one it is attributed to. */
  custodian: Party;
  /** Custody period the batch counts towards. */
  period: number;
  anchor: Anchor;
  /**
   * Readings taken before the custody period it was anchored in had started: e.g. recorded
   * during a rental but anchored after the return, so attributed to the next custodian.
   */
  recordedBeforeHandoff: boolean;
  /** Signed by the secure element (true) or the software key (false). null if unknown (relayer offline). */
  hw: boolean | null;
  /** Gas used by the anchoring transaction, null if unknown. */
  gasUsed: string | null;
};

export type ReadingFlags = { gpsFix: boolean; shock: boolean; gpsTime: boolean };

/** One per-second reading inside a batch. Only the relayer has these (on-chain there is the root). */
export type Reading = {
  index: number;
  /** Reading counter on the device. */
  n: number;
  t: number;
  lat: number;
  lon: number;
  peakCg: number;
  flags: ReadingFlags;
};

export type CustodyPeriod = {
  period: number;
  custodian: Party;
  start: Anchor;
  /** null for the current period. */
  end: Anchor | null;
  /** Highest peak in the period, null if no batch was anchored in it (do not show it as 0 g). */
  maxPeakCg: number | null;
  batchCount: number;
};

export type Settlement = {
  peakCg: number;
  tier: Tier;
  fee: string;
  refund: string;
  anchor: Anchor;
  /** Batch that holds the period's peak, to explain why the fee was withheld. null if tier 0. */
  causeSeq: number | null;
};

export type Rental = {
  period: number;
  renter: Party;
  collateral: string;
  started: Anchor;
  status: "active" | "settled";
  /** Active rental only: what the contract would withhold if it were settled now. */
  current: { peakCg: number | null; tier: Tier; wouldWithhold: string; wouldRefund: string } | null;
  settlement: Settlement | null;
};

export type SeqGap = { after: number; before: number; missing: number };

/**
 * available: with the owner, no rental · rented: renter holds it and the collateral is deposited ·
 * handoff-pending: a handoff was proposed and not accepted yet ·
 * held-without-deposit: someone other than the owner holds it with no active rental (e.g. the renter
 * accepted custody but the deposit failed or was never sent: acceptHandoff and startRental are separate txs).
 */
export type ObjectStatus = "available" | "rented" | "handoff-pending" | "held-without-deposit";

export type ObjectSummary = {
  id: number;
  /** Off-chain display name. Not on-chain today: show "Object #id" when null. */
  label: string | null;
  deviceId: Hex;
  owner: Party;
  /** Off-chain name of the owner shown to renters ("Giacomo's bikes"); null shows the short address. */
  ownerName: string | null;
  custodian: Party;
  status: ObjectStatus;
  activeRental: Rental | null;
  lastBatchAt: number | null;
  rentalCount: number;
  /** Sum of the fees withheld across settled rentals (owner income). */
  totalFees: string;
};

export type ObjectDetail = ObjectSummary & {
  terms: Terms;
  periods: CustodyPeriod[];
  batches: Batch[];
  rentals: Rental[];
  gaps: SeqGap[];
  /** First seq anchored for this object. Can be > 1: the device counter runs before registration. */
  firstSeq: number | null;
  lastSeq: number | null;
  pendingHandoff: { from: Party; to: Party; anchor: Anchor } | null;
  created: Anchor;
};

export type ProofResult = {
  reading: Reading;
  /** Raw 19-byte record. */
  record: Hex;
  root: Hex;
  proof: Hex[];
  /** Result of CustodyLog.verifyReading on the contract. */
  verifiedOnChain: boolean;
};

// --- Transactions -------------------------------------------------------------------------

export type TxStepId = "propose" | "accept" | "faucet" | "approve" | "deposit" | "settle" | "register" | "create" | "setTerms";

export type TxStep = {
  id: TxStepId;
  /** Who signs this step. The UI words the step from id + signer (copy lives in the UI). */
  signer: Party;
  /** true: the user's wallet signs (expect a wallet prompt). false: the relayer signs (demo flows). */
  viaWallet: boolean;
  /** waiting: not reached yet · signing: wallet prompt open · pending: sent, waiting for a block. */
  status: "waiting" | "signing" | "pending" | "confirmed" | "failed";
  tx: TxHash | null;
  error: string | null;
};

/** Called on every step change, with the whole list (render it as is). */
export type OnSteps = (steps: TxStep[]) => void;

// --- Adding an object -----------------------------------------------------------------------

/** What scanning the recorder's QR tells us before pairing. */
export type RecorderInfo = {
  /** sha256(qx || qy): the recorder's identity on-chain. */
  deviceId: Hex;
  /** Already registered by someone on CustodyLog (pairing is open today: see INTEGRATION.md). */
  registered: boolean;
  /** Objects already created on this recorder (should be 0 for a new pairing). */
  objects: number;
  lastSeenAt: number | null;
  batteryPct: number | null;
};

export type NewObject = {
  qr: string;
  label: string;
  kind: FleetBike["kind"] | "Camera" | "Other";
  /** Where the owner parks it: shown on the map instead of its GPS (privacy). Off-chain. */
  spot: string;
  pricePerHour: string;
  terms: Terms;
};

// --- Fleet (map) ---------------------------------------------------------------------------

/**
 * A bike that can be rented now, as shown on the map. Only free, parked bikes are ever listed:
 * the position of a rented bike is the position of a person (privacy, VISION §6).
 */
export type FleetBike = {
  key: string;
  /** On-chain object id; null for sample bikes that exist only in the sample fleet. */
  objectId: number | null;
  /** true for the one bike backed by the contracts; false for the sample fleet. */
  live: boolean;
  label: string;
  kind: "City bike" | "E-bike" | "Cargo bike" | "Road bike";
  ownerName: string;
  lat: number;
  lon: number;
  /** Rental price per hour (dUSD). Not in today's contract. */
  pricePerHour: string;
  deposit: string;
  /** From the black box: settled rentals and the most recent drop above the light level. */
  record: { rentals: number; drops: number; lastDrop: { tier: Tier; peakCg: number; at: number } | null };
};

export type DataErrorCode =
  | "chain-unreachable"
  | "relayer-offline"
  | "not-found"
  | "user-rejected"
  | "tx-reverted"
  | "insufficient-funds"
  | "wrong-account";

export class DataError extends Error {
  constructor(public code: DataErrorCode, message: string) {
    super(message);
    this.name = "DataError";
  }
}
