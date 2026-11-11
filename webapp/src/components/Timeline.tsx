import type { ReactNode } from "react";
import type { ObjectDetail } from "../data/types";
import { buildStory, type Chapter, type StoryEvent } from "../ui/story";
import { day, g, hm, inSentence, nameOf, possessive, shortHex, span, TIER_NAMES, txUrl, usd, whenShort } from "../ui/format";
import { href } from "../ui/router";
import { TierMeter } from "./TierMeter";

function Tx({ explorer, tx }: { explorer: string | null; tx: string }) {
  const url = txUrl(explorer, tx);
  const label = shortHex(tx);
  return url
    ? <a className="tx mono" href={url} target="_blank" rel="noreferrer" aria-label={`Transaction ${tx}`}>{label}</a>
    : <span className="tx mono">{label}</span>;
}

const Seq = ({ n }: { n: number }) => <a className="mono seq-link" href={`#batch-${n}`}>seq {n}</a>;

function sentence(e: StoryEvent, id: number): { text: ReactNode; extra?: ReactNode; tone?: "shock" | "gap" | "quiet" } {
  switch (e.kind) {
    case "registered":
      return { text: <>Joined Sharify. From here on, its box keeps a sealed diary of every hard knock.</>, tone: "quiet" };
    case "took":
      return { text: <>{nameOf(e.who)} picked it up from {inSentence(e.from)}.</> };
    case "deposit":
      return { text: <>{nameOf(e.who)} left a <span className="num">{usd(e.amount)}</span> deposit.</> };
    case "shock":
      return { text: <>It was dropped: a <span className="shock">{TIER_NAMES[e.tier]}</span> knock<span className="proof-only">, <span className="num">{g(e.peakCg)}</span> in <Seq n={e.seq} /></span>. <a className="link check-it" href={href(`verify/${id}/${e.seq}`)}>Check it yourself</a></>, extra: <TierMeter tier={e.tier} />, tone: "shock" };
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

/** What a chapter came to, in one line: the thing a renter actually wants to know about each rental. */
function outcome(c: Chapter): { text: ReactNode; tier: number } {
  const settled = c.events.find((e) => e.kind === "settled");
  if (settled && settled.kind === "settled") {
    return settled.tier === 0
      ? { text: <>No drops. All {usd(settled.refund)} back.</>, tier: 0 }
      : { text: <>A <span className="shock">{TIER_NAMES[settled.tier]}</span> knock. {usd(settled.fee)} kept, {usd(settled.refund)} back.</>, tier: settled.tier };
  }
  const shocks = c.events.filter((e) => e.kind === "shock" || e.kind === "late") as Extract<StoryEvent, { tier: number }>[];
  const top = shocks.reduce((m, e) => Math.max(m, e.tier), 0);
  if (c.isRental && c.end === null) return { text: top ? <>Riding now. A <span className="shock">{TIER_NAMES[top]}</span> knock so far.</> : <>Riding now. No drops so far.</>, tier: top };
  if (c.events.some((e) => e.kind === "registered")) return { text: <>Joined Sharify with its recorder.</>, tier: 0 };
  return { text: top ? <>A <span className="shock">{TIER_NAMES[top]}</span> knock while with {c.custodian.role === "owner" ? "the owner" : nameOf(c.custodian)}.</> : <>Nothing happened worth noting.</>, tier: top };
}

/** One rental as a card: who, when, what it came to; the steps sit behind a tap (Linear's changelog). */
function ChapterCard({ c, d, explorer, open }: { c: Chapter; d: ObjectDetail; explorer: string | null; open: boolean }) {
  const who = c.isRental ? `${possessive(c.custodian)} rental` : c.custodian.role === "owner" ? "With the owner" : `With ${nameOf(c.custodian)}`;
  const o = outcome(c);
  const gap = c.events.find((e) => e.kind === "gap");
  const live = c.isRental && c.end === null;
  return (
    <li className={`rcard ${o.tier ? "is-shock" : ""} ${live ? "is-live" : ""}`}>
      <div className="rcard-top">
        <span className="rcard-face" aria-hidden="true">{c.isRental ? nameOf(c.custodian).slice(0, 1) : "S"}</span>
        <div>
          <h3>{who}</h3>
          <p className="rcard-when">{c.end ? <>{whenShort(c.start)}, for {span(c.start, c.end)}</> : <>{span(c.start, null)} so far</>}<span className="proof-only"> · {day(c.start)}, {hm(c.start)}{c.end ? `–${hm(c.end)}` : ", now"}</span></p>
        </div>
        <span className="rcard-meter"><TierMeter tier={o.tier as 0 | 1 | 2 | 3} showNone /></span>
      </div>
      <p className="rcard-outcome">{o.text}</p>
      {gap && gap.kind === "gap" && <p className="rcard-gap">{gap.missing === 1 ? "A page of its diary never arrived." : `${gap.missing} pages of its diary never arrived.`} The hole stays visible.</p>}
      {c.events.length > 0 && (
        <details className="rcard-steps" open={open}>
          <summary>{open ? "Every step" : `Every step (${c.events.length})`}</summary>
          <ol className="events">
            {c.events.map((e, i) => {
              const s = sentence(e, d.id);
              return (
                <li key={i} className={`event ${s.tone ?? ""}`}>
                  <time className="mono" dateTime={new Date(e.at.at).toISOString()} title={`${day(e.at.at)}, ${hm(e.at.at)}`}>{whenShort(e.at.at)}</time>
                  <p>{s.text}</p>
                  <span className="proof-only"><Tx explorer={explorer} tx={e.at.tx} /></span>
                </li>
              );
            })}
          </ol>
        </details>
      )}
    </li>
  );
}

/** The record in one sentence, before any detail: Airbnb's "4.64 · 28 reviews" line, in words. */
function headline(d: ObjectDetail) {
  const settled = d.rentals.filter((r) => r.settlement);
  const n = settled.length;
  const knocks = settled.filter((r) => r.settlement!.tier > 0);
  if (n === 0) return d.activeRental ? "Its first rental is under way." : "Nobody has rented it yet.";
  const rentals = n === 1 ? "1 rental" : `${n} rentals`;
  if (knocks.length === 0) return `${rentals}, never dropped.`;
  const worst = Math.max(...knocks.map((r) => r.settlement!.tier));
  return `${rentals}, dropped ${knocks.length === 1 ? "once" : `${knocks.length} times`}. The hardest: a ${TIER_NAMES[worst]} knock.`;
}

export function Timeline({ d, explorer, proof = false }: { d: ObjectDetail; explorer: string | null; proof?: boolean }) {
  const missing = d.gaps.reduce((s, x) => s + x.missing, 0);
  // Rentals, and any stretch with the owner where something happened (a knock, a hole); joining is in the facts.
  const chapters = buildStory(d).filter((c) => c.isRental || c.events.some((e) => e.kind !== "registered"));
  return (
    <section className="record-zone" aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="record-kicker">Its record</h2>
      <p className="record-head">{headline(d)}</p>
      <p className="record-facts">
        <span>On Sharify since {day(d.created.at)}</span>
        {missing > 0 && <span className="record-gap">{missing === 1 ? "1 page" : `${missing} pages`} of its diary missing</span>}
        <span className="proof-only">{d.batches.length} batches signed</span>
      </p>
      <ol className="rcards">
        {chapters.map((c) => <ChapterCard key={c.period} c={c} d={d} explorer={explorer} open={proof} />)}
      </ol>
      <p className="record-note">Newest first. A knock is what the box felt, not proof of damage.</p>
    </section>
  );
}
