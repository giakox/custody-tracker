import { useState } from "react";
import { A, Act, Box, Btn, Note, Ph } from "./ui";
import { BIKE_LABEL, ROLE_LABEL, useProto, wf } from "./state";
import { SystemDiagram } from "./SystemDiagram";

/** Map of every page and the four paths, to find your way around the prototype. */
export function IndexPage() {
  const { setRole, setBike, setShock } = useProto();
  const start = (role: "visitor" | "renter" | "owner", bike: "free" | "rented" | "return-requested" | "returned-shock", to: string, shock = bike === "returned-shock") => () => {
    setRole(role); setBike(bike); setShock(shock); window.location.hash = `#/wireframes/${to}`; window.scrollTo(0, 0);
  };
  return (
    <div className="wf-page">
      <h1>Sharify wireframes</h1>
      <p>Black and white on purpose: pages, buttons and real text only. Use the bar at the top to change who is looking ({Object.values(ROLE_LABEL).join(", ")}) and the state of the bike ({Object.values(BIKE_LABEL).join(", ")}). Every button leads to the page it names.</p>

      <h2>Paths</h2>
      <div className="wf-grid">
        <Box title="1 · Rent a bike (Bob)">
          <ol className="wf-path"><li>Scan the QR</li><li>Bike page: Rent</li><li>The rule</li><li>Connect wallet</li><li>Deposit, wait for the network</li><li>Rental in progress</li><li>Return</li><li>Wait for the owner</li><li>Outcome explained</li><li>Receipt in My rentals</li></ol>
          <Act primary onClick={start("visitor", "free", "home")}>Start as a visitor</Act>
        </Box>
        <Box title="2 · Rent out your bike (owner)">
          <ol className="wf-path"><li>Home: Rent out your bike</li><li>Do you have a recorder?</li><li>Mount it</li><li>Pair it</li><li>The object</li><li>The rules</li><li>Print the QR</li><li>My objects</li></ol>
          <Act primary onClick={start("owner", "free", "home")}>Start as the owner</Act>
        </Box>
        <Box title="3 · Confirm a return (owner)">
          <ol className="wf-path"><li>My objects: Bob wants to return it</li><li>Confirm you have it back</li><li>The contract settles on its own</li><li>Income</li></ol>
          <Act primary onClick={start("owner", "return-requested", "my-objects", true)}>Start as the owner</Act>
        </Box>
        <Box title="4 · Check what happened (visitor)">
          <ol className="wf-path"><li>Bike page</li><li>History</li><li>Verify a reading</li></ol>
          <Act primary onClick={start("visitor", "returned-shock", "bike")}>Start as a visitor</Act>
        </Box>
      </div>

      <h2>Notes for the demo script</h2>
      <Box>
        <ul>
          <li><b>Set the renter's wallet up before going on stage.</b> Take the test dUSD and allow the contract once, beforehand. Live, the unlock is then 2 signatures (take custody, lock the deposit) instead of 4, each 10–30 s on Base Sepolia.</li>
          <li>On the Deposit page, tick “wallet already set up” to rehearse the 2-signature version.</li>
          <li>Keep the bike page in front during the drop: the shock appears with its transaction.</li>
          <li>Have the owner confirm the return right away: until then the deposit is locked, and today there is no deadline.</li>
        </ul>
      </Box>

      <h2>All pages</h2>
      <div className="wf-grid">
        <Box title="Public"><ul><li><A to="home">Home</A></li><li><A to="bike">Bike page</A></li><li><A to="verify">Verify a reading</A></li><li><A to="why">How it works / Why Sharify</A></li></ul></Box>
        <Box title="Renting"><ul><li><A to="rent/rule">The rule</A></li><li><A to="rent/wallet">Connect wallet</A></li><li><A to="rent/deposit">Deposit</A></li><li><A to="rent/active">Rental in progress</A></li><li><A to="rent/return">Return</A></li><li><A to="rent/waiting">Waiting for the owner</A></li><li><A to="rent/outcome">Outcome</A></li><li><A to="my-rentals">My rentals</A></li><li><A to="receipt">Receipt</A></li></ul></Box>
        <Box title="Owning"><ul><li><A to="my-objects">My objects</A></li><li><A to="confirm-return">Confirm a return</A></li>{[1, 2, 3, 4, 5, 6].map((n) => <li key={n}><A to={`add/${n}`}>Add an object, step {n}</A></li>)}</ul></Box>
      </div>
      <p><a href="#/object/1">The designed object page</a> stays as it is, outside the wireframes.</p>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="wf-page">
      <h1>Rent things without arguing about damage.</h1>
      <p className="wf-lead">A small recorder on the bike signs every shock it feels. The deposit sits in a public contract and comes back on its own: all of it, or minus a fee if the bike was dropped during your rental.</p>
      <div className="wf-grid two">
        <Box title="Rent a bike">
          {/* Desktop: the QR is scanned with the phone, not from this page. */}
          <div className="wf-desktop-only">
            <p>Point your phone's camera at the QR on the bike.</p>
            <Ph label="Example: the QR sticker on the bike's frame" h={180} />
            <Btn primary to="bike">See the demo bike</Btn>
          </div>
          {/* Phone: scan from here (or with the phone's own camera app). */}
          <div className="wf-phone-only">
            <p>Scan the QR on the bike's frame.</p>
            <Btn primary to="bike">Scan the QR</Btn>
            <Note>Opens the phone's camera. Prototype: opens the demo bike.</Note>
          </div>
        </Box>
        <Box title="Rent out your bike">
          <p>Fix a recorder to it, set your deposit and your rules, print the QR. Renters pay damage by rule, not by argument.</p>
          <Ph label="Photo: a bike with the recorder on the frame" h={180} />
          <Btn primary to="add/1">Rent out your bike</Btn>
        </Box>
      </div>
      <HowItWorks />
    </div>
  );
}

