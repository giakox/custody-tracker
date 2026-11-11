import { href } from "../ui/router";

/** The three moments of a rental, told with photos (Home). Plain words; the proof lives elsewhere. */
export function Moments() {
  return (
    <section className="moments" aria-labelledby="moments-title">
      <h2 id="moments-title">A rental, from start to finish</h2>
      <ol>
        <li>
          <img src="./img/day/unlock-phone.jpg" alt="Hands holding a phone next to a parked city bike" loading="lazy" />
          <h3>Scan the sticker on the bike.</h3>
          <p>You see the price, the deposit and the rule for drops before you pay anything.</p>
        </li>
        <li>
          <img src="./img/day/recorder-hand.jpg" alt="A hand holding the Sharify recorder, a small black box with a blue light, next to a bike" loading="lazy" />
          <h3>Ride. A small box rides along.</h3>
          <p>It notes every hard knock and seals each note, so nobody can change it afterwards: not you, not the owner, not us.</p>
        </li>
        <li>
          <img src="./img/day/return-smile.jpg" alt="A young woman hands a bike back to its owner, both smiling, outside a bike shop" loading="lazy" />
          <h3>Bring it back.</h3>
          <p>When the owner confirms it's back, your deposit comes back by itself: all of it, or minus what the rule says for a drop.</p>
        </li>
      </ol>
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
