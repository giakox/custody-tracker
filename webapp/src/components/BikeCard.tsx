import type { FleetBike } from "../data/types";
import { g, TIER_NAMES } from "../ui/format";
import { href } from "../ui/router";
import { distanceText, walkText } from "../ui/geo";
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

/** A plain line drawing of a bike, standing in for the owner's photo. */
export function BikeThumb({ kind }: { kind: FleetBike["kind"] }) {
  return (
    <svg className="bike-thumb" viewBox="0 0 120 72" role="img" aria-label={`${kind}, photo not available`}>
      <g fill="none" stroke="var(--fog)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="48" r="17" /><circle cx="92" cy="48" r="17" />
        <path d="M28 48 L50 22 L78 22 L92 48 M50 22 L62 48 L78 22 M62 48 L28 48 M46 16 L56 16 M78 22 L76 14 L84 14" />
        {kind === "Cargo bike" && <rect x="66" y="26" width="30" height="14" rx="2" />}
        {kind === "E-bike" && <rect x="52" y="30" width="14" height="8" rx="2" fill="var(--blue)" stroke="none" />}
      </g>
    </svg>
  );
}

/** Details of one bike: side panel on desktop, bottom sheet on phones. */
export function BikeDetail({ b, distance, onClose, onShowLive }: { b: FleetBike; distance: number; onClose: () => void; onShowLive: (() => void) | null }) {
  return (
    <article className="bike-detail" aria-labelledby={`bike-${b.key}`}>
      <button type="button" className="sheet-close mono" onClick={onClose} aria-label="Close">Close</button>
      <BikePhoto b={b} className="detail-photo" />
      <div className="bike-detail-top">
        <div>
          <LiveBadge live={b.live} />
          <h2 id={`bike-${b.key}`}>{b.label}</h2>
          <p className="muted">{b.kind}, lent by {b.ownerName}</p>
          <p className="mono dist">{distanceText(distance)} · {walkText(distance)}</p>
        </div>
      </div>
      <dl className="bike-facts">
        <div><dt>Price</dt><dd className="mono">{b.pricePerHour} dollars an hour</dd></div>
        <div><dt>Deposit</dt><dd className="mono">{b.deposit} dollars</dd></div>
      </dl>
      <div className="bb">
        <p className="bb-title">Its record</p>
        <BlackBoxLine b={b} />
      </div>
      {b.live && b.objectId !== null ? (
        <div className="actions">
          <a className="btn btn-primary" href={href(`rent/${b.objectId}`)}>Rent</a>
          <a className="btn btn-secondary" href={href(`object/${b.objectId}`)}>See the bike</a>
        </div>
      ) : (
        <div className="sample-note">
          <p>This is a sample bike: it has no recorder yet, so it can't be rented. One bike is real.</p>
          {onShowLive
            ? <button type="button" className="btn btn-secondary" onClick={onShowLive}>Show the live bike</button>
            : <p className="muted">The live bike is out on a rental right now.</p>}
        </div>
      )}
    </article>
  );
}