export function HowItWorks() {
  return (
    <Box title="How it works">
      <ol className="wf-three">
        <li><b>The bike records.</b> A chip fixed to the frame measures shocks and signs them, so any later edit would show.</li>
        <li><b>The record is public.</b> Each batch of readings is written to a blockchain that neither you nor the owner controls.</li>
        <li><b>The deposit settles itself.</b> At the return a contract reads the worst shock of your rental and pays out by the rule you accepted.</li>
      </ol>
      <A to="why">Why it works this way</A>
    </Box>
  );
}

/** The bike page: status and action at the top depend on who is looking. */
export function BikePage() {
  const { role, bike, shock } = useProto();
  let status: React.ReactNode;
  let action: React.ReactNode = null;

  if (bike === "free" || bike === "returned-shock") {
    if (role === "owner") {
      status = bike === "returned-shock" ? <>Available, with you. Bob's rental earned you <b>20 dUSD</b> for a 41.2 g drop.</> : <>Available, with you.</>;
      action = <Btn primary to="my-objects">Manage</Btn>;
    } else if (role === "renter" && bike === "returned-shock") {
      status = <>Available. Your last rental ended with a 41.2 g drop: 20 dUSD withheld, 30 back to you.</>;
      action = <><Btn primary to="rent/rule">Rent it again</Btn> <Btn to="receipt">See the receipt</Btn></>;
    } else {
      status = <>Available now.</>;
      action = <Btn primary to="rent/rule">Rent this bike · 50 dUSD deposit</Btn>;
    }
  } else if (bike === "rented") {
    if (role === "renter") {
      status = shock
        ? <>You've had it since 14:02. Worst shock so far <b>41.2 g</b> (medium): 20 dUSD would be withheld.</>
        : <>You've had it since 14:02. No shock above 8 g so far: all 50 dUSD would come back.</>;
      action = <><Btn primary to="rent/return">Return</Btn> <Btn to="rent/active">Rental details</Btn></>;
    } else {
      status = <>Rented by Bob since 14:02.</>;
      action = role === "owner" ? <Btn primary to="my-objects">Manage</Btn> : <Note>Come back later, or ask the owner for another bike.</Note>;
    }
  } else {
    if (role === "owner") { status = <>Bob wants to return it.</>; action = <Btn primary to="confirm-return">Confirm you have it back</Btn>; }
    else if (role === "renter") { status = <>You returned it. Waiting for the owner to confirm.</>; action = <Btn primary to="rent/waiting">See where it stands</Btn>; }
    else { status = <>Being returned by Bob.</>; }
  }

  return (
    <div className="wf-page">
      <div className="wf-bike-top">
        <Ph label="Photo of the bike" h={220} />
        <div>
          <p className="wf-kicker">The demo bike · rented out by Giacomo's bikes <span className="wf-addr">0xDD15…FC35</span></p>
          <h1>{status}</h1>
          <div className="wf-actions">{action}</div>
          <p className="wf-small">Deposit 50 dUSD · fee if dropped: 10% light (8 g), 40% medium (30 g), 100% strong (80 g).</p>
        </div>
      </div>

      <h2>What it went through</h2>
      <BobsRental />
      <Box title="Alice's rental · yesterday 10:40–11:15">
        <ul className="wf-history"><li>11:16 · Settled: nothing above 8 g, all 50 dUSD back to Alice.</li><li>10:40 · Alice locked 50 dUSD and took it.</li></ul>
      </Box>
      <Box title="Missing from the record">
        <p>Batches 11 and 12 never reached the chain. The gap stays visible; nobody can fill it later.</p>
      </Box>
      <p><A to="verify">See the full ledger and verify any reading</A></p>
      <HowItWorks />
    </div>
  );
}

