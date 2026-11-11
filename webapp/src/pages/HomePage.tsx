import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFleet, listObjects } from "../data/api";
import { useViewer } from "../ui/viewer";
import { SiteHeader } from "../components/SiteHeader";
import { Moments } from "../components/HowItWorks";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { FleetMap, type LatLon } from "../components/FleetMap";
import { BikeDetail, BikePhoto, BlackBoxLine, LiveBadge } from "../components/BikeCard";
import { BOCCONI } from "../data/mock/fleet";
import { href } from "../ui/router";
import { distanceText, metres, walkText } from "../ui/geo";
import "./object-page.css";
import "./site.css";
import "./map.css";

type Me = LatLon & { accuracy: number };

/** "What could your bike earn?" (Airbnb's host estimator): your price × your hours, nothing invented. */
function Earnings() {
  const [price, setPrice] = useState(2);
  const [hours, setHours] = useState(10);
  const month = Math.round(price * hours * 52 / 12);
  return (
    <div className="own-cta earn">
      <h3>What could your bike earn?</h3>
      <label className="earn-row"><span>Price per hour</span><input type="range" min={1} max={4} step={0.5} value={price} onChange={(e) => setPrice(Number(e.target.value))} /><b className="mono">{price} dollars</b></label>
      <label className="earn-row"><span>Hours rented a week</span><input type="range" min={1} max={40} step={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} /><b className="mono">{hours} h</b></label>
      <p className="earn-out"><span className="mono">≈ {month} dollars</span> a month</p>
      <p className="earn-note">Your price times your hours: an estimate, not a promise. If someone drops your bike, the rule you set decides what you get from their deposit.</p>
      <a className="btn btn-primary" href={href("add/1")}>Rent out your bike</a>
    </div>
  );
}

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
  const { account } = useViewer();
  const mine = useQuery({ queryKey: ["objects-mine-home", account?.address], enabled: !!account, queryFn: listObjects });
  const rentingIt = !!account && !!mine.data?.some((o) => o.custodian.address.toLowerCase() === account.address.toLowerCase() && o.activeRental);
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
        <h2>{bikes.length} bikes free {me ? "near you" : "around Bocconi"}</h2>
        <p className="muted">Nearest first. Bikes out on a ride aren't shown: where they are is where someone is. Prices are in test dollars: no real money moves.</p>
        {!live && fleet.data && <p className="note">{rentingIt ? "You have the live bike right now, so it isn't on the map." : "The live bike is out on a rental right now, so it isn't on the map."}</p>}
      </div>
      <ol>
        {bikes.map(({ b, d }) => (
          <li key={b.key}>
            <button type="button" className={`fleet-row ${b.live ? "is-live" : ""} ${b.key === selected ? "is-selected" : ""}`} onClick={() => select(b.key)}>
              <BikePhoto b={b} className="row-photo" />
              <span className="row-body">
                <span className="row-top"><span className="row-name">{b.label}</span><span className="mono row-dist">{distanceText(d)}</span></span>
                <span className="row-meta"><LiveBadge live={b.live} /><span className="mono">{b.pricePerHour} dollars an hour</span></span>
                <BlackBoxLine b={b} />
              </span>
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
        <section className="welcome" aria-labelledby="home-title">
          <img className="welcome-photo" src="./img/day/hero-navigli.jpg" alt="A woman riding a city bike with a basket along the Naviglio in Milan, smiling" fetchPriority="high" />
          <div className="welcome-card">
            <h1 id="home-title">Borrow a bike from someone nearby.</h1>
            <p>If it gets dropped, a public rule decides what you pay. Not the owner, not us.</p>
            <div className="actions">
              <a className="btn btn-primary btn-lg" href="#bikes" onClick={(e) => { e.preventDefault(); document.getElementById("bikes")?.scrollIntoView({ behavior: "smooth" }); }}>Find a bike near you</a>
              <a className="btn btn-secondary btn-lg" href={href("add/1")}>Rent out your bike</a>
            </div>
          </div>
        </section>

        <div id="bikes" className="bikes-anchor" />
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
              <span><i className="lg-live" />The live bike</span><span><i className="lg-sample" />Sample bikes</span><span><i className="lg-drop" />Dropped this week</span>
            </p>
          </div>
          {!current && view === "map" && (
            // The one bike you can actually rent, one tap away (Lime's "Find Available Scooter").
            <div className="nearest" role="region" aria-label="Nearest bike you can rent">
              {live ? (
                <>
                  <BikePhoto b={live.b} className="nearest-photo" />
                  <button type="button" className="nearest-info" onClick={() => select(live.b.key)}>
                    <span className="nearest-k mono">Nearest · {distanceText(live.d)} · {walkText(live.d)}</span>
                    <span className="nearest-name">{live.b.label}</span>
                    <span className="nearest-meta mono"><LiveBadge live />{live.b.pricePerHour} dollars an hour · deposit {live.b.deposit}</span>
                  </button>
                  <div className="nearest-actions">
                    <a className="btn btn-primary" href={href(`rent/${live.b.objectId}`)}>Rent</a>
                    <button type="button" className="btn btn-secondary nearest-list" onClick={() => setView("list")}>{bikes.length} nearby</button>
                  </div>
                </>
              ) : (
                <button type="button" className="nearest-info" onClick={() => setView("list")}>
                  <span className="nearest-k mono">{rentingIt ? "You have the live bike right now" : "The live bike is out on a rental right now"}</span>
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

        <Moments />

        <section className="owners" aria-labelledby="owners-title">
          <div className="owners-copy">
            <h2 id="owners-title">Your bike sits still most of the week.</h2>
            <p>Lend it to people nearby. You set the price, the deposit and what a drop costs; the rule is public before anyone rides.</p>
          </div>
          <Earnings />
        </section>
      </main>
      <footer className="site-foot">Sharify is a course project at Bocconi (30518). It runs on a test network: no real money moves. <a className="link" href={href("design")}>How Sharify is designed</a></footer>
    </div>
  );
}
