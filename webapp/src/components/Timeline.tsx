import type { ReactNode } from "react";
import type { ObjectDetail } from "../data/types";
import { buildStory, type Chapter, type StoryEvent } from "../ui/story";
import { day, g, hm, inSentence, nameOf, possessive, shortHex, span, TIER_NAMES, txUrl, usd, whenShort } from "../ui/format";
import { TierMeter } from "./TierMeter";

function Tx({ explorer, tx }: { explorer: string | null; tx: string }) {
  const url = txUrl(explorer, tx);
  const label = shortHex(tx);
  return url
    ? <a className="tx mono" href={url} target="_blank" rel="noreferrer" aria-label={`Transaction ${tx}`}>{label}</a>
    : <span className="tx mono">{label}</span>;
}

const Seq = ({ n }: { n: number }) => <a className="mono seq-link" href={`#batch-${n}`}>seq {n}</a>;

function sentence(e: StoryEvent): { text: ReactNode; extra?: ReactNode; tone?: "shock" | "gap" | "quiet" } {
  switch (e.kind) {
    case "registered":
      return { text: <>Joined Sharify. From here on, its box keeps a sealed diary of every hard knock.</>, tone: "quiet" };
    case "took":
      return { text: <>{nameOf(e.who)} picked it up from {inSentence(e.from)}.</> };
    case "deposit":
      return { text: <>{nameOf(e.who)} left a <span className="num">{usd(e.amount)}</span> deposit.</> };
    case "shock":
      return { text: <>It was dropped: a <span className="shock">{TIER_NAMES[e.tier]}</span> knock<span className="proof-only">, <span className="num">{g(e.peakCg)}</span> in <Seq n={e.seq} /></span>.</>, extra: <TierMeter tier={e.tier} />, tone: "shock" };
    case "late":
      return {
        text: <>A <span className="shock">{TIER_NAMES[e.tier]}</span> knock from {e.during ? `${possessive(e.during)} rental` : "before"} arrived after the return, so it counts for {inSentence(e.countsFor)}.</>,
        extra: <TierMeter tier={e.tier} />, tone: "shock",
      };
    case "gap":
      return {
        text: e.missing === 1
          ? <>A page of the diary never arrived<span className="proof-only"> (seq {e.from})</span>. The record shows the hole; nobody can fill it later.</>
          : <>{e.missing} pages of the diary never arrived<span className="proof-only"> (seq {e.from} to {e.to})</span>. The record shows the hole; nobody can fill it later.</>,
        tone: "gap",
      };
    case "returned":
      return { text: <>Back with {inSentence(e.to)}.</> };
    case "settled":
      return e.tier === 0
        ? { text: <>No drops: the whole <span className="num">{usd(e.refund)}</span> deposit went back to {nameOf(e.who)}.</> }
        : {
          text: <>By the rule, <span className="num">{usd(e.fee)}</span> kept for the {TIER_NAMES[e.tier]} knock<span className="proof-only">{e.causeSeq !== null && <> in <Seq n={e.causeSeq} /></>}</span>; {Number(e.refund) === 0 ? <>nothing went back to {nameOf(e.who)}</> : <><span className="num">{usd(e.refund)}</span> went back to {nameOf(e.who)}</>}.</>,
          extra: <TierMeter tier={e.tier} />,
        };
    case "offered":
      return e.to.role === "owner"
        ? { text: <>{nameOf(e.from)} handed it back. Waiting for the owner to confirm.</> }
        : { text: <>The owner offered it to {nameOf(e.to)}. Waiting for {nameOf(e.to)} to accept and leave the deposit.</> };
  }
}

function ChapterBlock({ c, d, explorer }: { c: Chapter; d: ObjectDetail; explorer: string | null }) {
  const who = c.isRental ? `${possessive(c.custodian)} rental` : c.custodian.role === "owner" ? "With the owner" : `With ${nameOf(c.custodian)}`;
  const peak = c.maxPeakCg === null ? "no readings" : c.batchCount === 1 ? "1 batch" : `${c.batchCount} batches`; // proof only
  const quiet = c.events.length === 0;
  return (
    <section className={`chapter ${c.isRental ? "rental" : ""} ${quiet ? "quiet" : ""}`} aria-label={who}>
      <header className="chapter-head">
        <h3>{who}</h3>
        <p className="mono">
          {c.end ? <>{whenShort(c.start)}, for {span(c.start, c.end)}</> : <>{span(c.start, null)} so far</>}<span className="proof-only"> <span className="sep" aria-hidden="true">/</span> {day(c.start)}, {hm(c.start)}{c.end ? `–${hm(c.end)}` : ", now"}</span>
          <span className="proof-only"><span className="sep" aria-hidden="true">/</span> {peak}{c.maxPeakCg !== null && c.maxPeakCg < d.terms.lightCg ? `, nothing above ${g(d.terms.lightCg)}` : ""}</span>
        </p>
      </header>
      {!quiet && (
        <ol className="events">
          {c.events.map((e, i) => {
            const s = sentence(e);
            return (
              <li key={i} className={`event ${s.tone ?? ""}`}>
                <time className="mono" dateTime={new Date(e.at.at).toISOString()} title={`${day(e.at.at)}, ${hm(e.at.at)}`}>{whenShort(e.at.at)}</time>
                <p>{s.text}{s.extra && <span className="event-extra">{s.extra}</span>}</p>
                <Tx explorer={explorer} tx={e.at.tx} />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The record at a glance, before the details (Carfax's report summary): counts, not verdicts. */
function RecordSummary({ d }: { d: ObjectDetail }) {
  const settled = d.rentals.filter((r) => r.settlement);
  const drops = [1, 2, 3].map((t) => ({ t: t as 1 | 2 | 3, n: settled.filter((r) => r.settlement!.tier === t).length })).filter((x) => x.n > 0);
  const missing = d.gaps.reduce((s, x) => s + x.missing, 0);
  return (
    <dl className="record">
      <div><dt>Rentals</dt><dd className="mono">{settled.length}{d.activeRental ? " + 1 now" : ""}</dd></div>
      <div><dt>Drops</dt><dd className="mono">{drops.length === 0 ? "none" : drops.map((x) => <span key={x.t} className="record-drop"><TierMeter tier={x.t} />{x.n}</span>)}</dd></div>
      <div><dt>Holes in the diary</dt><dd className={`mono ${missing ? "gap" : ""}`}>{missing || "none"}</dd></div>
      <div><dt>On Sharify since</dt><dd className="mono">{day(d.created.at)}</dd></div>
      <div className="proof-only"><dt>Batches signed</dt><dd className="mono">{d.batches.length}</dd></div>
    </dl>
  );
}

export function Timeline({ d, explorer }: { d: ObjectDetail; explorer: string | null }) {
  return (
    <section className="block timeline" aria-labelledby="timeline-title">
      <div className="block-intro">
        <h2 id="timeline-title">Its story</h2>
        <p>Newest first. Every line is kept where nobody can rewrite it. <span className="proof-only">Each one links to the transaction that proves it.</span></p>
      </div>
      <div className="chapters">
        <RecordSummary d={d} />
        <p className="record-note">What the box recorded, not a verdict on the bike. A knock is a jolt, not proof of damage.</p>
        {buildStory(d).map((c) => <ChapterBlock key={c.period} c={c} d={d} explorer={explorer} />)}
      </div>
    </section>
  );
}