export function VerifyPage() {
  const [checked, setChecked] = useState<"no" | "running" | "ok">("no");
  return (
    <div className="wf-page narrow">
      <p><A to="bike">Back to the bike</A></p>
      <h1>Verify a reading</h1>
      <p className="wf-lead">Check one reading yourself against the public record, without trusting Sharify.</p>
      <Box title="The reading">
        <dl className="wf-dl">
          <dt>When</dt><dd>9 Nov, 14:07:12</dd>
          <dt>Peak</dt><dd>41.2 g (medium)</dd>
          <dt>Where</dt><dd>45.4592, 9.1885</dd>
          <dt>Batch</dt><dd>seq 10, reading 8 of 9</dd>
        </dl>
        <Ph label="Map with the point of the drop" h={140} />
      </Box>
      <Box title="The proof">
        <p className="wf-small">Raw record 0x0000024d…0907 · 4 sibling hashes · batch fingerprint (root) 0x7b2d…6898</p>
        {checked === "no" && <Act primary onClick={() => { setChecked("running"); setTimeout(() => setChecked("ok"), 1200); }}>Check on the blockchain</Act>}
        {checked === "running" && <p>Asking the contract…</p>}
        {checked === "ok" && <p><b>Verified.</b> This reading is part of batch 10, anchored on 9 Nov at 14:07 in transaction 0x3086…da9c. Anyone can run the same check.</p>}
      </Box>
    </div>
  );
}

