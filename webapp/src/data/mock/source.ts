// Mock implementation of DataSource. Replaced by the real one at integration time.
import type { DataSource } from "../api";
import { DataError, type Address, type FleetBike, type NetworkInfo, type OnSteps, type Party, type TxStep, type TxStepId } from "../types";
import { loadScenario } from "./scenarios";
import { DEMO_SPOT, SAMPLE_FLEET } from "./fleet";
import { PARTIES, fakeHex, type SimObject } from "./world";

const S = loadScenario();
const W = S.world;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

let account: Party | null = S.account ? PARTIES[S.account] : null;
/** dUSD the escrow may take from each address (ERC-20 allowance). */
const allowance = new Map<string, number>();

/** While a rental is active the recorder keeps anchoring batches, roughly every 16 s (sped up here). */
const live = () => { W.now = Math.max(W.now, Date.now()); };
setInterval(() => {
  for (const o of W.objects) {
    const p = o.periods.at(-1)!;
    if (o.rentals.some((r) => r.status === "active" && r.period === p.period)) { live(); W.batch(o); }
  }
}, 8_000);

/** Demo-only actions for the presentation controls (not part of DataSource). */
export const mockActions = {
  drop(id: number, peakCg = 4118) { live(); W.batch(obj(id), { shock: peakCg }); },
  /** The renter took test dUSD and allowed the escrow before: the unlock is then 2 signatures. */
  setUpWallet() { if (account) { W.balances.set(account.address, Math.max(W.balances.get(account.address) ?? 1000, 1000)); allowance.set(account.address, 500); } },
};

async function read<T>(fn: () => T): Promise<T> {
  await sleep(S.delayMs);
  if (!S.chainOk) throw new DataError("chain-unreachable", "The blockchain node does not answer.");
  return fn();
}

async function relayer<T>(fn: () => T): Promise<T> {
  await sleep(S.delayMs);
  if (!S.relayerOnline) throw new DataError("relayer-offline", "The relayer is offline: raw readings and proofs are unavailable.");
  return fn();
}

const obj = (id: number): SimObject => {
  const o = W.objects.find((x) => x.id === id);
  if (!o) throw new DataError("not-found", `Object #${id} does not exist.`);
  return o;
};

type StepDef = { id: TxStepId; signer: Party; viaWallet: boolean; apply: () => void };

/** Runs steps one by one, reporting signing → pending → confirmed (or failed) through onSteps. */
async function runSteps(defs: StepDef[], onSteps: OnSteps) {
  const steps: TxStep[] = defs.map((d) => ({ id: d.id, signer: d.signer, viaWallet: d.viaWallet, status: "waiting", tx: null, error: null }));
  const emit = () => onSteps(steps.map((s) => ({ ...s })));
  W.now = Math.max(W.now, Date.now()); // what the user does now happens now, not in the sample's past
  emit();
  for (const [i, d] of defs.entries()) {
    const s = steps[i];
    if (d.viaWallet) { s.status = "signing"; emit(); await sleep(900); }
    if (S.failAt?.step === d.id && S.failAt.code === "user-rejected") {
      s.status = "failed"; s.error = "You rejected the request in your wallet."; emit();
      throw new DataError("user-rejected", s.error);
    }
    s.status = "pending"; s.tx = fakeHex(32); emit();
    await sleep(S.txMs);
    if (S.failAt?.step === d.id) {
      s.status = "failed"; s.error = "Transaction reverted on-chain."; emit();
      throw new DataError(S.failAt.code, s.error);
    }
    d.apply();
    s.status = "confirmed"; emit();
  }
}

const requireAccount = (who: Party | null, what: string): Party => {
  if (!account) throw new DataError("wrong-account", "Connect a wallet first.");
  if (who && !same(account.address, who.address)) throw new DataError("wrong-account", `Only ${who.label ?? who.address} can ${what}.`);
  return account;
};

