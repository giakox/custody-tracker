// Moved from src/components/Hero.tsx (lotto 5): the viewer-dependent title, summary and action of a bike,
// unchanged. The v2 bike page and the CSS in object.css draw them.
import type { ObjectDetail, Party, Rental } from "../data/types";
import { day, hm, when, nameOf, objectName, possessive, usd, TIER_NAMES } from "../ui/format";
import { href } from "../ui/router";
import { relation } from "../ui/viewer";

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

export function Summary({ d }: { d: ObjectDetail }) {
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
export function ViewerTitle({ d, me }: { d: ObjectDetail; me: Party | null }) {
  const r = relation(d, me);
  const name = objectName(d);
  if (r.isCustodian && d.status === "rented") return <>{name} is out with <em>you</em>.</>;
  if (r.isOfferedToMe) return <>{name} is waiting for <em>you</em>.</>;
  if (r.isReturning) return <>You're handing {objectName(d, false)} <em>back</em>.</>;
  if (r.isOwner && d.status === "available") return <>{name} is back with <em>you</em>.</>;
  if (d.status === "available") return <>{name} is <em>available</em>.</>;
  return <Title d={d} />;
}

/** The pictures of this bike and of what renting it looks like; captions say which is which. */
export const GALLERY = [
  { src: "./img/day/recorder-hand.jpg", alt: "The recorder, a small black box with one blue light, held next to the bike's frame", cap: "Its recorder" },
  { src: "./img/day/unlock-phone.jpg", alt: "Someone opening the rental on a phone next to a parked bike", cap: "Renting, from your phone" },
];

