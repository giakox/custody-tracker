import { useState } from "react";
import type { Terms, Tier } from "../data/types";
import { TIER_NAMES, usd } from "../ui/format";

export type KnockRow = { num: string; name: string; sum: string };

/** The four lines of a bike's rule, read from its terms: under light, light, medium, strong. */
export function knockRows(t: Terms): KnockRow[] {
  const c = Number(t.collateral);
  const kept = (bps: number) => usd(String(Math.round(c * bps) / 10_000));
  const gram = (cg: number) => String(Math.round(cg) / 100);
  return [
    { num: `< ${gram(t.lightCg)}`, name: "No knock", sum: `All ${usd(t.collateral)} back` },
    { num: gram(t.lightCg), name: "Light knock", sum: `${kept(t.lightBps)} kept` },
    { num: gram(t.mediumCg), name: "Medium knock", sum: `${kept(t.mediumBps)} kept` },
    { num: gram(t.strongCg), name: "Strong knock", sum: `${kept(t.strongBps)} kept` },
  ];
}

/** Number in a fixed column ("8 g"), the level and the amount beside it, on one baseline (Home's "The box"). */
export function KnockList({ rows, className = "", current }: { rows: KnockRow[]; className?: string; current?: number }) {
  return (
    <ul className={`v2-knocks${current !== undefined ? " has-current" : ""} ${className}`.trim()}>
      {rows.map((k, i) => (
        <li className={`v2-knock${i === current ? " is-current" : ""}`} key={k.name} aria-current={i === current ? "true" : undefined}>
          <p className="v2-knock-num">{k.num}<span className="v2-knock-unit">g</span></p>
          <div>
            <p className="v2-knock-name">{k.name}</p>
            <p className="v2-knock-sum">{k.sum}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Same rule as the contract and the old RuleSimulator: the hardest knock picks the tier, the tier a share of the deposit. */
const tierOf = (t: Terms, cg: number): Tier => (cg >= t.strongCg ? 3 : cg >= t.mediumCg ? 2 : cg >= t.lightCg ? 1 : 0);

/** Said wherever the examples are shown. */
export const RULE_NOTE = "Examples are indicative peaks from early tests, not measurements of this bike. 1 g is the bike standing still.";

/** Indicative peaks, not measurements of this bike. */
const EXAMPLES = [{ g: 6, label: "Kerb" }, { g: 14, label: "Pothole" }, { g: 41, label: "Fall" }];

/** "Try a knock": a slider over the four lines of the rule. Thresholds come from the bike's own terms. */
/** `grid`: the four lines side by side (Home, wide screens); `note`: the line about the examples, which the Home moves under the photo. */
export function RuleTry({ terms, id = "try-knock", grid = false, note = true }: { terms: Terms; id?: string; grid?: boolean; note?: boolean }) {
  const max = Math.max(100, Math.ceil((terms.strongCg / 100) * 1.25));
  const [g, setG] = useState(14);
  const cg = Math.round(g * 100);
  const tier = tierOf(terms, cg);
  const bps = [0, terms.lightBps, terms.mediumBps, terms.strongBps][tier];
  const c = Number(terms.collateral);
  const fee = Math.round(c * bps) / 10_000;
  const back = c - fee;
  const pct = (v: number) => `${(v / max) * 100}%`;
  return (
    <div className="v2-try">
      <p className="v2-try-big" aria-live="polite">{usd(String(back))} back</p>
      <p className="v2-body v2-muted">{tier ? `${usd(String(fee))} of the ${usd(terms.collateral)} deposit kept for a ${TIER_NAMES[tier]} knock.` : `All of the ${usd(terms.collateral)} deposit comes back.`}</p>
      <div className="v2-try-control">
        <label className="v2-small v2-muted" htmlFor={id}>Try a knock: <span className="v2-try-value">{g} g</span></label>
        <div className="v2-try-track">
          <input id={id} className="v2-range" type="range" min={0} max={max} step={1} value={g} onChange={(e) => setG(Number(e.target.value))}
            style={{ ["--fill" as string]: pct(g) }}
            aria-valuetext={`${g} g, ${tier ? `${TIER_NAMES[tier]} knock` : "no knock"}, ${usd(String(back))} back`} />
          <div className="v2-try-ticks" aria-hidden="true">
            {[terms.lightCg, terms.mediumCg, terms.strongCg].map((t) => <i key={t} style={{ left: pct(t / 100) }}><span>{t / 100}</span></i>)}
          </div>
        </div>
        <div className="v2-try-examples" role="group" aria-label="Examples">
          {EXAMPLES.map((e) => <button key={e.label} type="button" className="v2-filter" aria-pressed={g === e.g} onClick={() => setG(e.g)}>{e.label} {e.g} g</button>)}
        </div>
      </div>
      <KnockList rows={knockRows(terms)} current={tier} className={grid ? "v2-knocks-grid" : ""} />
      {note && <p className="v2-small v2-muted">{RULE_NOTE}</p>}
    </div>
  );
}
