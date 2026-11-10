import { useEffect, useState } from "react";
import type { ObjectDetail, Party, Rental } from "../data/types";
import { hm, inSentence, nameOf, objectName, possessive, shortHex, usd, TIER_NAMES } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import { ObjectImage } from "./ObjectImage";
import { RuleTiers } from "./RuleTiers";
import { StateLine } from "./StateLine";

/** The one italic word is the information: who holds the object, or what is missing. */
function Title({ d }: { d: ObjectDetail }) {
  const name = objectName(d);
  const p = d.pendingHandoff;
  if (p && p.to.role === "owner") return <>{nameOf(p.from)} is handing {objectName(d, false)} <em>back</em>.</>;
  if (p) return <>{name} is being handed to <em>{nameOf(p.to)}</em>.</>;
  if (d.status === "held-without-deposit") return <>{nameOf(d.custodian)} holds {objectName(d, false)} with <em>no deposit</em>.</>;
  if (d.status === "rented") return <>{name} is out with <em>{nameOf(d.custodian)}</em>.</>;
  const last = d.rentals.at(-1);
  return last ? <>{name} is back with its <em>owner</em>.</> : <>{name} is with its <em>owner</em>.</>;
}

function Summary({ d }: { d: ObjectDetail }) {
  const r: Rental | null = d.activeRental;
  if (d.pendingHandoff && d.pendingHandoff.to.role !== "owner") {
    return <>Offered at <T ms={d.pendingHandoff.anchor.at} />. The rental starts when {nameOf(d.pendingHandoff.to)} accepts and leaves the {usd(d.terms.collateral)} deposit.</>;
  }
  if (d.pendingHandoff) {
    return <>Handed back at <T ms={d.pendingHandoff.anchor.at} />. When the owner confirms, the deposit is settled by itself.</>;
  }
  if (d.status === "held-without-deposit") {
    return <>{nameOf(d.custodian)} took the bike but no deposit arrived. Drops are still recorded under {nameOf(d.custodian)}'s name.</>;
  }
  if (r?.current) {
    const c = r.current;
    if (c.peakCg === null || c.tier === 0) return <>Since <T ms={r.started.at} />, with a {usd(r.collateral)} deposit. No drops so far: all of it would come back.</>;
    return <>Since <T ms={r.started.at} />, with a {usd(r.collateral)} deposit. It was dropped: a <strong className="shock">{TIER_NAMES[c.tier]}</strong> knock, so {usd(c.wouldWithhold)} would be kept.</>;
  }
  const last = d.rentals.filter((x) => x.settlement).at(-1);
  if (last?.settlement) {
    const s = last.settlement;
    return s.tier === 0
      ? <>The last rental, {possessive(last.renter)}, ended at <T ms={s.anchor.at} /> with no drops. The whole {usd(last.collateral)} deposit went back.</>
      : <>The last rental, {possessive(last.renter)}, ended at <T ms={s.anchor.at} /> with a <strong className="shock">{TIER_NAMES[s.tier]}</strong> knock. {Number(s.refund) === 0
        ? <>By the rule, the whole {usd(s.fee)} was kept.</>
        : <>By the rule, {usd(s.fee)} was kept and {usd(s.refund)} went back.</>}</>;
  }
  return <>On Sharify since <T ms={d.created.at} />. Nobody has rented it yet.</>;
}

const T = ({ ms }: { ms: number }) => <time dateTime={new Date(ms).toISOString()}>{hm(ms)}</time>;

