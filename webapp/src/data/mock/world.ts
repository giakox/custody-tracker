// A tiny simulator of the two contracts, used only to produce consistent sample data:
// custody periods, batches, seq gaps, rentals and settlements follow the same rules as
// CustodyLog + RentalEscrow, so every screen sees data that could really happen.
import type {
  Address, Anchor, Batch, CustodyPeriod, Hex, ObjectDetail, Party, Reading, Rental, SeqGap, Terms, Tier,
} from "../types";

// --- deterministic fake hex -----------------------------------------------------------------
let rng = 0x2f6e2b1;
const rand = () => {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return (rng >>> 0) / 0xffffffff;
};
export const fakeHex = (bytes: number): Hex =>
  `0x${Array.from({ length: bytes }, () => Math.floor(rand() * 256).toString(16).padStart(2, "0")).join("")}`;

// --- parties (same addresses as the Base Sepolia deploy where they are public) ----------------
export const PARTIES = {
  owner: { address: "0xDD15B25f8b1E18482d491992298844e54E50FC35", label: "owner", role: "owner" },
  alice: { address: "0x14875694BC86727565c5B799a28475c0267CA41A", label: "alice", role: "renter" },
  bob: { address: "0x6aC3e1F0d2B9a4c7E58f1D03b2A9e6C4d7F18b52", label: "bob", role: "renter" },
} satisfies Record<string, Party>;

export const DEFAULT_TERMS: Terms = {
  collateral: "50", lightCg: 800, mediumCg: 3000, strongCg: 8000, lightBps: 1000, mediumBps: 4000, strongBps: 10000,
};

export const tierOf = (t: Terms, peak: number): Tier =>
  peak >= t.strongCg ? 3 : peak >= t.mediumCg ? 2 : peak >= t.lightCg ? 1 : 0;
export const bpsOf = (t: Terms, tier: Tier) => [0, t.lightBps, t.mediumBps, t.strongBps][tier];
const fmt = (n: number) => String(Math.round(n * 1e6) / 1e6);
export const split = (t: Terms, tier: Tier) => {
  const c = Number(t.collateral);
  const fee = (c * bpsOf(t, tier)) / 10_000;
  return { fee: fmt(fee), refund: fmt(c - fee) };
};

// --- route: Bocconi → Duomo (PRODUCT.md example) ---------------------------------------------
const ROUTE: [number, number][] = [
  [45.4504, 9.1897], [45.4531, 9.1866], [45.4567, 9.1862], [45.4592, 9.1885], [45.4617, 9.1893], [45.4642, 9.19],
];
void ROUTE; // kept for reference: the sample rides below wander around the campus instead

/** One reading per second at cycling speed (~4 m/s), turning gently: a believable ride, never a jump. */
function step(o: { pos: [number, number]; heading: number }): [number, number] {
  o.heading += (rand() - 0.5) * 0.5;
  // stay within ~1 km of the campus: steer back when drifting away
  const [lat, lon] = o.pos, home: [number, number] = [45.4513, 9.1884];
  if (Math.hypot(lat - home[0], (lon - home[1]) * 0.7) > 0.008) o.heading = Math.atan2(home[0] - lat, (home[1] - lon) * 0.7);
  o.pos = [lat + Math.sin(o.heading) * 0.000036, lon + Math.cos(o.heading) * 0.000051];
  return o.pos;
}

// --- simulated object --------------------------------------------------------------------------
export type SimObject = {
  id: number;
  label: string | null;
  deviceId: Hex;
  owner: Party;
  terms: Terms;
  created: Anchor;
  periods: CustodyPeriod[];
  batches: Batch[];
  readings: Map<number, Reading[]>;
  rentals: Rental[];
  pending: { from: Party; to: Party; anchor: Anchor } | null;
  nextSeq: number;
  readingN: number;
  hw: boolean;
  /** Where the recorder is and which way it's moving (sample data only). */
  pos: [number, number];
  heading: number;
};

