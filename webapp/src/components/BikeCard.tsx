import type { FleetBike } from "../data/types";
import { g, TIER_NAMES } from "../ui/format";
import { TierMeter } from "./TierMeter";

export const LiveBadge = ({ live }: { live: boolean }) =>
  live ? <span className="badge badge-live"><i aria-hidden="true" />Live · on-chain</span>
    : <span className="badge badge-sample">Sample fleet</span>;

/** The owner's photo of the bike (one per bike in public/img/fleet; the live bike is "demo"). */
export function BikePhoto({ b, className = "" }: { b: FleetBike; className?: string }) {
  const src = b.live ? "./img/day/bocconi-park.jpg" : `./img/fleet/${b.key}.jpg`;
  return <img className={`bike-photo ${className}`} src={src} alt={`${b.label}, parked`} loading="lazy" />;
}

function ago(ms: number) {
  const h = Math.round((Date.now() - ms) / 3600_000);
  if (h < 1) return "less than an hour ago";
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** What the black box says about this bike, in one line: Sharify's difference. */
export function BlackBoxLine({ b }: { b: FleetBike }) {
  const r = b.record;
  if (!r.lastDrop) return <p className="bb-line"><TierMeter tier={0} showNone /><span>{r.rentals} rentals, never dropped</span></p>;
  const d = r.lastDrop;
  return (
    <p className="bb-line" title={g(d.peakCg)}>
      <TierMeter tier={d.tier} />
      <span>{r.drops === 1 ? "Dropped once" : `Dropped ${r.drops} times`} in {r.rentals} rentals, last a <span className="shock">{TIER_NAMES[d.tier]}</span> knock {ago(d.at)}</span>
    </p>
  );
}