const network: NetworkInfo = {
  id: "baseSepolia", label: "Base Sepolia", chainId: 84532, explorer: "https://sepolia.basescan.org",
  contracts: {
    custodyLog: "0x0c91b997543aabe4f7b644b76b47e00ab33232eb",
    escrow: "0xe8c69ec81b8be17350e9238d9912f8e980e18eda",
    token: "0xa750f021e6f9254fb8c30aab66404341a372b58c",
  },
  isMock: true,
};

export const mockSource: DataSource = {
  getNetwork: () => read(() => network),
  getStatus: async () => {
    await sleep(S.delayMs);
    return { chain: S.chainOk ? "ok" : "unreachable", relayer: S.relayerOnline ? "ok" : "offline" };
  },
  listObjects: () => read(() => W.objects.map((o) => {
    const d = W.detail(o);
    return {
      id: d.id, label: d.label, deviceId: d.deviceId, owner: d.owner, ownerName: d.ownerName, custodian: d.custodian, status: d.status,
      activeRental: d.activeRental, lastBatchAt: d.lastBatchAt, rentalCount: d.rentalCount, totalFees: d.totalFees,
    };
  })),
  getObject: (id) => read(() => W.detail(obj(id))),
  getReadings: (id, seq) => relayer(() => {
    const r = obj(id).readings.get(seq);
    if (!r) throw new DataError("not-found", `Batch ${seq} not found.`);
    return structuredClone(r);
  }),
  getProof: (id, seq, index) => relayer(() => {
    const o = obj(id);
    const r = o.readings.get(seq)?.[index];
    const b = o.batches.find((x) => x.seq === seq);
    if (!r || !b) throw new DataError("not-found", `Reading ${seq}/${index} not found.`);
    const depth = Math.ceil(Math.log2(b.count));
    return { reading: structuredClone(r), record: fakeHex(19), root: b.root, proof: Array.from({ length: depth }, () => fakeHex(32)), verifiedOnChain: true };
  }),
  getBalance: (address: Address) => read(() => String(W.balances.get(address) ?? (same(address, PARTIES.owner.address) ? 0 : 1000))),

  isWalletReady: (id) => read(() => {
    const c = Number(obj(id).terms.collateral);
    return !!account && (allowance.get(account.address) ?? 0) >= c && (W.balances.get(account.address) ?? 1000) >= c;
  }),
  getAccount: async () => account,
  connectWallet: async () => {
    await sleep(800);
    account = PARTIES[S.account ?? "alice"];
    return account;
  },

  proposeHandover: async (id, to, onSteps) => {
    const o = obj(id);
    const me = requireAccount(o.periods.at(-1)!.custodian, "offer the object");
    await runSteps([{ id: "propose", signer: me, viaWallet: true, apply: () => W.propose(o, W.party(to)) }], onSteps);
  },
  startRental: async (id, onSteps) => {
    const o = obj(id);
    const me = requireAccount(o.pending ? o.pending.to : null, "accept this rental");
    if (!o.pending && o.periods.at(-1)!.custodian.address !== o.owner.address) throw new DataError("wrong-account", "Someone else has this bike right now.");
    const c = Number(o.terms.collateral);
    const needsFaucet = (W.balances.get(me.address) ?? 1000) < c;
    const needsApprove = (allowance.get(me.address) ?? 0) < c;
    await runSteps([
      // The owner's side offers the bike (the owner pre-authorises it; see INTEGRATION.md).
      ...(!o.pending ? [{ id: "propose" as const, signer: o.owner, viaWallet: false, apply: () => W.propose(o, me) }] : []),
      { id: "accept", signer: me, viaWallet: true, apply: () => W.accept(o) },
      ...(needsFaucet ? [{ id: "faucet" as const, signer: me, viaWallet: true, apply: () => W.balances.set(me.address, 1000) }] : []),
      // One allowance covers ten deposits, so the next rentals need two signatures only.
      ...(needsApprove ? [{ id: "approve" as const, signer: me, viaWallet: true, apply: () => allowance.set(me.address, 10 * c) }] : []),
      { id: "deposit", signer: me, viaWallet: true, apply: () => { W.deposit(o); allowance.set(me.address, (allowance.get(me.address) ?? 0) - c); } },
    ], onSteps);
  },
  requestReturn: async (id, onSteps) => {
    const o = obj(id);
    const me = requireAccount(o.periods.at(-1)!.custodian, "return the object");
    await runSteps([{ id: "propose", signer: me, viaWallet: true, apply: () => W.propose(o, o.owner) }], onSteps);
  },
  confirmReturn: async (id, onSteps) => {
    const o = obj(id);
    if (!o.pending || !same(o.pending.to.address, o.owner.address)) throw new DataError("wrong-account", "No return to confirm.");
    const me = requireAccount(o.owner, "confirm the return");
    await runSteps([
      { id: "accept", signer: me, viaWallet: true, apply: () => W.accept(o) },
      { id: "settle", signer: me, viaWallet: true, apply: () => W.settle(o) },
    ], onSteps);
  },

  getFleet: () => read(() => {
    const live = W.objects.map((o) => W.detail(o)).filter((d) => d.status === "available").map((d): FleetBike => {
      const drops = d.rentals.filter((r) => (r.settlement?.tier ?? 0) > 0);
      const last = drops.at(-1)?.settlement ?? null;
      return {
        key: `live-${d.id}`, objectId: d.id, live: true, label: d.label ?? `Object ${d.id}`, kind: "City bike",
        ownerName: d.ownerName ?? "Owner", lat: DEMO_SPOT.lat, lon: DEMO_SPOT.lon, pricePerHour: "2", deposit: d.terms.collateral,
        record: { rentals: d.rentals.filter((r) => r.settlement).length, drops: drops.length, lastDrop: last && { tier: last.tier, peakCg: last.peakCg, at: last.anchor.at } },
      };
    });
    return [...live.slice(0, 1), ...SAMPLE_FLEET];
  }),
  lookupRecorder: (qr) => read(() => {
    const known = W.objects.find((o) => qr.includes(o.deviceId.slice(2, 10)));
    return {
      deviceId: known?.deviceId ?? (`0x${qr.replace(/[^0-9a-f]/gi, "").repeat(8).slice(0, 64)}` as `0x${string}`),
      registered: !!known, objects: W.objects.filter((o) => o.deviceId === known?.deviceId).length,
      lastSeenAt: Date.now() - 12_000, batteryPct: 84,
    };
  }),
  addObject: async (input, onSteps) => {
    const me = requireAccount(null, "add an object");
    let id = 0;
    await runSteps([
      { id: "register", signer: me, viaWallet: true, apply: () => {} },
      { id: "create", signer: me, viaWallet: true, apply: () => {
        const o = W.create({ label: input.label, firstSeq: 1, terms: input.terms });
        o.owner = me; o.periods[0].custodian = me; id = o.id;
      } },
      { id: "setTerms", signer: me, viaWallet: true, apply: () => {} },
    ], onSteps);
    return id;
  },
  getDemoRenters: async () => {
    await sleep(S.delayMs);
    return S.relayerOnline ? [PARTIES.alice, PARTIES.bob] : [];
  },
  demoStartRental: async (id, renter, onSteps) => {
    const o = obj(id);
    if (!S.relayerOnline) throw new DataError("relayer-offline", "The relayer is offline.");
    const r = W.party(renter);
    await runSteps([
      { id: "propose", signer: o.owner, viaWallet: false, apply: () => W.propose(o, r) },
      { id: "accept", signer: r, viaWallet: false, apply: () => W.accept(o) },
      { id: "approve", signer: r, viaWallet: false, apply: () => {} },
      { id: "deposit", signer: r, viaWallet: false, apply: () => W.deposit(o) },
    ], onSteps);
  },
  demoEndRental: async (id, onSteps) => {
    const o = obj(id);
    if (!S.relayerOnline) throw new DataError("relayer-offline", "The relayer is offline.");
    const renter = o.periods.at(-1)!.custodian;
    await runSteps([
      { id: "propose", signer: renter, viaWallet: false, apply: () => W.propose(o, o.owner) },
      { id: "accept", signer: o.owner, viaWallet: false, apply: () => W.accept(o) },
      { id: "settle", signer: o.owner, viaWallet: false, apply: () => W.settle(o) },
    ], onSteps);
  },
};

export const mockScenario = S;
