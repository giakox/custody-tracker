import type { ReactNode } from "react";
import type { ObjectDetail } from "../data/types";
import { buildStory, type Chapter, type StoryEvent } from "../ui/story";
import { day, g, hm, inSentence, nameOf, possessive, shortHex, span, txUrl, usd } from "../ui/format";
import { TierMeter } from "./TierMeter";

function Tx({ explorer, tx }: { explorer: string | null; tx: string }) {
  const url = txUrl(explorer, tx);
  const label = shortHex(tx);
  return url
    ? <a className="tx mono" href={url} target="_blank" rel="noreferrer" aria-label={`Transaction ${tx}`}>{label}</a>
    : <span className="tx mono">{label}</span>;
}

const Seq = ({ n }: { n: number }) => <a className="mono seq-link" href={`#batch-${n}`}>seq {n}</a>;

function sentence(e: StoryEvent, d: ObjectDetail): { text: ReactNode; extra?: ReactNode; tone?: "shock" | "gap" | "quiet" } {
  switch (e.kind) {
    case "registered":
      return { text: <>Registered on-chain. From here on, the chip signs each batch of readings it sends.</>, tone: "quiet" };
    case "took":
      return { text: <>{nameOf(e.who)} took it from {inSentence(e.from)}: handover proposed and accepted on-chain.</> };
    case "deposit":
      return { text: <>{nameOf(e.who)} locked <span className="num">{usd(e.amount)}</span> in the contract as collateral.</> };
    case "shock":
      return { text: <>Recorded a <span className="num shock">{g(e.peakCg)}</span> shock in <Seq n={e.seq} />.</>, extra: <TierMeter tier={e.tier} />, tone: "shock" };
    case "late":
      return {
        text: <>A <span className="num shock">{g(e.peakCg)}</span> shock from {e.during ? `${possessive(e.during)} rental` : "the previous custody"} reached the chain after the return, so it counts for {inSentence(e.countsFor)}.</>,
        extra: <TierMeter tier={e.tier} />, tone: "shock",
      };
    case "gap":
      return {
        text: e.missing === 1
          ? <>Seq {e.from} never reached the chain. The record shows the gap; nobody can fill it later.</>
          : <>Seq {e.from} to {e.to} never reached the chain: {e.missing} batches missing. The record shows the gap; nobody can fill it later.</>,
        tone: "gap",
      };
    case "returned":
      return { text: <>Back with {inSentence(e.to)}: return proposed and accepted on-chain.</> };
    case "settled":
      return e.tier === 0
        ? { text: <>Settled by the contract: nothing above {g(d.terms.lightCg)}, all <span className="num">{usd(e.refund)}</span> back to {nameOf(e.who)}.</> }
        : {
          text: <>Settled by the contract: <span className="num">{usd(e.fee)}</span> withheld for the {g(e.peakCg)} shock{e.causeSeq !== null && <> in <Seq n={e.causeSeq} /></>}, {Number(e.refund) === 0 ? <>nothing back to {nameOf(e.who)}</> : <><span className="num">{usd(e.refund)}</span> back to {nameOf(e.who)}</>}.</>,
          extra: <TierMeter tier={e.tier} />,
        };
    case "offered":
      return e.to.role === "owner"
        ? { text: <>{nameOf(e.from)} handed it back. Waiting for the owner to confirm.</> }
        : { text: <>The owner offered it to {nameOf(e.to)}. Waiting for {nameOf(e.to)} to accept and lock the collateral.</> };
  }
}

function ChapterBlock({ c, d, explorer }: { c: Chapter; d: ObjectDetail; explorer: string | null }) {
  const who = c.isRental ? `${possessive(c.custodian)} rental` : c.custodian.role === "owner" ? "With the owner" : `With ${nameOf(c.custodian)}`;
  const peak = c.maxPeakCg === null ? "no readings" : c.batchCount === 1 ? "1 batch" : `${c.batchCount} batches`;
  const quiet = c.events.length === 0;
  return (
    <section className={`chapter ${c.isRental ? "rental" : ""} ${quiet ? "quiet" : ""}`} aria-label={who}>
      <header className="chapter-head">
        <h3>{who}</h3>
        <p className="mono">
          {day(c.start)}, {hm(c.start)}{c.end ? `–${hm(c.end)}` : ", now"} <span className="sep" aria-hidden="true">/</span> {span(c.start, c.end)}
          <span className="sep" aria-hidden="true">/</span> {peak}{c.maxPeakCg !== null && c.maxPeakCg < d.terms.lightCg ? `, nothing above ${g(d.terms.lightCg)}` : ""}
        </p>
      </header>
      {!quiet && (
        <ol className="events">
          {c.events.map((e, i) => {
            const s = sentence(e, d);
            return (
              <li key={i} className={`event ${s.tone ?? ""}`}>
                <time className="mono" dateTime={new Date(e.at.at).toISOString()}>{hm(e.at.at)}</time>
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

export function Timeline({ d, explorer }: { d: ObjectDetail; explorer: string | null }) {
  return (
    <section className="block timeline" aria-labelledby="timeline-title">
      <div className="block-intro">
        <h2 id="timeline-title">What it went through</h2>
        <p>Newest first. Each line links to the transaction that proves it, so you can check it without asking us.</p>
      </div>
      <div className="chapters">
        {buildStory(d).map((c) => <ChapterBlock key={c.period} c={c} d={d} explorer={explorer} />)}
      </div>
    </section>
  );
}
