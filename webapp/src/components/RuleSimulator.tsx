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
export function RuleSimulator({ terms }: { terms: Terms }) {
  // the slider moves on a log scale: 1 g to 200 g, so the light/medium thresholds aren't squeezed at the start
  const [pos, setPos] = useState(0.62);
  const cg = Math.round(Math.exp(Math.log(100) + pos * (Math.log(20000) - Math.log(100))) / 10) * 10;
  const tier = tierOf(terms, cg);
  const bps = [0, terms.lightBps, terms.mediumBps, terms.strongBps][tier];
  const c = Number(terms.collateral);
  const fee = Math.round(c * bps) / 10_000;
  const toPos = (v: number) => (Math.log(v) - Math.log(100)) / (Math.log(20000) - Math.log(100));
  return (
    <section className={`sim tier-${tier}`} aria-label="Try the rule">
      <div className="sim-top">
        <div>
          <p className="sim-k mono">If the worst shock of your rental were</p>
          <p className={`sim-peak mono ${tier ? "shock" : ""}`}>{g(cg)}</p>
        </div>
        <div className="sim-out">
          <p className="sim-k mono">you'd get back</p>
          <p className="sim-back mono">{usd(String(c - fee))}</p>
          <p className="sim-fee mono">{tier ? `${usd(String(fee))} withheld · ${TIER_NAMES[tier]}` : "nothing withheld"}</p>
        </div>
      </div>
      <div className="sim-track">
        <input type="range" min={0} max={1} step={0.001} value={pos} onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Worst shock of the rental" aria-valuetext={`${g(cg)}, ${TIER_NAMES[tier]}, ${usd(String(c - fee))} back`} />
        <div className="sim-ticks" aria-hidden="true">
          {[terms.lightCg, terms.mediumCg, terms.strongCg].map((t) => <i key={t} style={{ left: `${toPos(t) * 100}%` }}><span className="mono">{g(t)}</span></i>)}
        </div>
        <div className="sim-examples">
          {EXAMPLES.map((e) => <button key={e.label} type="button" className="mono" style={{ left: `${toPos(e.cg) * 100}%` }} onClick={() => setPos(toPos(e.cg))}>{e.label}</button>)}
        </div>
      </div>
      <RuleTiers terms={terms} highlight={tier} />
      <p className="hint-line">Examples are indicative peaks from early tests, not measurements of this bike. 1 g is the bike standing still.</p>
    </section>
  );
}
