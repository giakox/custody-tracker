import { useEffect, useState } from "react";
import type { ObjectDetail, Party, Rental } from "../data/types";
import { day, hm, inSentence, TEST_MONEY, when, nameOf, objectName, possessive, shortHex, usd, TIER_NAMES } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import { CASE_IMAGE } from "./ObjectImage";
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
    return <>Offered <T ms={d.pendingHandoff.anchor.at} />. The rental starts when {nameOf(d.pendingHandoff.to)} accepts and leaves a deposit of {usd(d.terms.collateral)}.</>;
  }
  if (d.pendingHandoff) {
    return <>Handed back <T ms={d.pendingHandoff.anchor.at} />. When the owner confirms, the deposit is settled by itself.</>;
  }
  if (d.status === "held-without-deposit") {
    return <>{nameOf(d.custodian)} took the bike but no deposit arrived. Drops are still recorded under {nameOf(d.custodian)}'s name.</>;
  }
  if (r?.current) {
    const c = r.current;
    if (c.peakCg === null || c.tier === 0) return <>Rented <T ms={r.started.at} />, with a deposit of {usd(r.collateral)}. No drops so far: all of it would come back.</>;
    return <>Rented <T ms={r.started.at} />, with a deposit of {usd(r.collateral)}. It was dropped: a <strong className="shock">{TIER_NAMES[c.tier]}</strong> knock, so {usd(c.wouldWithhold)} would be kept.</>;
  }
  const last = d.rentals.filter((x) => x.settlement).at(-1);
  if (last?.settlement) {
    const s = last.settlement;
    return s.tier === 0
      ? <>The last rental, {possessive(last.renter)}, ended <T ms={s.anchor.at} /> with no drops. The whole deposit of {usd(last.collateral)} went back.</>
      : <>The last rental, {possessive(last.renter)}, ended <T ms={s.anchor.at} /> with a <strong className="shock">{TIER_NAMES[s.tier]}</strong> knock. {Number(s.refund) === 0
        ? <>By the rule, the whole {usd(s.fee)} was kept.</>
        : <>By the rule, {usd(s.fee)} was kept and {usd(s.refund)} went back.</>}</>;
  }
  return <>Joined Sharify <T ms={d.created.at} />. Nobody has rented it yet.</>;
}

/** Relative time in sentences ("12 minutes ago"); the clock time is in the tooltip. */
const T = ({ ms }: { ms: number }) => <time dateTime={new Date(ms).toISOString()} title={`${day(ms)}, ${hm(ms)}`}>{when(ms)}</time>;

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
    return <><a className="btn btn-primary" href={href("")}>See free bikes nearby</a><p className="action-note">This one is out on a ride right now.</p></>;
  }
  if (r.isOwner) return <a className="btn btn-secondary" href={href("my-objects")}>Manage</a>;
  return <a className="btn btn-primary" href={href(`rent/${id}`)}>{compact ? "Rent" : "Rent this bike"}</a>;
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
  return `Available · deposit ${usd(d.terms.collateral)}`;
}

/** Keeps the page's one action in reach once the top block has scrolled away (Airbnb's pinned "Reserve"). */
export function StickyAction({ d }: { d: ObjectDetail }) {
  const { account } = useViewer();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".l-book .actions");
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

/** The pictures of this bike and of what renting it looks like; captions say which is which. */
const GALLERY = [
  { src: "./img/day/recorder-hand.jpg", alt: "The recorder, a small black box with one blue light, held next to the bike's frame", cap: "Its recorder" },
  { src: "./img/day/unlock-phone.jpg", alt: "Someone opening the rental on a phone next to a parked bike", cap: "Renting, from your phone" },
];

/** The listing's top: who lends it, where it stands, and the pictures (Airbnb's listing header). */
export function ListingTop({ d }: { d: ObjectDetail }) {
  const { account } = useViewer();
  const owner = d.ownerName ?? shortHex(d.owner.address);
  const tier = d.activeRental?.current?.tier ?? 0;
  const alert = d.status === "rented" && tier > 0;
  return (
    <header className="l-head" aria-labelledby="object-title">
      <p className="l-kicker">{objectName(d)}, lent by {owner}</p>
      <h1 id="object-title"><ViewerTitle d={d} me={account} /></h1>
      <div className="l-gallery">
        <figure className="l-main-photo"><img src={CASE_IMAGE?.src} alt={CASE_IMAGE?.alt ?? ""} fetchPriority="high" /></figure>
        {GALLERY.map((g) => <figure key={g.src}><img src={g.src} alt={g.alt} loading="lazy" /><figcaption>{g.cap}</figcaption></figure>)}
      </div>
      {alert && <p className="sr-only">Shock level of the current rental: {inSentence(d.custodian)}, {TIER_NAMES[tier]}.</p>}
    </header>
  );
}

/** What the page says first, under the pictures: the last thing that happened and the state line. */
export function ListingIntro({ d }: { d: ObjectDetail }) {
  return (
    <section className="l-intro" aria-label="Where it stands">
      <p className="l-summary"><Summary d={d} /></p>
      <StateLine d={d} />
    </section>
  );
}

/** The card that stays beside the story: price, deposit, the one action and the rule (Airbnb's booking card). */
export function BookCard({ d }: { d: ObjectDetail }) {
  const { account } = useViewer();
  return (
    <aside className="l-book" aria-label="Rent it">
      <div className="book-card">
        <p className="book-price"><b>2 dollars</b> an hour</p>
        <p className="book-deposit">{usd(d.terms.collateral)} deposit, back by the rule</p>
        <div className="actions">{<Action d={d} me={account} />}</div>
        <h2 className="book-rule">If it's dropped, this rule decides. Not the owner, not us.</h2>
        <RuleTiers terms={d.terms} highlight={d.activeRental?.current ? d.activeRental.current.tier : undefined} />
        <p className="book-note">The hardest knock of your ride decides how much comes back. {TEST_MONEY}</p>
      </div>
    </aside>
  );
}
