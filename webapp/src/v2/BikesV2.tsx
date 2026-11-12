import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFleet, listObjects } from "../data/api";
import type { FleetBike } from "../data/types";
import { BOCCONI } from "../data/mock/fleet";
import { FleetMap, type LatLon } from "../components/FleetMap";
import { distanceText, metres, walkText } from "../ui/geo";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { Button, FilterPill, PhotoCard, StatusPill } from "./ui";
import { SiteFooterV2, SiteHeaderV2 } from "./SiteChromeV2";
import { bikePhoto } from "./bikes";
import "./bikes.css";

/** Find a bike (v2): cards on the left, the map on the right that stays in view; on a phone the map sits on top.
 *  Same data, filters and states as the old finder (the old Finder.tsx (removed in lotto 5)); only the look is new. */

type Me = LatLon & { accuracy: number };
type Entry = { b: FleetBike; d: number };

const KINDS: { id: FleetBike["kind"]; label: string }[] = [
  { id: "City bike", label: "City" }, { id: "E-bike", label: "E-bike" }, { id: "Cargo bike", label: "Cargo" }, { id: "Road bike", label: "Road" },
];
const CHEAP = 2; // dollars an hour

const band = (m: number) => { const min = Math.round(m / 80); return min <= 5 ? "near" : min <= 15 ? "mid" : "far"; };
const BAND_NAMES: Record<string, string> = { near: "Under 5 minutes' walk", mid: "10 to 15 minutes' walk", far: "A longer walk" };

function useMedia(q: string) {
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const f = () => setOn(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, [q]);
  return on;
}