export function WhyPage() {
  return (
    <div className="wf-page">
      <h1>How Sharify is designed</h1>
      <p className="wf-lead">Today the record of what happened to a rented object belongs to whoever has the most power: the rental desk, the courier, the seller. Sharify moves it to a path where every step can be checked by anyone. For each step: who could cheat, and why it doesn't work.</p>
      <SystemDiagram />
      <Box title="Do we need a blockchain? The test">
        <p className="wf-small">Wüst and Gervais, “Do you need a blockchain?” (2018). A blockchain is justified only if every answer points that way.</p>
        <table className="wf-table">
          <thead><tr><th>Question</th><th>Our answer</th></tr></thead>
          <tbody>
            <tr><td>Do we need shared state?</td><td>Yes: the object's history and who had it.</td></tr>
            <tr><td>Are there several writers?</td><td>Yes: the object, the owner, the renters; later insurers and buyers.</td></tr>
            <tr><td>Is there a third party everyone trusts and that is always online?</td><td>No: whoever runs the database is a party to the dispute, or becomes the new point of trust.</td></tr>
            <tr><td>Do the writers trust each other?</td><td>No: they disagree about who caused the damage.</td></tr>
            <tr><td>Is public verification needed?</td><td>Yes: surveyors, judges, future buyers.</td></tr>
          </tbody>
        </table>
        <p><b>Result: a public, permissionless blockchain.</b></p>
      </Box>
      <Box title="Design choices">
        <ul>
          <li><b>The map shows only free, parked bikes.</b> A rented bike is never on the map and its position is never published: it would be the position of a person (VISION §6). A free bike is shown at its owner's spot, not at its last GPS reading.</li>
          <li><b>One bike is live, the rest is a sample.</b> The demo bike is backed by the contracts and marked “Live · on-chain”; the other bikes are labelled “Sample fleet” and can't be rented.</li>
        </ul>
      </Box>
      <Box title="Why a blockchain and not a database">
        <ol>
          <li><b>Nobody owns the record.</b> A database belongs to someone who can rewrite it.</li>
          <li><b>It outlives the company.</b> The history follows the bike across owners and countries.</li>
          <li><b>Money and data in one place.</b> The deposit is held by code, not by the other party.</li>
          <li><b>Anyone can check.</b> Every reading can be verified without asking us.</li>
        </ol>
        <p>Signatures prove a reading is authentic. The public ledger makes sure nothing can be hidden or reordered without leaving a visible gap in the sequence. You need both.</p>
      </Box>
      <Box title="The objections, answered">
        <dl className="wf-qa">
          <dt>“Why not one database shared by the rental companies?”</dt>
          <dd>That is a consortium: it works only while members trust whoever runs it. It leaves out the renter, it can't hold the deposit, and it disappears with the consortium.</dd>
          <dt>“Why not a digital notary or a timestamping service?”</dt>
          <dd>It proves when something was written, not that nothing was left out. It is still one intermediary, and it can't hold the deposit.</dd>
          <dt>“Isn't a blockchain slow and expensive?”</dt>
          <dd>On Base, an Ethereum layer 2, one batch of 16 readings costs about 145,000 gas: under 0.000001 ETH on the test network, a fraction of a cent. Only a fingerprint goes on-chain, not the data. Testnet prices are an order of magnitude, not a quote.</dd>
        </dl>
      </Box>
      <Box title="The numbers">
        <ul>
          <li>1600 accelerometer samples per second; the peak of each second is kept.</li>
          <li>±200 g full scale on each axis.</li>
          <li>16 readings in each batch the chip signs.</li>
          <li>About 145,000 gas to anchor one batch, measured on Base Sepolia.</li>
        </ul>
      </Box>
            <p><a href={wf("home")}>Back to the home page</a></p>
    </div>
  );
}

/** Bob's rental as the history shows it, consistent with the bike state chosen in the controls. */
function BobsRental() {
  const { bike, shock } = useProto();
  const dropped = bike === "returned-shock" || (shock && bike !== "free");
  const ended = bike === "free" || bike === "returned-shock";
  const range = bike === "rented" ? "14:02–now" : "14:02–14:31";
  return (
    <Box title={`Bob's rental · ${range}`}>
      <ul className="wf-history">
        {ended && (dropped
          ? <li>14:33 · Settled by the contract: 20 dUSD withheld for the 41.2 g drop, 30 back to Bob.</li>
          : <li>14:33 · Settled by the contract: nothing above 8 g, all 50 dUSD back to Bob.</li>)}
        {ended && <li>14:33 · The owner confirmed the bike is back.</li>}
        {bike === "return-requested" && <li>14:31 · Bob returned it. Waiting for the owner to confirm; the deposit is still locked.</li>}
        {ended && <li>14:31 · Bob returned it.</li>}
        {dropped && <li>14:07 · Dropped: 41.2 g, medium. <A to="verify">Verify this reading</A></li>}
        <li>14:02 · Bob locked 50 dUSD and took it.</li>
      </ul>
    </Box>
  );
}
