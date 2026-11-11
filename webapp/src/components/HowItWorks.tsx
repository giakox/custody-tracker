import { href } from "../ui/router";

/** A rental in three moments, one photo each. The same band on Home and on the bike page (round 70 merged
 *  the old full-screen chapters and the bike page's text steps into this). */
const MOMENTS = [
  { id: "unlock", img: "./img/day/unlock-phone.jpg", alt: "Hands holding a phone next to a parked city bike",
    title: "Scan the sticker on the frame.", text: "You see the price, the deposit and the rule for drops before you pay anything." },
  { id: "ride", img: "./img/day/friends-ride.jpg", alt: "Two friends riding city bikes down a sunny, tree-lined street", inset: "./img/day/recorder-hand.jpg", insetAlt: "The recorder, a small black box with a blue light, held in a hand",
    title: "Ride. A small box rides along.", text: "It notes every hard knock and seals each note, so nobody can change it afterwards: not you, not the owner, not us." },
  { id: "return", img: "./img/day/return-smile.jpg", alt: "A renter handing a bike back to its owner, both smiling",
    title: "Bring it back. The deposit follows the rule.", text: "When the owner confirms, your deposit comes back by itself: all of it, or minus what the rule says for a drop." },
] as const;

export function Moments({ title = "A rental, in three moments", designLink = false }: { title?: string; designLink?: boolean }) {
  return (
    <section className="moments" aria-labelledby="moments-title">
      <div className="moments-head">
        <h2 id="moments-title">{title}</h2>
        {designLink && <a className="link" href={href("design")}>How Sharify is designed</a>}
      </div>
      <ol className="moments-row">
        {MOMENTS.map((m, i) => (
          <li key={m.id} className="moment">
            <div className="moment-pic">
              <img className="moment-photo" src={m.img} alt={m.alt} loading="lazy" />
              {"inset" in m && <img className="moment-inset" src={m.inset} alt={m.insetAlt} loading="lazy" />}
              <span className="moment-n" aria-hidden="true">{i + 1}</span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