/** The action at the top depends on who is looking (approved wireframe). */
export function Action({ d, me, compact = false }: { d: ObjectDetail; me: Party | null; compact?: boolean }) {
  const r = relation(d, me);
  const deposit = usd(d.terms.collateral);
  const id = d.id;
  if (r.isOfferedToMe) return <a className="btn btn-primary" href={href(`rent/${id}/deposit`)}>Accept and lock {deposit}</a>;
  if (d.pendingHandoff?.to.role === "owner") {
    if (r.isOwner) return <a className="btn btn-primary" href={href(`confirm-return/${id}`)}>Confirm you have it back</a>;
    if (r.isReturning) return <a className="btn btn-secondary" href={href(`rent/${id}/waiting`)}>See where it stands</a>;
    return null;
  }
  if (d.status === "rented" || d.status === "held-without-deposit") {
    if (r.isCustodian) return <><a className="btn btn-primary" href={href(`rent/${id}/return`)}>Return</a><a className="btn btn-secondary" href={href(`rent/${id}/active`)}>Rental details</a></>;
    if (r.isOwner) return <a className="btn btn-secondary" href={href("my-objects")}>Manage</a>;
    return <p className="action-note">Come back later, or ask the owner for another bike.</p>;
  }
  if (r.isOwner) return <a className="btn btn-secondary" href={href("my-objects")}>Manage</a>;
  return <a className="btn btn-primary" href={href(`rent/${id}`)}>{compact ? "Rent" : <>Rent this bike · {deposit} deposit</>}</a>;
}

/** Title for this viewer: the italic word is who has it, or what is missing. */
function ViewerTitle({ d, me }: { d: ObjectDetail; me: Party | null }) {
  const r = relation(d, me);
  const name = objectName(d);
  if (r.isCustodian && d.status === "rented") return <>{name} is out with <em>you</em>.</>;
  if (r.isOfferedToMe) return <>{name} is waiting for <em>you</em>.</>;
  if (r.isReturning) return <>You're handing {objectName(d, false)} <em>back</em>.</>;
  if (r.isOwner && d.status === "available") return <>{name} is back with <em>you</em>.</>;
  if (d.status === "available") return <>{name} is <em>available</em>.</>;
  return <Title d={d} />;
}

/** One line for the sticky bar: where the bike stands, for this viewer. */
function shortStatus(d: ObjectDetail, me: Party | null) {
  const r = relation(d, me);
  const c = d.activeRental?.current;
  if (r.isCustodian && c) return !c.tier ? "Out with you · no drops so far" : `Out with you · a ${TIER_NAMES[c.tier]} knock`;
  if (d.pendingHandoff?.to.role === "owner") return "Being returned";
  if (d.status === "rented") return `Rented by ${nameOf(d.custodian)}`;
  return `Available · ${usd(d.terms.collateral)} deposit`;
}

/** Keeps the page's one action in reach once the top block has scrolled away (Airbnb's pinned "Reserve"). */
export function StickyAction({ d }: { d: ObjectDetail }) {
  const { account } = useViewer();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".bike-top .actions");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [d.id]);
  return (
    <div className={`sticky-action ${shown ? "is-shown" : ""}`} inert={!shown}>
      <div className="sticky-inner">
        <div className="sticky-text"><span className="sticky-name">{objectName(d)}</span><span className="mono sticky-status">{shortStatus(d, account)}</span></div>
        <div className="sticky-btns"><Action d={d} me={account} compact /></div>
      </div>
    </div>
  );
}

export function Hero({ d }: { d: ObjectDetail }) {
  const { account } = useViewer();
  const tier = d.activeRental?.current?.tier ?? 0;
  const alert = d.status === "rented" && tier > 0;
  const owner = d.ownerName ?? shortHex(d.owner.address);
  return (
    <section className={`hero bike-top tier-glow-${alert ? tier : 0}`} aria-labelledby="object-title">
      <div className="bike-copy">
        <p className="kicker">{objectName(d)}, lent by {owner}</p>
        <h1 id="object-title"><ViewerTitle d={d} me={account} /></h1>
        <p className="hero-summary"><Summary d={d} /></p>
        <div className="actions"><Action d={d} me={account} /></div>
        <div className="rule-card">
          <h2 className="rule-title">If it's dropped, this rule decides. Not the owner, not us.</h2>
          <p className="rule-sub">You leave a {usd(d.terms.collateral)} deposit. The hardest knock of your ride decides how much comes back.</p>
          <RuleTiers terms={d.terms} highlight={d.activeRental?.current ? d.activeRental.current.tier : undefined} />
        </div>
        <StateLine d={d} />
      </div>
      <ObjectImage src="./img/fleet/demo.jpg" alt={`${objectName(d)}, parked in the street`} alert={alert} deviceId={d.deviceId} />
      {alert && <p className="sr-only">Shock level of the current rental: {inSentence(d.custodian)}, {TIER_NAMES[tier]}.</p>}
    </section>
  );
}
