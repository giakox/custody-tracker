import { useEffect, useMemo, useState } from "react";
import { useRoute } from "../ui/router";
import { useQuery } from "@tanstack/react-query";
import { getFleet, getObject, listObjects } from "../data/api";
import { useViewer } from "../ui/viewer";
import { SiteHeader } from "../components/SiteHeader";
import { Moments } from "../components/HowItWorks";
import { SiteFooter } from "../components/SiteFooter";
import { Finder } from "../components/Finder";
import type { LatLon } from "../components/FleetMap";
import { RuleSimulator } from "../components/RuleSimulator";
import { BOCCONI } from "../data/mock/fleet";
import { href } from "../ui/router";
import { metres, walkText } from "../ui/geo";
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

/** The rule, playable: drag "how hard it was dropped" and see what comes back (Wise's calculator on its home page). */
function TryTheRule({ objectId }: { objectId: number }) {
  const q = useQuery({ queryKey: ["object", objectId], queryFn: () => getObject(objectId) });
  if (!q.data) return null;
  return (
    <section className="try-rule" aria-labelledby="try-title">
      <div>
        <h2 id="try-title">What if it gets dropped?</h2>
        <p>Try it. This is the rule on the demo bike, and it's the same for everyone who rides it. Nobody can bend it afterwards.</p>
      </div>
      <RuleSimulator terms={q.data.terms} />
    </section>
  );
}

/** Home = the map of bikes free to rent near you, then what Sharify is. */
export function HomePage() {
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const [page] = useRoute();
  // "Find a bike" (#/bikes) opens Home on the finder.
  useEffect(() => { if (page === "bikes") setTimeout(() => document.getElementById("bikes")?.scrollIntoView(), 60); }, [page]);
  const [me, setMe] = useState<Me | null>(null);
  const [locating, setLocating] = useState<"idle" | "asking" | "denied">("idle");
  const origin: LatLon = me ?? BOCCONI;

  const bikes = useMemo(() => (fleet.data ?? [])
    .map((b) => ({ b, d: metres(origin, b) }))
    .sort((x, y) => x.d - y.d), [fleet.data, origin.lat, origin.lon]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = bikes.find((x) => x.b.live);
  const { account } = useViewer();
  const mine = useQuery({ queryKey: ["objects-mine-home", account?.address], enabled: !!account, queryFn: listObjects });
  const rentingIt = !!account && !!mine.data?.some((o) => o.custodian.address.toLowerCase() === account.address.toLowerCase() && o.activeRental);

  const locate = () => {
    if (!("geolocation" in navigator)) { setLocating("denied"); return; }
    setLocating("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }); setLocating("idle"); },
      () => setLocating("denied"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

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
              <a className="btn btn-primary btn-lg" href={href("bikes")}>Find a bike near you</a>
              <a className="btn btn-secondary btn-lg" href={href("add/1")}>Rent out your bike</a>
            </div>
            {live && live.b.objectId !== null && <a className="live-line" href={href(`object/${live.b.objectId}`)}><i aria-hidden="true" />{live.b.label} is free now, {walkText(live.d)} from {me ? "you" : "Bocconi"}</a>}
          </div>
        </section>

        <div id="bikes" className="bikes-anchor" />
        <Finder bikes={bikes} me={me} locating={locating} onLocate={locate} live={live} rentingIt={rentingIt} loaded={!!fleet.data} />

        <Moments />
        {live && live.b.objectId !== null && <TryTheRule objectId={live.b.objectId} />}

        <div className="owners-band">
          <img className="owners-photo" src="./img/day/owner-shop.jpg" alt="A bike shop owner smiling in his doorway, bikes parked outside" loading="lazy" />
          <section className="owners" aria-labelledby="owners-title">
            <div className="owners-copy">
              <h2 id="owners-title">Your bike sits still most of the week.</h2>
              <p>Lend it to people nearby. You set the price, the deposit and what a drop costs; the rule is public before anyone rides.</p>
            </div>
            <Earnings />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
