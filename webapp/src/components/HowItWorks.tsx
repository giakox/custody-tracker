import { href } from "../ui/router";

/** The rental as a story in three chapters: a big photo each, a card that rises over it, the movement driven by the scroll. */
const CHAPTERS = [
  { id: "unlock", img: "./img/day/unlock-phone.jpg", alt: "Hands holding a phone next to a parked city bike", side: "right",
    title: "Scan the sticker on the frame.", text: "You see the price, the deposit and the rule for drops before you pay anything." },
  { id: "ride", img: "./img/day/friends-ride.jpg", alt: "Two friends riding city bikes down a sunny, tree-lined street", side: "left", inset: "./img/day/recorder-hand.jpg", insetAlt: "The recorder, a small black box with a blue light, held in a hand",
    title: "Ride. A small box rides along.", text: "It notes every hard knock and seals each note, so nobody can change it afterwards: not you, not the owner, not us." },
  { id: "return", img: "./img/day/return-smile.jpg", alt: "A renter handing a bike back to its owner, both smiling", side: "right",
    title: "Bring it back. The deposit follows the rule.", text: "When the owner confirms, your deposit comes back by itself: all of it, or minus what the rule says for a drop." },
] as const;

export function Moments() {
  return (
    <section className="chapters" aria-label="A rental, from start to finish">
      {CHAPTERS.map((c) => (
        <article key={c.id} className={`chapter chapter-${c.side}`}>
          <div className="chapter-photo">
            <img src={c.img} alt={c.alt} loading="lazy" />
            {"inset" in c && <img className="chapter-inset" src={c.inset} alt={c.insetAlt} loading="lazy" />}
          </div>
          <div className="chapter-card">
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

/** Short version for the bike page. */
export function HowItWorks() {
  return (
    <section className="block how" aria-labelledby="how-title">
      <div className="block-intro">
        <h2 id="how-title">How it works</h2>
        <p><a className="link" href={href("design")}>How Sharify is designed</a></p>
      </div>
      <ol className="how-steps">
        <li><span className="how-n">1</span><h3>The bike keeps a diary.</h3><p>A small box on the frame notes every hard knock and seals it, so a later edit would show.</p></li>
        <li><span className="how-n">2</span><h3>The diary is public.</h3><p>It's kept where neither you nor the owner can rewrite it, and anyone can check it.</p></li>
        <li><span className="how-n">3</span><h3>The deposit follows the rule.</h3><p>At the return, the worst knock of your rental decides what comes back. No one argues; the rule was public before you rode.</p></li>
      </ol>
    </section>
  );
}
