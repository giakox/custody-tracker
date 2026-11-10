// Turns an ObjectDetail into the story shown on the object page: one chapter per custody
// period, each a list of dated sentences (Flighty-style), newest first.
import type { Anchor, ObjectDetail, Party, Tier } from "../data/types";

export type StoryEvent =
  | { kind: "registered"; at: Anchor }
  | { kind: "took"; at: Anchor; who: Party; from: Party }
  | { kind: "deposit"; at: Anchor; who: Party; amount: string }
  | { kind: "shock"; at: Anchor; seq: number; peakCg: number; tier: Tier }
  | { kind: "late"; at: Anchor; seq: number; peakCg: number; tier: Tier; during: Party | null; countsFor: Party }
  | { kind: "gap"; at: Anchor; from: number; to: number; missing: number }
  | { kind: "returned"; at: Anchor; to: Party }
  | { kind: "settled"; at: Anchor; who: Party; fee: string; refund: string; peakCg: number; tier: Tier; causeSeq: number | null }
  | { kind: "offered"; at: Anchor; from: Party; to: Party };

export type Chapter = {
  period: number;
  custodian: Party;
  isRental: boolean;
  start: number;
  end: number | null;
  batchCount: number;
  readingCount: number;
  maxPeakCg: number | null;
  events: StoryEvent[];
};

export function tierOf(d: ObjectDetail, peak: number): Tier {
  const t = d.terms;
  return peak >= t.strongCg ? 3 : peak >= t.mediumCg ? 2 : peak >= t.lightCg ? 1 : 0;
}

export function buildStory(d: ObjectDetail): Chapter[] {
  const chapters: Chapter[] = d.periods.map((p) => ({
    period: p.period,
    custodian: p.custodian,
    isRental: d.rentals.some((r) => r.period === p.period),
    start: p.start.at,
    end: p.end?.at ?? null,
    batchCount: p.batchCount,
    readingCount: d.batches.filter((b) => b.period === p.period).reduce((s, b) => s + b.count, 0),
    maxPeakCg: p.maxPeakCg,
    events: [],
  }));
  const ch = (period: number) => chapters[period];

  ch(0).events.push({ kind: "registered", at: d.created });
  for (const p of d.periods) {
    if (p.period > 0 && p.custodian.role !== "owner") ch(p.period).events.push({ kind: "took", at: p.start, who: p.custodian, from: d.periods[p.period - 1].custodian });
    if (p.end && p.custodian.role !== "owner") ch(p.period).events.push({ kind: "returned", at: p.end, to: d.periods[p.period + 1].custodian });
  }
  for (const r of d.rentals) {
    ch(r.period).events.push({ kind: "deposit", at: r.started, who: r.renter, amount: r.collateral });
    if (r.settlement) {
      const s = r.settlement;
      ch(r.period).events.push({ kind: "settled", at: s.anchor, who: r.renter, fee: s.fee, refund: s.refund, peakCg: s.peakCg, tier: s.tier, causeSeq: s.causeSeq });
    }
  }
  d.batches.forEach((b, i) => {
    const tier = tierOf(d, b.maxPeakCg);
    if (b.recordedBeforeHandoff && tier > 0) {
      const prev = d.periods[b.period - 1];
      ch(b.period).events.push({ kind: "late", at: b.anchor, seq: b.seq, peakCg: b.maxPeakCg, tier, during: prev?.custodian ?? null, countsFor: b.custodian });
    } else if (tier > 0) {
      ch(b.period).events.push({ kind: "shock", at: b.anchor, seq: b.seq, peakCg: b.maxPeakCg, tier });
    }
    const prevSeq = d.batches[i - 1]?.seq;
    if (prevSeq !== undefined && b.seq - prevSeq > 1) {
      ch(b.period).events.push({ kind: "gap", at: b.anchor, from: prevSeq + 1, to: b.seq - 1, missing: b.seq - prevSeq - 1 });
    }
  });
  if (d.pendingHandoff) {
    ch(chapters.length - 1).events.push({ kind: "offered", at: d.pendingHandoff.anchor, from: d.pendingHandoff.from, to: d.pendingHandoff.to });
  }

  // Within a chapter, newest first; a gap sits just below the batch that revealed it.
  const order = (e: StoryEvent) => (e.kind === "gap" ? -0.5 : 0);
  for (const c of chapters) c.events.sort((a, b) => b.at.at - a.at.at || order(b) - order(a));
  return chapters.reverse();
}