export class World {
  now: number;
  block: number;
  objects: SimObject[] = [];
  balances = new Map<string, number>();

  // Sample history starts 40 minutes ago so "now", durations and "updated N s ago" read naturally.
  constructor(start = Math.floor((Date.now() - 40 * 60_000) / 60_000) * 60_000, startBlock = 56_195_362) {
    this.now = start;
    this.block = startBlock;
  }

  tick(ms: number) { this.now += ms; this.block += Math.round(ms / 200); }

  anchor(): Anchor {
    this.tick(2_000);
    return { tx: fakeHex(32), block: this.block, at: this.now };
  }

  party(address: Address): Party {
    const known = Object.values(PARTIES).find((p) => p.address.toLowerCase() === address.toLowerCase());
    return known ?? { address, label: null, role: "unknown" };
  }

  create(opts: { label?: string | null; firstSeq?: number; hw?: boolean; terms?: Terms } = {}): SimObject {
    const created = this.anchor();
    const o: SimObject = {
      id: this.objects.length + 1, label: opts.label ?? null, deviceId: fakeHex(32), owner: PARTIES.owner,
      terms: opts.terms ?? DEFAULT_TERMS, created,
      periods: [{ period: 0, custodian: PARTIES.owner, start: created, end: null, maxPeakCg: null, batchCount: 0 }],
      batches: [], readings: new Map(), rentals: [], pending: null, nextSeq: opts.firstSeq ?? 1, readingN: 400, hw: opts.hw ?? false,
      pos: [45.4513, 9.1884], heading: rand() * Math.PI * 2,
    };
    this.objects.push(o);
    return o;
  }

  /** Anchors a batch of `count` readings. `shock` puts one reading at that peak. */
  batch(o: SimObject, opts: { shock?: number; count?: number; skip?: number; recordedBeforeHandoff?: boolean } = {}) {
    o.nextSeq += opts.skip ?? 0;
    const count = opts.count ?? (opts.shock ? 9 : 16);
    const tEnd = opts.recordedBeforeHandoff ? this.now - 20_000 : this.now;
    const tStart = tEnd - (count - 1) * 1000;
    const readings: Reading[] = Array.from({ length: count }, (_, i) => {
      // A parked bike stays put (GPS jitter only); a rented one moves.
      const [lat, lon] = o.periods.at(-1)!.custodian.role === "owner" ? [o.pos[0] + (rand() - 0.5) * 0.00002, o.pos[1] + (rand() - 0.5) * 0.00002] : step(o);
      const peak = opts.shock && i === count - 1 ? opts.shock : 92 + Math.round(rand() * 22);
      return {
        index: i, n: o.readingN++, t: tStart + i * 1000, lat, lon, peakCg: peak,
        flags: { gpsFix: true, shock: peak >= o.terms.lightCg, gpsTime: true },
      };
    });
    const maxPeakCg = Math.max(...readings.map((r) => r.peakCg));
    const cur = o.periods.at(-1)!;
    const b: Batch = {
      seq: o.nextSeq++, root: fakeHex(32), count, maxPeakCg, tStart, tEnd,
      custodian: cur.custodian, period: cur.period, anchor: this.anchor(),
      recordedBeforeHandoff: !!opts.recordedBeforeHandoff, hw: o.hw, gasUsed: String(144_000 + Math.round(rand() * 4_000)),
    };
    o.batches.push(b);
    o.readings.set(b.seq, readings);
    cur.maxPeakCg = Math.max(cur.maxPeakCg ?? 0, maxPeakCg);
    cur.batchCount++;
    this.tick(14_000);
    return b;
  }

  propose(o: SimObject, to: Party) {
    o.pending = { from: o.periods.at(-1)!.custodian, to, anchor: this.anchor() };
  }

