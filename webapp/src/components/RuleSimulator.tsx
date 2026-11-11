import { useState } from "react";
import type { Terms, Tier } from "../data/types";
import { g, TIER_NAMES, usd } from "../ui/format";
import { RuleTiers } from "./RuleTiers";

/** Indicative peaks from docs/CALIBRATION.md (not yet measured on this bike). */
const EXAMPLES = [
  { cg: 110, label: "riding" },
  { cg: 1500, label: "pothole" },
  { cg: 4000, label: "falls over" },
  { cg: 12000, label: "dropped on stone" },
];

const tierOf = (t: Terms, cg: number): Tier => (cg >= t.strongCg ? 3 : cg >= t.mediumCg ? 2 : cg >= t.lightCg ? 1 : 0);

/** "What if it gets dropped?": drag a peak and see what the contract would do, before you lock anything. */
/** `full`: show the whole rule table under the answer (the Rule step); the Home shows only the answer. */
export function RuleSimulator({ terms, full = true }: { terms: Terms; full?: boolean }) {
  // the slider moves on a log scale: 1 g to 200 g, so the light/medium thresholds aren't squeezed at the start
  const [pos, setPos] = useState(0.62);
  const cg = Math.round(Math.exp(Math.log(100) + pos * (Math.log(20000) - Math.log(100))) / 10) * 10;
  const tier = tierOf(terms, cg);
  const bps = [0, terms.lightBps, terms.mediumBps, terms.strongBps][tier];
  const c = Number(terms.collateral);
  const fee = Math.round(c * bps) / 10_000;
  const toPos = (v: number) => (Math.log(v) - Math.log(100)) / (Math.log(20000) - Math.log(100));
  const near = EXAMPLES.reduce((best, e) => (Math.abs(toPos(e.cg) - pos) < Math.abs(toPos(best.cg) - pos) ? e : best), EXAMPLES[0]);
  const onExample = Math.abs(toPos(near.cg) - pos) < 0.01;
  const back = c - fee;
  return (
    <section className={`sim sim2 tier-${tier}`} aria-label="Try the rule">
      <p className="sim-k">What happened on the ride?</p>
      <div className="sim-scen" role="group" aria-label="Examples">
        {EXAMPLES.map((e) => <button key={e.label} type="button" aria-pressed={onExample && near.label === e.label} onClick={() => setPos(toPos(e.cg))}>{e.label}</button>)}
      </div>
      <div className="sim-track">
        <input type="range" min={0} max={1} step={0.001} value={pos} onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Hardest knock of the ride" aria-valuetext={`${g(cg)}, ${TIER_NAMES[tier]}, ${usd(String(back))} back`} />
        <div className="sim-ticks" aria-hidden="true">
          {[terms.lightCg, terms.mediumCg, terms.strongCg].map((t) => <i key={t} style={{ left: `${toPos(t) * 100}%` }} />)}
        </div>
        <p className="sim-read">Hardest knock <b className={tier ? "shock" : ""}>{g(cg)}</b>{tier ? <>, a {TIER_NAMES[tier]} knock</> : <>, under the first level</>}</p>
      </div>
      <div className="sim-money">
        <p className="sim-k">You'd get back</p>
        <p className="sim-back">{usd(String(back))}</p>
        <div className="split" aria-hidden="true">
          {back > 0 && <i className="split-back" style={{ flexGrow: back }} />}
          {fee > 0 && <i className="split-kept" style={{ flexGrow: fee }} />}
        </div>
        <p className="sim-fee">{tier ? <>{usd(String(fee))} of the {usd(terms.collateral)} deposit goes to the owner, by the rule.</> : <>All of the {usd(terms.collateral)} deposit comes back.</>}</p>
      </div>
      {full && <RuleTiers terms={terms} highlight={tier} />}
      <p className="hint-line">Examples are indicative peaks from early tests, not measurements of this bike. 1 g is the bike standing still.</p>
    </section>
  );
}
