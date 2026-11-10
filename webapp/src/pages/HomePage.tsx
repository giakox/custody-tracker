import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFleet } from "../data/api";
import { SiteHeader } from "../components/SiteHeader";
import { HowItWorks } from "../components/HowItWorks";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { FleetMap, type LatLon } from "../components/FleetMap";
import { BikeDetail, BlackBoxLine, LiveBadge } from "../components/BikeCard";
import { BOCCONI } from "../data/mock/fleet";
import { href } from "../ui/router";
import { distanceText, metres, walkText } from "../ui/geo";
import "./object-page.css";
import "./site.css";
import "./map.css";

type Me = LatLon & { accuracy: number };

/** Home = the map of bikes free to rent near you, then what Sharify is. */
export function HomePage() {
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const [me, setMe] = useState<Me | null>(null);
  const [locating, setLocating] = useState<"idle" | "asking" | "denied">("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const origin: LatLon = me ?? BOCCONI;

  const bikes = useMemo(() => (fleet.data ?? [])
    .map((b) => ({ b, d: metres(origin, b) }))
    .sort((x, y) => x.d - y.d), [fleet.data, origin.lat, origin.lon]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = bikes.find((x) => x.b.live);
  const current = bikes.find((x) => x.b.key === selected) ?? null;
  const fleetBikes = useMemo(() => bikes.map((x) => x.b), [bikes]);
  // Room taken by the buttons (top), the legend or bottom strip: the first framing keeps pins clear of them.
  const padding = useMemo(() => (window.matchMedia("(max-width: 760px)").matches ? { top: 64, bottom: 140, left: 0, sheet: 0.66 } : { top: 64, bottom: 130, left: 0 }), []);
  const select = useCallback((k: string | null) => { setSelected(k); if (k) setView("map"); }, []);

  const locate = () => {
    if (!("geolocation" in navigator)) { setLocating("denied"); return; }
    setLocating("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }); setLocating("idle"); },
      () => setLocating("denied"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const list = (
    <div className="fleet-list">
      <div className="fleet-list-head">
        <h1>{bikes.length} bikes free {me ? <>near <em>you</em></> : <>around <em>Bocconi</em></>}</h1>
        <p className="muted">Nearest first. Only free, parked bikes are shown: a rented bike's position would be its renter's.</p>
        {!live && fleet.data && <p className="note">The live bike is out on a rental right now, so it isn't on the map.</p>}
      </div>
      <ol>
        {bikes.map(({ b, d }) => (
          <li key={b.key}>
            <button type="button" className={`fleet-row ${b.live ? "is-live" : ""} ${b.key === selected ? "is-selected" : ""}`} onClick={() => select(b.key)}>
              <span className="row-top"><span className="row-name">{b.label}</span><span className="mono row-dist">{distanceText(d)}</span></span>
              <span className="row-meta"><LiveBadge live={b.live} /><span className="mono">{b.pricePerHour} dUSD/h · deposit {b.deposit}</span></span>
              <BlackBoxLine b={b} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="page">
      <SiteHeader />
      <main>
        <section className={`map-shell view-${view} ${current ? "has-selection" : ""}`} aria-label="Bikes near you">
          <aside className="map-panel">
            {current
              ? <BikeDetail b={current.b} distance={current.d} onClose={() => setSelected(null)} onShowLive={live ? () => select(live.b.key) : null} />
              : list}
          </aside>
          <div className="map-area">
            <FleetMap bikes={fleetBikes} center={origin} me={me} selected={selected} onSelect={select} padding={padding} />
            <div className="map-tools">
              <button type="button" className="map-btn mono" onClick={locate} disabled={locating === "asking"}>
                {locating === "asking" ? "Locating…" : me ? "Recenter on me" : "Use my location"}
              </button>
              {view === "list" && <button type="button" className="map-btn mono view-toggle" onClick={() => setView("map")}>Map</button>}
              <DemoSwitcher inline />
            </div>
            {locating === "denied" && <p className="map-msg mono" role="status">Location unavailable: showing bikes around Bocconi.</p>}
            <p className="map-legend mono" aria-hidden="true">
              <span><i className="lg-live" />Live bike, on-chain</span><span><i className="lg-sample" />Sample fleet</span><span><i className="lg-drop" />Dropped in the last 7 days</span>
            </p>
          </div>
          {!current && view === "map" && (
            // The one bike you can actually rent, one tap away (Lime's "Find Available Scooter").
            <div className="nearest" role="region" aria-label="Nearest bike you can rent">
              {live ? (
                <>
                  <button type="button" className="nearest-info" onClick={() => select(live.b.key)}>
                    <span className="nearest-k mono">Nearest · {distanceText(live.d)} · {walkText(live.d)}</span>
                    <span className="nearest-name">{live.b.label}</span>
                    <span className="nearest-meta mono"><LiveBadge live />{live.b.pricePerHour} dUSD/h · deposit {live.b.deposit}</span>
                  </button>
                  <div className="nearest-actions">
                    <a className="btn btn-primary" href={href(`rent/${live.b.objectId}`)}>Rent</a>
                    <button type="button" className="btn btn-secondary nearest-list" onClick={() => setView("list")}>{bikes.length} nearby</button>
                  </div>
                </>
              ) : (
                <button type="button" className="nearest-info" onClick={() => setView("list")}>
                  <span className="nearest-k mono">The live bike is out on a rental right now</span>
                  <span className="nearest-name">{bikes.length} sample bikes nearby</span>
                </button>
              )}
            </div>
          )}
          {current && (
            <div className="sheet" role="dialog" aria-label={current.b.label}>
              <BikeDetail b={current.b} distance={current.d} onClose={() => setSelected(null)} onShowLive={live ? () => select(live.b.key) : null} />
            </div>
          )}
        </section>

        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-copy">
            <h2 id="home-title" className="home-title">Rent things without arguing about <em>damage</em>.</h2>
            <p className="lead">A small recorder on the bike signs every shock it feels. The deposit sits in a public contract and comes back on its own: all of it, or minus a fee if the bike was dropped during your rental.</p>
          </div>
          <div className="own-cta">
            <h3>Rent out your bike</h3>
            <p>Fix a recorder to it, set your deposit and your rules, print the QR. Renters pay damage by rule, not by argument.</p>
            <a className="btn btn-primary" href={href("add/1")}>Rent out your bike</a>
          </div>
        </section>
        <HowItWorks />
      </main>
      <footer className="site-foot mono">Sharify · course project, Bocconi 30518 · test network only</footer>
    </div>
  );
}