  accept(o: SimObject) {
    if (!o.pending) throw new Error("no pending handoff");
    const a = this.anchor();
    const cur = o.periods.at(-1)!;
    cur.end = a;
    o.periods.push({ period: cur.period + 1, custodian: o.pending.to, start: a, end: null, maxPeakCg: null, batchCount: 0 });
    o.pending = null;
  }

  deposit(o: SimObject) {
    const cur = o.periods.at(-1)!;
    const amount = Number(o.terms.collateral);
    this.balances.set(cur.custodian.address, (this.balances.get(cur.custodian.address) ?? 1000) - amount);
    o.rentals.push({
      period: cur.period, renter: cur.custodian, collateral: o.terms.collateral, started: this.anchor(),
      status: "active", current: null, settlement: null,
    });
  }

  settle(o: SimObject) {
    const r = o.rentals.find((x) => x.status === "active");
    if (!r) throw new Error("no active rental");
    const p = o.periods[r.period];
    const peak = p.maxPeakCg ?? 0; // periodMaxPeakCg is 0 when no batch was anchored
    const tier = tierOf(o.terms, peak);
    const { fee, refund } = split(o.terms, tier);
    const cause = tier > 0 ? o.batches.filter((b) => b.period === r.period).sort((a, b) => b.maxPeakCg - a.maxPeakCg)[0] : null;
    r.status = "settled";
    r.settlement = { peakCg: peak, tier, fee, refund, anchor: this.anchor(), causeSeq: cause?.seq ?? null };
    const bal = (a: string) => this.balances.get(a) ?? 1000;
    this.balances.set(r.renter.address, bal(r.renter.address) + Number(refund));
    this.balances.set(o.owner.address, bal(o.owner.address) + Number(fee));
  }

  /** Full rental in one go, for building history. */
  rental(o: SimObject, renter: Party, batches: { shock?: number; skip?: number }[], lateBatch?: { shock?: number }) {
    this.propose(o, renter); this.accept(o); this.deposit(o);
    for (const b of batches) this.batch(o, b);
    // Same order as the relayer: return accepted, settled at once; a batch still in the device
    // queue arrives afterwards and is attributed to the owner (STATUS.md, "shock straddling the return").
    this.propose(o, o.owner); this.accept(o); this.settle(o);
    if (lateBatch) this.batch(o, { ...lateBatch, recordedBeforeHandoff: true });
  }

  detail(o: SimObject): ObjectDetail {
    const cur = o.periods.at(-1)!;
    const rentals = o.rentals.map((r): Rental => {
      if (r.status !== "active") return r;
      const peak = o.periods[r.period].maxPeakCg;
      const tier = tierOf(o.terms, peak ?? 0);
      const { fee, refund } = split(o.terms, tier);
      return { ...r, current: { peakCg: peak, tier, wouldWithhold: fee, wouldRefund: refund } };
    });
    const active = rentals.find((r) => r.status === "active") ?? null;
    const gaps: SeqGap[] = [];
    for (let i = 1; i < o.batches.length; i++) {
      const [a, b] = [o.batches[i - 1].seq, o.batches[i].seq];
      if (b - a > 1) gaps.push({ after: a, before: b, missing: b - a - 1 });
    }
    const fees = rentals.reduce((s, r) => s + Number(r.settlement?.fee ?? 0), 0);
    return structuredClone({
      id: o.id, label: o.label, deviceId: o.deviceId, owner: o.owner, ownerName: "Giacomo's bikes", custodian: cur.custodian,
      status: o.pending ? "handoff-pending" : active ? "rented" : cur.custodian.address === o.owner.address ? "available" : "held-without-deposit",
      activeRental: active, lastBatchAt: o.batches.at(-1)?.anchor.at ?? null,
      rentalCount: rentals.length, totalFees: fmt(fees),
      terms: o.terms, periods: o.periods, batches: o.batches, rentals, gaps,
      firstSeq: o.batches[0]?.seq ?? null, lastSeq: o.batches.at(-1)?.seq ?? null,
      pendingHandoff: o.pending, created: o.created,
    } satisfies ObjectDetail);
  }
}
