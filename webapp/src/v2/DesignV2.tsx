// How Sharify is designed (v2): the logical scheme for the professors, readable when projected.
// Rebuilt from the old DesignPage.tsx (git HEAD): same structure, sections, contents and contents-list logic;
// only the look is v2 (design.css here maps the old blocks onto the v2 tokens).
// Content is the approved wireframe's (src/wireframes/SystemDiagram.tsx is the single source of the scheme).
import { useEffect, useState } from "react";
import { LIMITS, STAGES } from "../wireframes/SystemDiagram";
import { PageV2 } from "./lists";
import "./design.css";

const TEST = [
  { q: "Do we need shared state?", a: "Yes: the object's history and who had it.", yes: true },
  { q: "Are there several writers?", a: "Yes: the object, the owner, the renters; later insurers and buyers.", yes: true },
  { q: "Is there a third party everyone trusts and that is always online?", a: "No: whoever runs the database is a party to the dispute, or becomes the new point of trust.", yes: false },
  { q: "Do the writers trust each other?", a: "No: they disagree about who caused the damage.", yes: false },
  { q: "Is public verification needed?", a: "Yes: surveyors, judges, future buyers.", yes: true },
];

const OBJECTIONS = [
  { q: "Why not one database shared by the rental companies?", a: "That is a consortium: it works only while members trust whoever runs it. It leaves out the renter, it can't hold the deposit, and it disappears with the consortium." },
  { q: "Why not a digital notary or a timestamping service?", a: "It proves when something was written, not that nothing was left out. It is still one intermediary, and it can't hold the deposit." },
  { q: "Isn't a blockchain slow and expensive?", a: "On Base, an Ethereum layer 2, one batch of 16 readings costs about 145,000 gas: under 0.000001 ETH on the test network, a fraction of a cent. Only a fingerprint goes on-chain, not the data. Testnet prices are an order of magnitude, not a quote." },
];

const NUMBERS = [
  { v: "1600", u: "/s", l: "accelerometer samples; the peak of each second is kept" },
  { v: "±200", u: "g", l: "full scale on each axis" },
  { v: "16", u: "", l: "readings in each batch the chip signs" },
  { v: "~145k", u: "gas", l: "to anchor one batch, measured on Base Sepolia" },
];

const TOC = [
  { id: "one", label: "In one minute" },
  { id: "numbers", label: "The numbers" },
  { id: "scheme", label: "Step by step" },
  { id: "test", label: "Do we need a blockchain?" },
  { id: "questions", label: "Questions and limits" },
];

/** Which section is in view, for the contents on the left (Stripe's docs). */
function useSpy(ids: string[]) {
  const [on, setOn] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
      if (vis) setOn(vis.target.id);
    }, { rootMargin: "-30% 0px -60% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return on;
}

const ids = TOC.map((t) => t.id);

