// Sample-data scenarios, one per UI state to design. Pick one with ?scenario=<name> (and the
// connected account with ?as=owner|alice|bob|none). Example: /?scenario=rented&as=alice#/rent/1
import type { DataErrorCode, TxStepId } from "../types";
import { PARTIES, World } from "./world";

export type Scenario = {
  name: string;
  description: string;
  world: World;
  /** Default connected account for this scenario (overridable with ?as=). */
  account: keyof typeof PARTIES | null;
  chainOk: boolean;
  relayerOnline: boolean;
  /** Latency of every read, in ms. */
  delayMs: number;
  /** Latency of one transaction confirmation, in ms (Base Sepolia: 2–5 s each). */
  txMs: number;
  /** Make a transaction flow fail at this step. */
  failAt: { step: TxStepId; code: DataErrorCode } | null;
};

const base = (): Omit<Scenario, "name" | "description" | "world"> => ({
  account: null, chainOk: true, relayerOnline: true, delayMs: 350, txMs: 1_400, failAt: null,
});

/** Object #1 after a morning of demo: Alice dropped it (medium), Bob clean, one seq gap.
 *  `late`: a shock from Bob's rental reaches the chain after his return (the known limit). */
function history(world = new World(), late = false) {
  const o = world.create({ firstSeq: 6, label: "The demo bike" });
  world.batch(o); world.batch(o);
  world.rental(o, PARTIES.alice, [{}, {}, { shock: 4118 }, { skip: 2 }, {}]);
  world.batch(o); world.tick(600_000);
  world.rental(o, PARTIES.bob, [{}, {}, {}], late ? { shock: 1240 } : undefined);
  world.batch(o); world.tick(300_000);
  return { world, o };
}

const SCENARIOS: Record<string, () => Omit<Scenario, "name">> = {
  default: () => {
    const { world } = history();
    return { ...base(), world, description: "Available, with history: 2 settled rentals and a seq gap." };
  },
  "late-batch": () => {
    const { world } = history(new World(), true);
    return { ...base(), world, description: "Limit: a 12.4 g shock from Bob's rental reached the chain after his return and counts for the owner." };
  },
  rented: () => {
    const { world, o } = history();
    world.propose(o, PARTIES.alice); world.accept(o); world.deposit(o);
    world.batch(o); world.batch(o, { shock: 4118 }); world.batch(o);
    return { ...base(), world, account: "alice", description: "Alice is renting it now and dropped it: 41.2 g, medium, 20 dUSD would be withheld." };
  },
  "rented-clean": () => {
    const { world, o } = history();
    world.propose(o, PARTIES.bob); world.accept(o); world.deposit(o);
    world.batch(o); world.batch(o);
    return { ...base(), world, account: "bob", description: "Bob is renting it, no shock so far." };
  },
  "rented-just-started": () => {
    const { world, o } = history();
    world.propose(o, PARTIES.bob); world.accept(o); world.deposit(o);
    return { ...base(), world, account: "bob", description: "Rental just started, no batch yet in this period (peak unknown, not 0 g)." };
  },
  handoff: () => {
    const { world, o } = history();
    world.propose(o, PARTIES.alice);
    return { ...base(), world, account: "alice", description: "Owner offered it to Alice: she has to accept and deposit." };
  },
  "return-pending": () => {
    const { world, o } = history();
    world.propose(o, PARTIES.alice); world.accept(o); world.deposit(o);
    world.batch(o, { shock: 1650 }); world.propose(o, PARTIES.owner);
    return { ...base(), world, account: "owner", description: "Alice gave it back: the owner has to confirm the return, then the contract settles." };
  },
  strong: () => {
    const { world, o } = history();
    world.rental(o, PARTIES.alice, [{}, { shock: 21_480 }]);
    return { ...base(), world, description: "Last rental ended with a 214.8 g peak: strong tier, sensor saturated (>200 g)." };
  },
  new: () => {
    const world = new World();
    const o = world.create({ firstSeq: 1, label: "The demo bike" });
    world.batch(o);
    return { ...base(), world, account: "owner", description: "Device just registered: one batch, no rentals yet." };
  },
  fleet: () => {
    const { world } = history();
    const b = world.create({ label: "City bike 2", firstSeq: 1 }); world.batch(b); world.rental(b, PARTIES.bob, [{}, { shock: 950 }]);
    const c = world.create({ label: "Camera kit", firstSeq: 3 }); world.batch(c);
    world.propose(c, PARTIES.alice); world.accept(c); world.deposit(c); world.batch(c);
    return { ...base(), world, account: "owner", description: "Owner view with three objects, one of them rented." };
  },
  empty: () => {
    const world = new World();
    return { ...base(), world, account: "owner", description: "No object registered yet." };
  },
  "relayer-offline": () => {
    const { world } = history();
    return { ...base(), world, relayerOnline: false, description: "Chain readable, relayer down: no readings, map, proofs or demo buttons." };
  },
  "chain-error": () => {
    const { world } = history();
    return { ...base(), world, chainOk: false, description: "The chain RPC does not answer: nothing can be shown." };
  },
  slow: () => {
    const { world } = history();
    return { ...base(), world, delayMs: 3_000, txMs: 5_000, description: "Slow network: long loading and long confirmations." };
  },
  "tx-rejected": () => {
    const { world, o } = history();
    world.propose(o, PARTIES.alice);
    return { ...base(), world, account: "alice", failAt: { step: "approve", code: "user-rejected" }, description: "Alice rejects the approve in her wallet." };
  },
  "tx-reverted": () => {
    const { world, o } = history();
    world.propose(o, PARTIES.alice);
    return { ...base(), world, account: "alice", failAt: { step: "deposit", code: "tx-reverted" }, description: "The deposit transaction reverts on-chain." };
  },
  "no-wallet": () => {
    const { world } = history();
    return { ...base(), world, account: null, description: "Nobody connected: public view only." };
  },
};

export const SCENARIO_NAMES = Object.keys(SCENARIOS);

export function loadScenario(): Scenario {
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get("scenario") ?? import.meta.env.VITE_SCENARIO ?? "default";
  const name = wanted in SCENARIOS ? wanted : "default";
  const s = { name, ...SCENARIOS[name]() };
  const as = params.get("as");
  if (as === "none") s.account = null;
  else if (as && as in PARTIES) s.account = as as keyof typeof PARTIES;
  return s;
}

export const describeScenarios = () =>
  SCENARIO_NAMES.map((name) => ({ name, description: SCENARIOS[name]().description }));
