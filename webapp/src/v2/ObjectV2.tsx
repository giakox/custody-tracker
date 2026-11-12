import { useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFleet, getNetwork, getObject, getStatus } from "../data/api";
import { DataError, type NetworkInfo, type ObjectDetail, type SourceStatus } from "../data/types";
import { BOCCONI } from "../data/mock/fleet";
import { FleetMap } from "../components/FleetMap";
import { Action, GALLERY, Summary, ViewerTitle } from "./action";
import { CASE_IMAGE } from "./caseImage";
import { StateLine } from "./StateLine";
import { addressUrl, ago, day, g, hm, hms, nameOf, objectName, possessive, shortHex, TIER_NAMES, txUrl, usd, whenShort } from "../ui/format";
import { distanceText, metres, walkText } from "../ui/geo";
import { href } from "../ui/router";
import { buildStory, tierOf } from "../ui/story";
import { useViewer } from "../ui/viewer";
import { Button, StatusPill, scrollBehavior, useBarSpace } from "./ui";
import { SiteFooterV2, SiteHeaderV2 } from "./SiteChromeV2";
import { KnockList, knockRows } from "./rule";
import "./object.css";

/** The bike's page (v2). Same queries, actions and links as the old ObjectPage.tsx (removed in lotto 5, see git history); only the look is new. */

const PHOTOS = [
  ...(CASE_IMAGE ? [{ src: CASE_IMAGE.src, alt: CASE_IMAGE.alt, cap: null as string | null }] : []),
  ...GALLERY.map((x) => ({ src: x.src, alt: x.alt, cap: x.cap as string | null })),
];

/** The deposit in one sentence, from this bike's own terms (the demo: 50 dollars, light from 8 g). */
const depositLine = (d: ObjectDetail) =>
  `${usd(d.terms.collateral)} deposit. All of it comes back unless the box records a knock of ${Math.round(d.terms.lightCg) / 100} g or more.`;

function Section({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="v2-obj-section" aria-labelledby={id}>
      <h2 className="v2-h3" id={id}>{title}</h2>
      <div className="v2-obj-section-body">{children}</div>
    </section>
  );
}

/** Desktop: one large photo (8 columns) and two stacked (4). Phone: edge to edge, swiped, with dots. */
function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => { const t = track.current; if (t) setActive(Math.round(t.scrollLeft / t.clientWidth)); };
  const go = (i: number) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: scrollBehavior() });
  return (
    <div className={`v2-gallery${PHOTOS.length === 1 ? " is-single" : ""}`}>
      <div className="v2-gallery-track" ref={track} onScroll={onScroll} role="region" aria-label="Photos" tabIndex={0}>
        {PHOTOS.map((p, i) => (
          <figure key={p.src} className="v2-gallery-item">
            <img src={p.src} alt={p.alt} fetchPriority={i === 0 ? "high" : undefined} loading={i === 0 ? undefined : "lazy"} />
            {p.cap && <figcaption><StatusPill tone="onPhoto">{p.cap}</StatusPill></figcaption>}
          </figure>
        ))}
      </div>
      {PHOTOS.length > 1 && (
        <div className="v2-gallery-dots" role="group" aria-label="Photo">
          {PHOTOS.map((p, i) => <button key={p.src} type="button" className={`v2-dot${i === active ? " is-active" : ""}`} aria-label={`Photo ${i + 1} of ${PHOTOS.length}`} aria-current={i === active} onClick={() => go(i)} />)}
        </div>
      )}
    </div>
  );
}

