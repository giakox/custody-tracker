import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FleetBike } from "../data/types";
import { href } from "../ui/router";
import { distanceText, walkText } from "../ui/geo";
import { BOCCONI } from "../data/mock/fleet";
import { FleetMap, type LatLon } from "./FleetMap";
import { BikePhoto, BlackBoxLine, LiveBadge } from "./BikeCard";

type Entry = { b: FleetBike; d: number };
const KINDS: { id: FleetBike["kind"]; label: string }[] = [
  { id: "City bike", label: "City" }, { id: "E-bike", label: "E-bike" }, { id: "Cargo bike", label: "Cargo" }, { id: "Road bike", label: "Road" },
];
const CHEAP = 2; // dollars an hour

function useMedia(q: string) {
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const f = () => setOn(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, [q]);
  return on;
}

/** Find a bike: large photo cards on the left, the map as a framed panel that stays in view on the right (a phone: the map
 *  fills the screen and the cards ride in a sheet that pulls up). Structure after Airbnb's search with the map on. */
/** Closer bikes get bigger cards: size says distance (round 103). */
const band = (m: number) => { const min = Math.round(m / 80); return min <= 5 ? "near" : min <= 15 ? "mid" : "far"; };
const BAND_NAMES: Record<string, string> = { near: "Under 5 minutes' walk", mid: "10 to 15 minutes' walk", far: "A longer walk" };

