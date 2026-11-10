import type { FleetBike } from "../data/types";
import { g, TIER_NAMES } from "../ui/format";
import { href } from "../ui/router";
import { distanceText, walkText } from "../ui/geo";
import { TierMeter } from "./TierMeter";

export const LiveBadge = ({ live }: { live: boolean }) =>
  live ? <span className="badge badge-live mono"><i aria-hidden="true" />Live · on-chain</span>
    : <span className="badge badge-sample mono">Sample fleet</span>;

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
  if (!r.lastDrop) return <p className="bb-line"><TierMeter tier={0} showNone /><span>{r.rentals} rentals · no drops recorded</span></p>;
  const d = r.lastDrop;
  return (
    <p className="bb-line">
      <TierMeter tier={d.tier} />
      <span>{r.drops === 1 ? "1 drop" : `${r.drops} drops`} in {r.rentals} rentals · last {TIER_NAMES[d.tier]}, <span className="shock">{g(d.peakCg)}</span>, {ago(d.at)}</span>
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
      <div className="bike-detail-top">
        <BikeThumb kind={b.kind} />
        <div>
          <LiveBadge live={b.live} />
          <h2 id={`bike-${b.key}`}>{b.label}</h2>
          <p className="muted">{b.kind} · {b.ownerName}</p>
          <p className="mono dist">{distanceText(distance)} · {walkText(distance)}</p>
        </div>
      </div>
      <dl className="bike-facts">
        <div><dt>Price</dt><dd className="mono">{b.pricePerHour} dUSD/h</dd></div>
        <div><dt>Deposit</dt><dd className="mono">{b.deposit} dUSD</dd></div>
      </dl>
      <div className="bb">
        <p className="bb-title">From its black box</p>
        <BlackBoxLine b={b} />
      </div>
      {b.live && b.objectId !== null ? (
        <div className="actions">
          <a className="btn btn-primary" href={href(`rent/${b.objectId}`)}>Rent</a>
          <a className="btn btn-secondary" href={href(`object/${b.objectId}`)}>See its history</a>
        </div>
      ) : (
        <div className="sample-note">
          <p>Sample bike: it has no recorder yet, so there is nothing real to rent or check.</p>
          {onShowLive
            ? <button type="button" className="btn btn-secondary" onClick={onShowLive}>Show the live bike</button>
            : <p className="muted">The live bike is out on a rental right now.</p>}
        </div>
      )}
    </article>
  );
}
