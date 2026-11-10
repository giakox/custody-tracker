import { href } from "../ui/router";

/** Three steps, same words as the approved wireframe. */
export function HowItWorks() {
  return (
    <section className="block how" aria-labelledby="how-title">
      <div className="block-intro">
        <h2 id="how-title">How it <em>works</em></h2>
        <p><a className="link" href={href("design")}>How Sharify is designed</a></p>
      </div>
      <ol className="how-steps">
        <li><span className="mono how-n">01</span><h3>The bike records.</h3><p>A chip fixed to the frame measures shocks and signs them, so any later edit would show.</p></li>
        <li><span className="mono how-n">02</span><h3>The record is public.</h3><p>Each batch of readings is written to a blockchain that neither you nor the owner controls.</p></li>
        <li><span className="mono how-n">03</span><h3>The deposit settles itself.</h3><p>At the return a contract reads the worst shock of your rental and pays out by the rule you accepted.</p></li>
      </ol>
    </section>
  );
}