/** "What the box recorded": one clean row per rental (or stretch where something happened), newest first. */
function Record({ d }: { d: ObjectDetail }) {
  const chapters = buildStory(d).filter((c) => c.isRental || c.events.some((e) => e.kind !== "registered"));
  return (
    <>
      <ol className="v2-rec">
        {chapters.map((c) => {
          const live = c.isRental && c.end === null;
          const who = c.isRental ? `${possessive(c.custodian)} rental` : c.custodian.role === "owner" ? "With the owner" : `With ${nameOf(c.custodian)}`;
          const settledEv = c.events.find((e) => e.kind === "settled");
          const tier = c.maxPeakCg === null ? 0 : tierOf(d, c.maxPeakCg);
          const outcome = settledEv && settledEv.kind === "settled"
            ? (settledEv.tier === 0 ? `all ${usd(settledEv.refund)} back` : `${usd(settledEv.fee)} kept`)
            : live ? "riding now" : null;
          const gap = c.events.find((e) => e.kind === "gap");
          return (
            <li className="v2-rec-row" key={c.period}>
              <div className="v2-rec-main">
                <p className="v2-rec-who">{live && <StatusPill tone="live">Live</StatusPill>}{who}</p>
                <p className="v2-small v2-muted">
                  <time dateTime={new Date(c.start).toISOString()} title={`${day(c.start)}, ${hm(c.start)}`}>{whenShort(c.start)}</time>
                  {outcome && <> · <span className="v2-nowrap">{outcome}</span></>}
                </p>
                {gap && gap.kind === "gap" && <p className="v2-small v2-muted">{gap.missing === 1 ? "1 page missing" : `${gap.missing} pages missing`}</p>}
              </div>
              <p className="v2-rec-peak">
                {c.maxPeakCg === null ? <span className="v2-muted">No readings</span> : <><span className="v2-rec-g">{g(c.maxPeakCg)}</span><span className="v2-muted">{tier === 0 ? "no knock" : `${TIER_NAMES[tier]} knock`}</span></>}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="v2-small v2-muted">A knock is what the box felt, not proof of damage.</p>
    </>
  );
}

/** Where the bike waits. Only while it is free: a rented bike's position is never shown. */
function Parked({ d }: { d: ObjectDetail }) {
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const b = fleet.data?.find((x) => x.objectId === d.id);
  if (!b || d.status !== "available") return <p className="v2-body v2-muted">It's out on a ride, so it isn't on the map.</p>;
  return (
    <>
      <div className="v2-obj-map"><FleetMap bikes={[b]} center={b} me={null} selected={b.key} onSelect={() => {}} padding={{ top: 12, bottom: 12, left: 0 }} /></div>
      <p className="v2-body"><span className="v2-strong">Outside Bocconi</span> <span className="v2-muted">· {walkText(metres(BOCCONI, b))}. Hidden while it's out on a ride.</span></p>
    </>
  );
}

/** On-chain links, as text: each knock's reading, the contracts, and every batch behind a tap. */
function Verify({ d, net, status, updatedAt }: { d: ObjectDetail; net: NetworkInfo; status?: SourceStatus; updatedAt?: number }) {
  const shocks = buildStory(d).flatMap((c) => c.events).filter((e) => e.kind === "shock") as Extract<ReturnType<typeof buildStory>[number]["events"][number], { kind: "shock" }>[];
  const link = (label: string, a: string) => {
    const url = addressUrl(net.explorer, a);
    return <li key={label}>{label}: {url ? <a className="v2-textlink" href={url} target="_blank" rel="noreferrer">{shortHex(a, 6, 4)}</a> : shortHex(a, 6, 4)}</li>;
  };
  const rows = [...d.batches].reverse();
  return (
    <>
      <p className="v2-body v2-muted">Everything above is read from two public contracts on {net.label}. No server of ours can rewrite it.{status?.relayer === "offline" && " The relayer is offline: the map and the per-reading proofs are unavailable for now."}</p>
      {shocks.length > 0 && (
        <ul className="v2-obj-links">
          {shocks.map((e) => <li key={e.seq}><a className="v2-textlink" href={href(`verify/${d.id}/${e.seq}`)}>Check the {TIER_NAMES[e.tier]} knock of {day(e.at.at)} ({g(e.peakCg)}, batch {e.seq})</a></li>)}
        </ul>
      )}
      <ul className="v2-obj-links">
        {link("Custody log", net.contracts.custodyLog)}
        {link("Rental escrow", net.contracts.escrow)}
        {link("Collateral token", net.contracts.token)}
        <li className="v2-muted">Read from {net.label}{updatedAt ? `, ${ago(updatedAt)}` : ""}{status?.chain === "unreachable" ? " (not answering right now)" : ""}</li>
      </ul>
      <details className="v2-obj-batches">
        <summary className="v2-textlink">Every batch the box signed ({rows.length})</summary>
        <ol>
          {rows.map((b) => {
            const url = txUrl(net.explorer, b.anchor.tx);
            const t = tierOf(d, b.maxPeakCg);
            return (
              <li key={b.seq} id={`batch-${b.seq}`} className="v2-batch">
                <span>Batch {b.seq}</span>
                <span className="v2-muted"><time dateTime={new Date(b.anchor.at).toISOString()}>{hms(b.anchor.at)}</time> · {nameOf(b.custodian)}{b.recordedBeforeHandoff && " · recorded before the return"}</span>
                <span>{g(b.maxPeakCg)}{t > 0 && <span className="v2-muted"> {TIER_NAMES[t]}</span>}</span>
                <span>{url ? <a className="v2-textlink" href={url} target="_blank" rel="noreferrer">{shortHex(b.anchor.tx)}</a> : shortHex(b.anchor.tx)}</span>
              </li>
            );
          })}
          {d.gaps.map((x) => { const from = x.after + 1, to = x.before - 1; return <li key={`gap-${x.after}`} className="v2-batch v2-muted"><span>Batch {from === to ? from : `${from}–${to}`}</span><span>{x.missing === 1 ? "1 batch" : `${x.missing} batches`} missing from the record</span></li>; })}
        </ol>
      </details>
    </>
  );
}

function Message({ title, children, actions }: { title: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="v2-container v2-obj-message" aria-live="polite">
      <h1 className="v2-h2">{title}</h1>
      <p className="v2-lead v2-muted v2-gap-16">{children}</p>
      {actions && <div className="v2-obj-message-actions">{actions}</div>}
    </section>
  );
}

export function ObjectV2({ id }: { id: number }) {
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const status = useQuery({ queryKey: ["status"], queryFn: getStatus, refetchInterval: 4_000 });
  const obj = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000, retry: 1 });
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const err = obj.error instanceof DataError ? obj.error : null;
  const { account } = useViewer();
  const rentbar = useRef<HTMLDivElement>(null);
  useBarSpace(rentbar);

  let body: ReactNode;
  if (obj.data && net.data) {
    const d = obj.data;
    const owner = d.ownerName ?? shortHex(d.owner.address);
    const parked = fleet.data?.find((x) => x.objectId === d.id);
    const m = parked ? metres(BOCCONI, parked) : null;
    const moving = d.status !== "available" || !!d.pendingHandoff;
    const done = d.rentals.filter((r) => r.settlement);
    const knocked = done.filter((r) => r.settlement!.tier > 0).length;
    const priceHour = "2";
    body = (
      <>
        <div className="v2-container v2-obj">
          <a className="v2-obj-back v2-link-quiet" href={href("bikes")}>← All bikes</a>
          <h1 className="v2-h2 v2-obj-title">{objectName(d)}</h1>
          <p className="v2-body v2-muted">{m !== null && <>{distanceText(m)} from Bocconi · {walkText(m)} · </>}Lent by {owner}</p>
          <div className="v2-obj-gallery"><Gallery /></div>

          <div className="v2-obj-body">
            <div className="v2-obj-main">
              {moving && (
                <section className="v2-obj-now" aria-label="Where it stands">
                  <p className="v2-lead"><ViewerTitle d={d} me={account} /></p>
                  <p className="v2-body v2-muted v2-gap-8"><Summary d={d} /></p>
                  <div className="v2-gap-16 v2-obj-stateline"><StateLine d={d} /></div>
                </section>
              )}
              <dl className="v2-keyfacts" aria-label="At a glance">
                <div><dt>Price</dt><dd>{usd(priceHour)}<span>an hour</span></dd></div>
                <div><dt>Deposit</dt><dd>{usd(d.terms.collateral)}</dd></div>
                <div><dt>Rentals</dt><dd>{done.length}<span>{knocked === 0 ? "no drops" : `${knocked} ${knocked === 1 ? "knock" : "knocks"}`}</span></dd></div>
              </dl>
              <Section title="The rule" id="obj-deposit">
                <p className="v2-body v2-muted">The hardest knock of your ride decides how much of the deposit comes back. Not the owner, not us.</p>
                <KnockList rows={knockRows(d.terms)} className="v2-knocks-grid" />
              </Section>
              <Section title="What the box recorded" id="obj-record"><Record d={d} /></Section>
              <Section title="Where it is" id="obj-where"><Parked d={d} /></Section>
              <Section title="Check it yourself" id="obj-verify"><Verify d={d} net={net.data} status={status.data} updatedAt={obj.dataUpdatedAt || undefined} /></Section>
            </div>

            <aside className="v2-obj-aside" aria-label="Rent it">
              <div className="v2-book">
                <p className="v2-book-price"><span className="v2-book-amount">2 dollars</span> an hour</p>
                <p className="v2-body v2-muted v2-gap-8">{depositLine(d)}</p>
                <div className="v2-book-actions"><Action d={d} me={account} /></div>
              </div>
            </aside>
          </div>
        </div>
        <div className="v2-rentbar" ref={rentbar} role="region" aria-label="Rent it">
          <p className="v2-rentbar-price"><span className="v2-strong">2 dollars</span> an hour<span className="v2-rentbar-sub">{usd(d.terms.collateral)} deposit, back by the rule</span></p>
          <div className="v2-rentbar-actions"><Action d={d} me={account} compact /></div>
        </div>
      </>
    );
  } else if (err?.code === "not-found") {
    body = <Message title={<>There is no bike number {id} here.</>} actions={<><Button href={href("bikes")}>See the bikes on the map</Button><Button variant="secondary" href={href("object/1")}>Open the demo bike</Button></>}>Check the number on the recorder's label, or open the page from its QR code.</Message>;
  } else if (obj.isError) {
    body = (
      <Message title="The blockchain is not answering."
        actions={<><Button onClick={() => obj.refetch()} disabled={obj.isFetching}>{obj.isFetching ? "Asking again…" : "Try again now"}</Button><Button variant="secondary" href={href("design")}>Why we don't show a copy</Button></>}>
        This page shows only what the chain says, and we won't show a copy from our own server instead. It asks again every few seconds by itself.
      </Message>
    );
  } else {
    body = (
      <div className="v2-container v2-obj" aria-busy="true" aria-label="Loading the bike from the blockchain">
        <div className="v2-skel v2-skel-title" /><div className="v2-skel v2-skel-gallery" />
      </div>
    );
  }

  return (
    <div className="v2 v2-object-page">
      <SiteHeaderV2 variant="solid" />
      <main>{body}</main>
      <SiteFooterV2 />
    </div>
  );
}
