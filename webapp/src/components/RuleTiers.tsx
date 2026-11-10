import type { Terms, Tier } from "../data/types";
import { g, usd } from "../ui/format";
import { TierMeter } from "./TierMeter";

const NAMES = ["", "Light knock", "Medium knock", "Strong knock"];

/** The rule a renter accepts, readable at a glance: level, threshold, share and amount. */
export function RuleTiers({ terms, highlight }: { terms: Terms; highlight?: Tier }) {
  const c = Number(terms.collateral);
  const rows: { tier: Tier; cg: number; bps: number }[] = [
    { tier: 1, cg: terms.lightCg, bps: terms.lightBps },
    { tier: 2, cg: terms.mediumCg, bps: terms.mediumBps },
    { tier: 3, cg: terms.strongCg, bps: terms.strongBps },
  ];
  const amount = (bps: number) => String(Math.round(c * bps) / 10_000);
  return (
    <div className="rule-tiers" role="table" aria-label={`Deposit ${usd(terms.collateral)}: what is withheld for each shock level`}>
      <div className={`rule-row none ${highlight === 0 ? "hl" : ""}`} role="row">
        <span role="cell" className="rule-meter"><TierMeter tier={0} showNone /></span>
        <span role="cell" className="rule-from">No drops <small>under {g(terms.lightCg)}</small></span>
        <span role="cell" className="rule-out">all {usd(terms.collateral)} back</span>
      </div>
      {rows.map((r) => (
        <div key={r.tier} className={`rule-row ${highlight === r.tier ? "hl" : ""}`} role="row">
          <span role="cell" className="rule-meter"><TierMeter tier={r.tier} /></span>
          <span role="cell" className="rule-from">{NAMES[r.tier]} <small>from {g(r.cg)}</small></span>
          <span role="cell" className="rule-out">{usd(amount(r.bps))} kept</span>
        </div>
      ))}
    </div>
  );
}
