import type { Tier } from "../data/types";
import { TIER_NAMES } from "../ui/format";

/** Three segments + the tier name. Readable without colour and on a washed-out projector. */
export function TierMeter({ tier, showNone = false }: { tier: Tier; showNone?: boolean }) {
  if (tier === 0 && !showNone) return null;
  return (
    <span className={`tier tier-${tier}`} role="img" aria-label={`Shock level: ${TIER_NAMES[tier]}`}>
      <span className="tier-bars" aria-hidden="true">
        {[1, 2, 3].map((i) => <i key={i} className={i <= tier ? "on" : ""} />)}
      </span>
      <span className="tier-name">{TIER_NAMES[tier]}</span>
    </span>
  );
}