export function Finder({ bikes, me, locating, onLocate, live, rentingIt, loaded, failed = false, onRetry }: {
  bikes: Entry[]; me: (LatLon & { accuracy: number }) | null; locating: "idle" | "asking" | "denied"; onLocate: () => void;
  live: Entry | undefined; rentingIt: boolean; loaded: boolean; failed?: boolean; onRetry?: () => void;
}) {
  const phone = useMedia("(max-width: 899px)");
  const [kind, setKind] = useState<FleetBike["kind"] | null>(null);
  const [cheap, setCheap] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"peek" | "full">("peek");
  const shown = useMemo(() => bikes.filter((x) => (!kind || x.b.kind === kind) && (!cheap || Number(x.b.pricePerHour) <= CHEAP)), [bikes, kind, cheap]);
  const fleetBikes = useMemo(() => shown.map((x) => x.b), [shown]);
  const current = shown.find((x) => x.b.key === selected) ?? null;
  const origin: LatLon = me ?? BOCCONI;
  void origin;

  const cards = useRef(new Map<string, HTMLElement>());
  const list = useRef<HTMLUListElement>(null);
  const fromScroll = useRef(false);
  const select = useCallback((k: string | null) => setSelected(k), []);

  // A pin or a card chosen elsewhere brings its card into view (without fighting the carousel's own scrolling).
  useEffect(() => {
    if (!selected) return;
    if (fromScroll.current) { fromScroll.current = false; return; }
    const el = cards.current.get(selected);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  // On a phone the card in the middle of the carousel is the active one: its pin lights up.
  const onScroll = useCallback(() => {
    if (!phone || sheet !== "peek" || !list.current) return;
    const box = list.current.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best: { k: string; dist: number } | null = null;
    for (const [k, el] of cards.current) { const r = el.getBoundingClientRect(); const dist = Math.abs(r.left + r.width / 2 - mid); if (!best || dist < best.dist) best = { k, dist }; }
    if (best && best.k !== selected) { fromScroll.current = true; setSelected(best.k); }
  }, [phone, sheet, selected]);

  const drag = useRef<number | null>(null);
  const padding = useMemo(() => (phone ? { top: 150, bottom: 190, left: 0, sheet: 0.3 } : { top: 28, bottom: 150, left: 0 }), [phone]);

  const title = `Bikes near ${me ? "you" : "Bocconi"}`;
  return (
    <section id="bikes" className={`finder ${phone ? "is-phone" : ""}`} aria-labelledby="finder-title">
      <div className="finder-body">
      <div className="finder-main">
      <header className="finder-head">
        <div className="finder-title">
        <div className="finder-title-row">
          <h2 id="finder-title">{title}</h2>
        </div>
          <p>{failed ? "The map reads the bikes from the blockchain, and it isn't answering right now." : !loaded ? "Looking for bikes near you…" : <>{shown.length} free to borrow, nearest first. Bikes out on a ride never show: where they are is where someone is.</>}</p>
        </div>
        <div className="finder-chips" role="group" aria-label="Filter the bikes">
          <button type="button" className="chip" aria-pressed={!kind && !cheap} onClick={() => { setKind(null); setCheap(false); }}>All</button>
          {KINDS.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} onClick={() => setKind(kind === k.id ? null : k.id)}>{k.label}</button>)}
          <button type="button" className="chip" aria-pressed={cheap} onClick={() => setCheap(!cheap)}>Up to {CHEAP} dollars</button>
        </div>
        {locating === "denied" && <p className="finder-note" role="status">Location unavailable: showing bikes around Bocconi.</p>}
        {!live && loaded && <p className="finder-note">{rentingIt ? "You have the real bike right now, so it isn't on the map." : "The real bike is out on a ride right now, so it isn't on the map."}</p>}
      </header>

        <div className="finder-list" data-sheet={sheet}>
          <button type="button" className="sheet-handle" aria-label={sheet === "peek" ? "Show all bikes" : "Show the map"} aria-expanded={sheet === "full"}
            onClick={() => setSheet(sheet === "peek" ? "full" : "peek")}
            onPointerDown={(e) => { drag.current = e.clientY; }}
            onPointerUp={(e) => { if (drag.current === null) return; const dy = e.clientY - drag.current; drag.current = null; if (dy < -30) setSheet("full"); else if (dy > 30) setSheet("peek"); }}>
            <i aria-hidden="true" /><span>{failed ? "No connection to the chain" : !loaded ? "Looking for bikes…" : `${shown.length} bikes`}</span>
          </button>
          {failed ? (
            <div className="finder-down" role="status">
              <span className="state-dot" aria-hidden="true" />
              <p><b>No bikes to show until it answers.</b> We don't show a copy from our own server instead. It asks again every few seconds by itself.</p>
              {onRetry && <button type="button" className="btn btn-primary" onClick={onRetry}>Try again now</button>}
            </div>
          ) : loaded && shown.length === 0 && (kind || cheap) ? <p className="finder-empty">No bike matches. <button type="button" className="link-btn" onClick={() => { setKind(null); setCheap(false); }}>Show all bikes</button></p>
            : loaded && shown.length === 0 ? <p className="finder-empty">No bike is free right now. Bikes come back on the map when their ride ends.</p> : null}
          <ul ref={list} className="finder-grid" onScroll={onScroll}>
            {shown.map(({ b, d }, i) => (<Fragment key={b.key}>
              {!b.live && i > 0 && shown[i - 1].b.live && (
                <li className="fsplit" aria-hidden={phone ? true : undefined}><p><b>Sample fleet.</b> How the map will look with more owners. These bikes have no recorder and can't be rented.</p></li>
              )}
              {!phone && !b.live && (i === 0 || shown[i - 1].b.live || band(shown[i - 1].d) !== band(d)) && (
                <li className="fgroup"><p>{BAND_NAMES[band(d)]}</p></li>
              )}
              <li data-band={b.live ? "live" : band(d)} data-lead={!b.live && band(d) === "mid" && (i === 0 || band(shown[i - 1].d) !== "mid" || shown[i - 1].b.live) ? "" : undefined}
                style={!b.live && band(d) === "mid" ? { ["--rest" as string]: Math.max(1, Math.min(4, shown.filter((x) => !x.b.live && band(x.d) === "mid").length - 1)) } : undefined} ref={(el) => { if (el) cards.current.set(b.key, el); else cards.current.delete(b.key); }}
                className={`fcard ${b.key === selected ? "is-selected" : ""} ${b.live ? "is-live" : ""}`}
                onMouseEnter={() => setHover(b.key)} onMouseLeave={() => setHover(null)}>
                <button type="button" className="fcard-hit" onClick={() => { select(b.key); if (phone) setSheet("peek"); }} aria-label={`${b.label}, ${b.pricePerHour} dollars an hour, ${distanceText(d)}`}>
                  <span className="fcard-photo"><BikePhoto b={b} /><span className="fcard-badge"><LiveBadge live={b.live} /></span></span>
                  <span className="fcard-body">
                    <span className="fcard-top"><span className="fcard-name">{b.label}</span><span className="fcard-dist">{distanceText(d)} · {walkText(d)}</span></span>
                    <span className="fcard-price"><b>{b.pricePerHour} dollars</b> an hour</span>
                    <BlackBoxLine b={b} />
                  </span>
                </button>
                {b.live && b.objectId !== null && <a className="btn btn-primary btn-sm fcard-rent" href={href(`rent/${b.objectId}`)}>Rent</a>}
              </li>
            </Fragment>))}
          </ul>
        </div>

      </div>

        <div className="finder-map">
          <FleetMap bikes={fleetBikes} center={BOCCONI} me={me} selected={selected} highlight={hover} onSelect={select} padding={padding} />
          <button type="button" className={`map-locate ${me ? "is-on" : ""}`} onClick={onLocate} disabled={locating === "asking"} aria-label={me ? "Recenter on you" : "Show bikes near me"}>
            <i aria-hidden="true" /><span>{locating === "asking" ? "Locating…" : me ? "Recenter" : "Near me"}</span>
          </button>
          <p className="map-legend" aria-hidden="true"><span><i className="lg-live" />Real bike</span><span><i className="lg-drop" />Dropped this week</span></p>
          {current && !phone && (
            <div className="mini" role="dialog" aria-label={current.b.label}>
              <BikePhoto b={current.b} className="mini-photo" />
              <div className="mini-body">
                <p className="mini-name">{current.b.label}</p>
                <p className="mini-meta">{current.b.pricePerHour} dollars an hour, {current.b.deposit} deposit<br />{walkText(current.d)}</p>
                {current.b.live && current.b.objectId !== null
                  ? <div className="mini-actions"><a className="btn btn-primary btn-sm" href={href(`rent/${current.b.objectId}`)}>Rent</a><a className="btn btn-secondary btn-sm" href={href(`object/${current.b.objectId}`)}>See the bike</a></div>
                  : <p className="mini-sample">A sample bike: it has no recorder, so it can't be rented. {live && <button type="button" className="link-btn" onClick={() => select(live.b.key)}>Show the real bike</button>}</p>}
              </div>
              <button type="button" className="mini-close" aria-label="Close" onClick={() => select(null)}>×</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
