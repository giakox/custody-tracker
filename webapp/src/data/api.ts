// The only module the interface calls. Every function is async and returns the types in types.ts.
// Today it is backed by the mock source (src/data/mock). Integration = write another DataSource
// and swap it in `source` below. See INTEGRATION.md.
import type {
  Address, FleetBike, NetworkInfo, NewObject, RecorderInfo, ObjectDetail, ObjectSummary, OnSteps, Party, ProofResult, Reading, SourceStatus,
} from "./types";
import { mockSource } from "./mock/source";

export interface DataSource {
  // --- Reads -------------------------------------------------------------------------------
  getNetwork(): Promise<NetworkInfo>;
  getStatus(): Promise<SourceStatus>;
  /** Every object (owner / fleet view). */
  listObjects(): Promise<ObjectSummary[]>;
  /** Full public history of one object. Throws DataError("not-found"). */
  getObject(id: number): Promise<ObjectDetail>;
  /** Raw readings of one batch. Relayer only: throws DataError("relayer-offline"). */
  getReadings(id: number, seq: number): Promise<Reading[]>;
  /** Merkle proof of one reading, checked by CustodyLog.verifyReading. Throws "relayer-offline". */
  getProof(id: number, seq: number, index: number): Promise<ProofResult>;
  /** dUSD balance of an address. */
  getBalance(address: Address): Promise<string>;
  /** The connected wallet holds the deposit and already allows the escrow to take it: the unlock is 2 signatures. */
  isWalletReady(objectId: number): Promise<boolean>;

  /** Bikes free to rent right now, with their black-box summary. Never lists rented bikes. */
  getFleet(): Promise<FleetBike[]>;

  /** Reads a recorder's QR (its public key) and what the chain knows about it. */
  lookupRecorder(qr: string): Promise<RecorderInfo>;
  /** Owner: registers the recorder if needed, creates the object, sets the rules. Returns the object id. */
  addObject(input: NewObject, onSteps: OnSteps): Promise<number>;

  // --- Wallet ------------------------------------------------------------------------------
  /** Connected account, null if no wallet is connected. */
  getAccount(): Promise<Party | null>;
  /** Asks the wallet to connect. Throws DataError("user-rejected"). */
  connectWallet(): Promise<Party>;

  // --- Rental flows, signed from the user's wallet ------------------------------------------
  /** Owner: offers the object to a renter (proposeHandoff). */
  proposeHandover(id: number, to: Address, onSteps: OnSteps): Promise<void>;
  /** Renter: accepts custody and deposits the collateral (acceptHandoff, faucet if needed, approve, startRental). */
  startRental(id: number, onSteps: OnSteps): Promise<void>;
  /** Renter: gives the object back (proposeHandoff to the owner). */
  requestReturn(id: number, onSteps: OnSteps): Promise<void>;
  /** Owner: accepts the return, then the contract settles the collateral (acceptHandoff, endRental). */
  confirmReturn(id: number, onSteps: OnSteps): Promise<void>;

  // --- Demo flows through the relayer (plan B: the relayer holds the demo keys) -------------
  /** Demo renters known by the relayer (alice, bob). Empty when the relayer is offline. */
  getDemoRenters(): Promise<Party[]>;
  /** Whole unlock in one call (POST /api/rental/start). */
  demoStartRental(id: number, renter: Address, onSteps: OnSteps): Promise<void>;
  /** Whole return + settlement in one call (POST /api/rental/end). */
  demoEndRental(id: number, onSteps: OnSteps): Promise<void>;
}

export const source: DataSource = mockSource;

// Wrappers instead of destructuring, so a class-based source keeps its `this`.
export const getNetwork = () => source.getNetwork();
export const getStatus = () => source.getStatus();
export const listObjects = () => source.listObjects();
export const getObject = (id: number) => source.getObject(id);
export const getReadings = (id: number, seq: number) => source.getReadings(id, seq);
export const getProof = (id: number, seq: number, index: number) => source.getProof(id, seq, index);
export const getBalance = (address: Address) => source.getBalance(address);
export const isWalletReady = (objectId: number) => source.isWalletReady(objectId);
export const getAccount = () => source.getAccount();
export const connectWallet = () => source.connectWallet();
export const proposeHandover = (id: number, to: Address, onSteps: OnSteps) => source.proposeHandover(id, to, onSteps);
export const startRental = (id: number, onSteps: OnSteps) => source.startRental(id, onSteps);
export const requestReturn = (id: number, onSteps: OnSteps) => source.requestReturn(id, onSteps);
export const confirmReturn = (id: number, onSteps: OnSteps) => source.confirmReturn(id, onSteps);
export const getDemoRenters = () => source.getDemoRenters();
export const getFleet = () => source.getFleet();
export const lookupRecorder = (qr: string) => source.lookupRecorder(qr);
export const addObject = (input: NewObject, onSteps: OnSteps) => source.addObject(input, onSteps);
export const demoStartRental = (id: number, renter: Address, onSteps: OnSteps) => source.demoStartRental(id, renter, onSteps);
export const demoEndRental = (id: number, onSteps: OnSteps) => source.demoEndRental(id, onSteps);