function ago(ms: number) {
  const h = Math.round((Date.now() - ms) / 3600_000);
  if (h < 1) return "less than an hour ago";
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** What the black box says about this bike, in one plain line. */
const recordText = (b: FleetBike) => {
  const r = b.record;
  if (!r.lastDrop) return `${r.rentals} rentals, never dropped`;
  return `${r.drops === 1 ? "Dropped once" : `Dropped ${r.drops} times`} in ${r.rentals} rentals, last ${ago(r.lastDrop.at)}`;
};

export function BikesV2() {
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const [me, setMe] = useState<Me | null>(null);
  const [locating, setLocating] = useState<"idle" | "asking" | "denied">("idle");
  const origin: LatLon = me ?? BOCCONI;
  const bikes: Entry[] = useMemo(() => (fleet.data ?? [])
    .map((b) => ({ b, d: metres(origin, b) }))
    .sort((x, y) => x.d - y.d), [fleet.data, origin.lat, origin.lon]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = bikes.find((x) => x.b.live);
  const { account } = useViewer();
  const mine = useQuery({ queryKey: ["objects-mine-home", account?.address], enabled: !!account, queryFn: listObjects });
  const rentingIt = !!account && !!mine.data?.some((o) => o.custodian.address.toLowerCase() === account.address.toLowerCase() && o.activeRental);
  const loaded = !!fleet.data;
  const failed = !fleet.data && fleet.failureCount > 0;

  const locate = () => {
    if (!("geolocation" in navigator)) { setLocating("denied"); return; }
    setLocating("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }); setLocating("idle"); },
      () => setLocating("denied"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const phone = useMedia("(max-width: 899px)");
  const [kind, setKind] = useState<FleetBike["kind"] | null>(null);
  const [cheap, setCheap] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const shown = useMemo(() => bikes.filter((x) => (!kind || x.b.kind === kind) && (!cheap || Number(x.b.pricePerHour) <= CHEAP)), [bikes, kind, cheap]);
  const fleetBikes = useMemo(() => shown.map((x) => x.b), [shown]);
  const current = shown.find((x) => x.b.key === selected) ?? null;
  const select = useCallback((k: string | null) => setSelected(k), []);
  const padding = useMemo(() => (phone ? { top: 16, bottom: 16, left: 0 } : { top: 72, bottom: current ? 220 : 72, left: 0 }), [phone, current]);

  // A pin chosen on the map brings its card into view.
  const cards = useRef(new Map<string, HTMLElement>());
  useEffect(() => {
    if (!selected) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.current.get(selected)?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "nearest" });
  }, [selected]);

  const clear = () => { setKind(null); setCheap(false); };
  const title = `Bikes near ${me ? "you" : "Bocconi"}`;

  const map = (
    <div className="v2-finder-map">
      <FleetMap bikes={fleetBikes} center={BOCCONI} me={me} selected={selected} highlight={hover} onSelect={select} padding={padding} />
      <button type="button" className="v2-map-locate" onClick={locate} disabled={locating === "asking"} aria-label={me ? "Recenter on you" : "Show bikes near me"}>
        {locating === "asking" ? "Locating…" : me ? "Recenter" : "Near me"}
      </button>
      {current && !phone && (
        <div className="v2-map-mini" role="dialog" aria-label={current.b.label}>
          <img className="v2-map-mini-photo" src={bikePhoto(current.b)} alt="" />
          <div className="v2-map-mini-body">
            <p className="v2-h3">{current.b.label}</p>
            <p className="v2-body v2-muted">{current.b.pricePerHour} dollars an hour, {current.b.deposit} deposit · {walkText(current.d)}</p>
            {current.b.live && current.b.objectId !== null ? (
              <div className="v2-map-mini-actions">
                <Button size="sm" href={href(`rent/${current.b.objectId}`)}>Rent</Button>
                <Button size="sm" variant="secondary" href={href(`object/${current.b.objectId}`)}>See the bike</Button>
              </div>
            ) : (
              <p className="v2-body v2-muted">A sample bike: it has no recorder, so it can't be rented.{" "}
                {live && <button type="button" className="v2-btn v2-btn-link" onClick={() => select(live.b.key)}>Show the real bike</button>}
              </p>
            )}
          </div>
          <button type="button" className="v2-map-mini-close" aria-label="Close" onClick={() => select(null)}>×</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="v2">
      <SiteHeaderV2 variant="solid" current="bikes" />
      <main className="v2-container v2-finder">
        <header className="v2-finder-head">
          <p className="v2-eyebrow">Find a bike</p>
          <h1 className="v2-h2">{title}</h1>
          <p className="v2-body v2-muted v2-gap-8" role="status">
            {failed ? "The map reads the bikes from the blockchain, and it isn't answering right now."
              : !loaded ? "Looking for bikes near you…"
              : `${shown.length} free to borrow, nearest first.`}
          </p>
          <div className="v2-finder-filters" role="group" aria-label="Filter the bikes">
            <FilterPill pressed={!kind && !cheap} onClick={clear}>All</FilterPill>
            {KINDS.map((k) => <FilterPill key={k.id} pressed={kind === k.id} onClick={() => setKind(kind === k.id ? null : k.id)}>{k.label}</FilterPill>)}
            <FilterPill pressed={cheap} onClick={() => setCheap(!cheap)}>Up to {CHEAP} dollars</FilterPill>
          </div>
          {locating === "denied" && <p className="v2-body v2-muted v2-gap-16" role="status">Location unavailable: showing bikes around Bocconi.</p>}
          {!live && loaded && <p className="v2-body v2-muted v2-gap-16">{rentingIt ? "You have the real bike right now, so it isn't on the map." : "The real bike is out on a ride right now, so it isn't on the map."}</p>}
        </header>

        <div className="v2-finder-body">
          {phone && map}
          <div className="v2-finder-list">
            {failed ? (
              <div className="v2-finder-empty" role="status">
                <p className="v2-h3">No bikes to show until it answers.</p>
                <p className="v2-body v2-muted">We don't show a copy from our own server instead. It asks again every few seconds by itself.</p>
                <div className="v2-gap-24"><Button onClick={() => fleet.refetch()}>Try again now</Button></div>
              </div>
            ) : loaded && shown.length === 0 && (kind || cheap) ? (
              <p className="v2-body v2-finder-empty">No bike matches. <button type="button" className="v2-btn v2-btn-link" onClick={clear}>Show all bikes</button></p>
            ) : loaded && shown.length === 0 ? (
              <p className="v2-body v2-muted v2-finder-empty">No bike is free right now. Bikes come back on the map when their ride ends.</p>
            ) : null}
            <ul className="v2-finder-grid">
              {shown.map(({ b, d }, i) => (
                <Fragment key={b.key}>
                  {!b.live && i > 0 && shown[i - 1].b.live && (
                    <li className="v2-finder-note"><p className="v2-body"><span className="v2-strong">Sample fleet.</span> <span className="v2-muted">Only the demo bike can be rented.</span></p></li>
                  )}
                  {!b.live && (i === 0 || shown[i - 1].b.live || band(shown[i - 1].d) !== band(d)) && (
                    <li className="v2-finder-group"><p className="v2-body v2-strong">{BAND_NAMES[band(d)]}</p></li>
                  )}
                  <li ref={(el) => { if (el) cards.current.set(b.key, el); else cards.current.delete(b.key); }}
                    className={`v2-finder-item${b.live ? " is-live" : ""}`} onMouseEnter={() => setHover(b.key)} onMouseLeave={() => setHover(null)}>
                    <PhotoCard img={bikePhoto(b)} alt={`${b.label}, parked`} selected={b.key === selected} onClick={() => select(b.key)} className={b.live ? "v2-card-row" : ""}
                      badge={b.live ? <StatusPill tone="live">Live</StatusPill> : undefined}>
                      {/* Inside a button: spans, shown as lines. */}
                      <span className="v2-line v2-h3">{b.label}</span>
                      <span className="v2-line v2-body v2-muted"><span className="v2-finder-dist">{distanceText(d)} · </span>{walkText(d)}</span>
                      <span className="v2-line v2-body"><span className="v2-strong">{b.pricePerHour} dollars</span> an hour</span>
                      <span className="v2-line v2-body v2-muted v2-finder-record">{recordText(b)}</span>
                    </PhotoCard>
                    {b.live && b.objectId !== null && <div className="v2-finder-rent"><Button size="sm" href={href(`rent/${b.objectId}`)}>Rent</Button></div>}
                  </li>
                </Fragment>
              ))}
            </ul>
          </div>
          {!phone && <div className="v2-finder-aside">{map}</div>}
        </div>
      </main>
      <SiteFooterV2 />
    </div>
  );
}
