import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFleet, getObject } from "../data/api";
import type { FleetBike } from "../data/types";
import { BOCCONI } from "../data/mock/fleet";
import { metres, walkText } from "../ui/geo";
import { href } from "../ui/router";
import { Button, PhotoCard, SectionHead, StatusPill, scrollBehavior, useReveal } from "./ui";
import { SiteFooterV2, SiteHeaderV2 } from "./SiteChromeV2";
import { bikeLink, bikePhoto } from "./bikes";
import { RULE_NOTE, RuleTry } from "./rule";
import { usd } from "../ui/format";
import "./home.css";

/** Home (v2). Everything is scoped under `.v2`. */

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d={dir === "left" ? "M12.5 4 6.5 10l6 6" : "M7.5 4l6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Horizontal scroll-snap row with dots underneath and arrows (desktop) beside the heading. */
function Carousel({ eyebrow, title, id, children, count }: { eyebrow: string; title: string; id: string; children: ReactNode; count: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const step = () => {
    const t = track.current;
    const first = t?.firstElementChild as HTMLElement | null;
    if (!t || !first) return 0;
    return first.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || "0");
  };
  const sync = () => {
    const t = track.current;
    if (!t) return;
    const s = step();
    const atEnd = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2;
    setActive(atEnd ? count - 1 : s ? Math.round(t.scrollLeft / s) : 0);
    setEdges({ start: t.scrollLeft <= 2, end: atEnd });
  };
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (i: number) => track.current?.scrollTo({ left: i * step(), behavior: scrollBehavior() });
  const by = (d: number) => track.current?.scrollBy({ left: d * step(), behavior: scrollBehavior() });

  return (
    <>
      <SectionHead eyebrow={eyebrow} title={title} id={id}>
        <div className="v2-arrows">
          <button type="button" className="v2-arrow" onClick={() => by(-1)} disabled={edges.start} aria-label="Previous"><Arrow dir="left" /></button>
          <button type="button" className="v2-arrow" onClick={() => by(1)} disabled={edges.end} aria-label="Next"><Arrow dir="right" /></button>
        </div>
      </SectionHead>
      <div className="v2-track" ref={track} onScroll={sync} role="region" aria-label={title} tabIndex={0}
        data-more-left={edges.start ? undefined : ""} data-more-right={edges.end ? undefined : ""}>
        {children}
      </div>
      {count > 1 && (
        <div className="v2-dots" role="group" aria-label={`${title}, position`}>
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" className={`v2-dot${i === active ? " is-active" : ""}`} aria-label={`Go to ${i + 1} of ${count}`} aria-current={i === active} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </>
  );
}

/** The three moments; the deposit amount comes from the demo bike's own terms. */
const steps = (deposit: string | null) => [
  { img: "./img/day/unlock-phone.jpg", title: "Unlock with your phone", text: "Pick a bike on the map and open it from your phone. No keys to swap." },
  { img: "./img/day/recorder-hand.jpg", title: "The box rides along", text: "A small recorder on the frame logs every knock while you ride. Nobody can edit what it writes." },
  { img: "./img/day/return-smile.jpg", title: "Your deposit comes back", text: `Park it and hand it back. When the owner confirms, the rule reads the box: no knocks, ${deposit ? `all ${deposit}` : "the whole deposit"} back.` },
];

export function HomeV2() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  // The demo bike's rule, read from the chain like the old Home did: never hard-coded here.
  const demoId = fleet.data?.find((b) => b.live)?.objectId ?? 1;
  const demo = useQuery({ queryKey: ["object", demoId], queryFn: () => getObject(demoId) });
  const terms = demo.data?.terms;
  const deposit = terms ? usd(terms.collateral) : null;
  const bikes: FleetBike[] = fleet.data ?? [];

  // Arriving from another page's "How it works" link: land on the section.
  useEffect(() => {
    let to: string | null = null;
    try { to = sessionStorage.getItem("v2-scroll-to"); sessionStorage.removeItem("v2-scroll-to"); } catch { /* storage blocked */ }
    if (to) { const id = to; setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "auto" }), 60); }
  }, []);

  return (
    <div className="v2" ref={root}>
      {/* 1. First screen */}
      <section className="v2-hero">
        <picture>
          <source media="(max-width: 767px)" srcSet="./img/day/hero-bocconi-phone.jpg" width="1170" height="2532" />
          <img className="v2-hero-img" src="./img/day/hero-bocconi.jpg" alt="The Bocconi building on via Röntgen, Milan" width="2880" height="1620" fetchPriority="high" />
        </picture>
        <div className="v2-hero-veil" aria-hidden="true" />
        <div className="v2-hero-veil-top" aria-hidden="true" />
        <SiteHeaderV2 variant="overlay" />
        <div className="v2-container v2-hero-content">
          <h1 className="v2-h1">Borrow the bike next door.</h1>
          <p className="v2-lead">Bikes from people near Bocconi. Every drop is recorded, so your deposit comes back fair.</p>
          <div className="v2-hero-actions">
            <Button href={href("bikes")}>Find a bike</Button>
            <Button variant="secondary" onDark href={href("add")}>Rent out your bike</Button>
          </div>
        </div>
      </section>

      {/* 2. Bikes near Bocconi */}
      <section className="v2-band v2-band-white" aria-labelledby="v2-bikes">
        <div className="v2-container v2-reveal">
          {fleet.isError ? (
            <>
              <SectionHead eyebrow="Near you" title="Bikes near Bocconi" id="v2-bikes" />
              <p className="v2-body v2-muted v2-gap-24">The bikes could not load. Try again in a moment.</p>
            </>
          ) : (
            <Carousel eyebrow="Near you" title="Bikes near Bocconi" id="v2-bikes" count={bikes.length}>
              {bikes.length
                ? bikes.map((b) => (
                    <PhotoCard key={b.key} img={bikePhoto(b)} href={bikeLink(b)} badge={b.live ? <StatusPill tone="live">Live</StatusPill> : undefined}>
                      <h3 className="v2-h3">{b.label}</h3>
                      <p className="v2-body v2-muted">{walkText(metres(BOCCONI, b))}</p>
                      <p className="v2-body">{b.pricePerHour} dollars an hour</p>
                    </PhotoCard>
                  ))
                : [0, 1, 2].map((i) => <div className="v2-card" key={i} aria-hidden="true"><div className="v2-card-photo" /></div>)}
            </Carousel>
          )}
        </div>
      </section>

      {/* 3. How it works */}
      <section className="v2-band v2-band-dark" id="how" aria-labelledby="v2-how">
        <div className="v2-container v2-reveal">
          <SectionHead eyebrow="How it works" title="Three taps, one fair deposit." id="v2-how" />
          <div className="v2-steps">
            {steps(deposit).map((s) => (
              <PhotoCard key={s.title} img={s.img}>
                <h3 className="v2-h3">{s.title}</h3>
                <p className="v2-body v2-on-dark-muted">{s.text}</p>
              </PhotoCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The box: heading and lead on one row, then the photo (with the note under it) beside the live rule. */}
      <section className="v2-band v2-band-white" id="box" aria-labelledby="v2-box">
        <div className="v2-container v2-reveal">
          <div className="v2-grid v2-box-head">
            <div className="v2-box-title"><SectionHead eyebrow="The box" title="It feels every knock." id="v2-box" /></div>
            <p className="v2-box-lead v2-muted">A small box under the frame measures every knock. The contract keeps part of the {terms ? `${Number(terms.collateral)}\u2011dollar ` : ""}deposit only above these lines.</p>
          </div>
          <div className="v2-grid v2-box-body">
            <figure className="v2-box-media">
              <div className="v2-tile">
                <img src="./img/recorder-closeup.jpg" alt="The recorder, a small black box strapped to a bike frame" loading="lazy" width="1216" height="832" />
              </div>
              {terms && <figcaption className="v2-small v2-muted">{RULE_NOTE}</figcaption>}
            </figure>
            <div className="v2-box-rule">{terms ? <RuleTry terms={terms} id="home-try" grid note={false} /> : <div className="v2-skel-rule" aria-hidden="true" />}</div>
          </div>
        </div>
      </section>

      {/* 5. Rent out your bike */}
      <section className="v2-band v2-band-white" aria-labelledby="v2-own">
        <div className="v2-container v2-grid v2-split v2-reveal">
          <div className="v2-split-media">
            <div className="v2-card-photo v2-tall">
              <img src="./img/day/owner-shop.jpg" alt="A bike shop owner standing in his doorway, bikes parked outside" loading="lazy" width="1216" height="832" />
            </div>
          </div>
          <div className="v2-split-text">
            <SectionHead eyebrow="Rent out your bike" title="Your bike earns while you study." id="v2-own"
              lead="List it in a few minutes and set your hourly price. Every renter leaves a deposit, and the box keeps the record." />
            <div className="v2-own-cta"><Button href={href("add")}>Rent out your bike</Button></div>
          </div>
        </div>
      </section>

      <SiteFooterV2 />
    </div>
  );
}