export function DesignV2() {
  const on = useSpy(ids);
  useEffect(() => { document.querySelector(`.d-toc a[href="#${on}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [on]);
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  return (
    <PageV2 className="v2-design">
      <div className="design">
        <header className="d-head">
          <h1 className="v2-h1">How Sharify is <em>designed</em>.</h1>
          <p className="v2-lead v2-muted d-lead">Today the record of what happened to a rented object belongs to whoever has the most power: the rental desk, the courier, the seller. Sharify moves it to a path where every step can be checked by anyone. For each step: who could cheat, and why it doesn't work.</p>
        </header>

        <div className="d-layout">
          <nav className="d-toc" aria-label="On this page">
            <ol>{TOC.map((t) => <li key={t.id}><a href={`#${t.id}`} onClick={go(t.id)} aria-current={on === t.id ? "true" : undefined}>{t.label}</a></li>)}</ol>
            <a className="d-toc-dl" href="./diagrams/sharify-system.svg" download>Download the scheme (SVG)</a>
          </nav>

          <div className="d-doc">
            <section id="one" className="d-sec oneminute" aria-labelledby="one-title">
              <figure className="d-photo">
                <img src="./img/day/recorder-hand.jpg" alt="A hand holding the Sharify recorder, a small black box with one blue light, next to a bike frame" />
                <figcaption>The recorder: a small sealed box that rides on the frame and notes every hard knock.</figcaption>
              </figure>
              <h2 id="one-title">In one minute</h2>
              <ol className="minute">
                <li><b>A small box rides on the bike.</b> It notes every hard knock and seals each note, so nobody can quietly change it.</li>
                <li><b>The notes are kept in public.</b> On a blockchain, where neither the owner, the renter nor Sharify can rewrite them.</li>
                <li><b>The deposit follows a rule.</b> At the return, the hardest knock decides how much comes back. The rule is public before anyone rides.</li>
              </ol>
            </section>

            <section id="numbers" className="d-sec d-band d-dark" aria-labelledby="num-title">
              <h2 id="num-title">The numbers</h2>
              <dl className="numbers">{NUMBERS.map((n) => <div key={n.l}><dt>{n.v}<span>{n.u}</span></dt><dd>{n.l}</dd></div>)}</dl>
            </section>

            <section id="scheme" className="d-sec scheme d-band d-tint" aria-labelledby="scheme-title">
              <h2 id="scheme-title">Step by step: who could cheat, and why it fails</h2>
              <ol>
                {STAGES.map((st, i) => (
                  <li key={st.name} className="stage">
                    <div className="stage-block">
                      <span className="stage-n">{i + 1}</span>
                      <h3>{st.name}</h3>
                      <p className="stage-parts">{st.parts}</p>
                      <p>{st.does}</p>
                    </div>
                    <div className="stage-threat">
                      <p><span className="k">Could cheat</span>{st.cheat}</p>
                      <p><span className="k k-ok">Why it fails</span>{st.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="scheme-foot">Signatures prove a reading is authentic. The public ledger makes sure nothing can be hidden or reordered without leaving a visible gap in the sequence. You need both.</p>
            </section>

            <section id="test" className="d-sec d-band d-dark" aria-labelledby="test-title">
              <h2 id="test-title">Do we need a <em>blockchain</em>?</h2>
              <p className="d-sub">Wüst and Gervais, “Do you need a blockchain?” (2018). A blockchain is justified only if every answer points that way.</p>
              <ol className="test">{TEST.map((t) => (
                <li key={t.q}><span className={`yn ${t.yes ? "yes" : "no"}`}>{t.yes ? "Yes" : "No"}</span><span className="test-q">{t.q}</span><span className="test-a">{t.a.replace(/^(Yes|No): /, "")}</span></li>
              ))}</ol>
              <p className="verdict">Result: a <em>public, permissionless</em> blockchain.</p>
            </section>

            <section id="questions" className="d-sec" aria-labelledby="q-title">
              <h2 id="q-title">Questions and limits</h2>
              <div className="qgroups">
                <details className="qgroup" open>
                  <summary>Limits we state ourselves</summary>
                  <ul className="limits">{LIMITS.map((l) => <li key={l}>{l}</li>)}</ul>
                </details>
                <details className="qgroup">
                  <summary>Why not a database</summary>
                  <ul className="limits">
                    <li><b>Nobody owns the record.</b> A database belongs to someone who can rewrite it.</li>
                    <li><b>It outlives the company.</b> The history follows the bike across owners and countries.</li>
                    <li><b>Money and data in one place.</b> The deposit is held by code, not by the other party.</li>
                    <li><b>Anyone can check.</b> Every reading can be verified without asking us.</li>
                  </ul>
                </details>
                {OBJECTIONS.map((o) => (
                  <details key={o.q} className="qgroup"><summary>“{o.q}”</summary><p>{o.a}</p></details>
                ))}
                <details className="qgroup">
                  <summary>Design choices: the map and the sample fleet</summary>
                  <ul className="limits">
                    <li><b>The map shows only free, parked bikes.</b> A rented bike is never on the map and its position is never published: it would be the position of a person. A free bike is shown at its owner's spot, not at its last GPS reading.</li>
                    <li><b>One bike is live, the rest is a sample.</b> The demo bike is backed by the contracts and marked “Live · on-chain”; the other bikes are labelled “Sample fleet” and can't be rented.</li>
                  </ul>
                </details>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageV2>
  );
}
