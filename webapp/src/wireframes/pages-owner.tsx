import { useState } from "react";
import { A, Act, Box, Btn, Note, Ph, StepList, useTxRun } from "./ui";
import { go, useProto } from "./state";

export function MyObjectsPage() {
  const { bike, role } = useProto();
  const earned = bike === "returned-shock" ? 20 : 0;
  return (
    <div className="wf-page narrow">
      <h1>My objects</h1>
      {role !== "owner" && <Note>Prototype: you are looking as {role}. Switch “View as” to Owner to see your own objects.</Note>}
      {bike === "return-requested" && (
        <Box title="Returns to confirm">
          <p><b>Bob wants to return The demo bike.</b> Returned at 14:31. Check it's back with you, then confirm: the contract settles the deposit on its own.</p>
          <Btn primary to="confirm-return">Confirm you have it back</Btn>
        </Box>
      )}
      <div className="wf-grid two">
        <Box title="Rental income"><p className="wf-big">{bike === "free" || bike === "returned-shock" ? 3 : 2} dUSD</p><p className="wf-small">{bike === "free" || bike === "returned-shock" ? 3 : 2} rentals this month at 2 dUSD/hour. <span className="wf-tag">paid outside the contract today</span></p></Box>
        <Box title="Damage fees"><p className="wf-big">{earned} dUSD</p><p className="wf-small">Withheld from deposits by the contract this month, already in your wallet.</p></Box>
      </div>
      <Box title="Your objects">
        <table className="wf-table">
          <thead><tr><th>Object</th><th>Status</th><th>Last shock</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td>The demo bike</td>
              <td>{bike === "rented" ? "Rented by Bob since 14:02" : bike === "return-requested" ? "Bob is returning it" : "Available"}</td>
              <td>{bike === "returned-shock" ? "41.2 g, during Bob's rental" : "none"}</td>
              <td><A to="bike">Open</A></td>
            </tr>
          </tbody>
        </table>
      </Box>
      <div className="wf-actions"><Btn primary to="add/1">Add your bike</Btn></div>
    </div>
  );
}

export function ConfirmReturnPage() {
  const { setBike, shock } = useProto();
  const [done, setDone] = useState(false);
  const tx = useTxRun([
    { label: "Confirm the bike is back with you", who: "You sign" },
    { label: "Settle the deposit", who: "The contract, automatically" },
  ], () => { setBike(shock ? "returned-shock" : "free"); setDone(true); });
  return (
    <div className="wf-page narrow">
      <p><A to="my-objects">Back to My objects</A></p>
      <h1>{done ? (shock ? "Settled: 20 dUSD to you, 30 back to Bob." : "Settled: all 50 dUSD back to Bob.") : "Do you have the demo bike back?"}</h1>
      {!done && <p className="wf-lead">Bob returned it at 14:31. Confirm only when it is physically with you. You don't decide the fee: the contract reads the worst shock of Bob's rental.</p>}
      <dl className="wf-dl">
        <dt>Rental</dt><dd>Bob, 14:02–14:31</dd>
        <dt>Worst shock</dt><dd>{shock ? "41.2 g · medium" : "1.1 g · none"}</dd>
        <dt>Damage fee to you</dt><dd>{shock ? "20 dUSD" : "none"}</dd>
        <dt>Rental price</dt><dd>1 dUSD, paid separately</dd>
      </dl>
      <StepList steps={tx.steps} />
      <div className="wf-actions">
        {done ? <Btn primary to="my-objects">Back to My objects</Btn> : <Act primary disabled={tx.running} onClick={tx.run}>{tx.running ? "Working…" : "Confirm"}</Act>}
      </div>
      {!done && !shock && <Note>Prototype: set the bike to “Rented by Bob” and drop it from the rental page to see a settlement with a fee.</Note>}
    </div>
  );
}

const STEP_NAMES = ["Recorder", "Mount", "Pair", "Your object", "Rules", "Ready"];

function AddShell({ n, title, children, next }: { n: number; title: string; children: React.ReactNode; next?: { to: string; label: string; disabled?: boolean } }) {
  return (
    <div className="wf-page narrow">
      <p><A to="my-objects">Cancel</A></p>
      <ol className="wf-stepper" aria-label="Add an object">
        {STEP_NAMES.map((s, i) => <li key={s} className={i + 1 === n ? "current" : i + 1 < n ? "done" : ""}>{i + 1}. {s}</li>)}
      </ol>
      <h1>{title}</h1>
      {children}
      <div className="wf-actions">
        {n > 1 && <Btn to={`add/${n - 1}`}>Back</Btn>}
        {next && <Act primary disabled={next.disabled} onClick={() => go(next.to)}>{next.label}</Act>}
      </div>
    </div>
  );
}

export function AddPage({ n }: { n: number }) {
  const [mounted, setMounted] = useState(false);
  const [paired, setPaired] = useState(false);
  const [type, setType] = useState("Bike");
  const T: Record<string, [number, number, number]> = { Bike: [20, 40, 80], Scooter: [20, 40, 80], Camera: [30, 80, 180], Other: [8, 30, 80] };
  switch (n) {
    case 1: return (
      <AddShell n={1} title="Do you have a Sharify recorder?">
        <p className="wf-lead">The recorder is a small sealed box that measures shocks and signs them. Each object needs its own.</p>
        <div className="wf-grid two">
          <Box title="Yes, I have one"><p>Next you'll fix it to the bike and pair it.</p><Btn primary to="add/2">Continue</Btn></Box>
          <Box title="No, not yet"><p>Recorder, mount and battery. Price to be decided.</p><Act onClick={() => alert("Prototype: the order page is not designed yet.")}>Order one</Act></Box>
        </div>
      </AddShell>
    );
    case 2: return (
      <AddShell n={2} title="Fix it to the frame" next={{ to: "add/3", label: "Continue", disabled: !mounted }}>
        <Ph label="Drawing: recorder clamped to the down tube" h={200} />
        <ul>
          <li>Rigid to the frame, with the clamp in the box. Never on foam or tape: it would feel less than the bike does.</li>
          <li>Any orientation works.</li>
          <li>Keep the USB-C port reachable for charging.</li>
        </ul>
        <label className="wf-check"><input type="checkbox" checked={mounted} onChange={(e) => setMounted(e.target.checked)} /> It's fixed and doesn't move by hand.</label>
      </AddShell>
    );
    case 3: return (
      <AddShell n={3} title="Pair the recorder" next={{ to: "add/4", label: "Continue", disabled: !paired }}>
        <p>Scan the QR on the recorder. It holds the recorder's public key: its identity.</p>
        <Ph label="Camera: point it at the recorder's QR" h={180} />
        {paired ? <p><b>Recorder 0x5e5c…97f4 found.</b> Last signal 12 s ago, battery 84%.</p>
          : <Act onClick={() => setPaired(true)}>Scan</Act>}
      </AddShell>
    );
    case 4: return (
      <AddShell n={4} title="Your object" next={{ to: "add/5", label: "Continue" }}>
        <Ph label="Add a photo" h={140} />
        <label className="wf-field">Name<input defaultValue="The demo bike" /></label>
        <label className="wf-field">Type
          <select value={type} onChange={(e) => setType(e.target.value)}>{Object.keys(T).map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <Note>The type sets the suggested shock levels on the next step.</Note>
      </AddShell>
    );
    case 5: {
      const [l, m, s] = T[type] ?? T.Bike;
      return (
        <AddShell n={5} title="Your rules" next={{ to: "add/6", label: "Save the rules" }}>
          <p className="wf-lead">Renters accept these before they unlock. You can't change them during a rental.</p>
          <label className="wf-field">Deposit<input defaultValue="50" /> dUSD</label>
          <table className="wf-table">
            <thead><tr><th>Level</th><th>From</th><th>Withheld</th></tr></thead>
            <tbody>
              <tr><td>Light</td><td><input className="wf-num" defaultValue={l} /> g</td><td><input className="wf-num" defaultValue={10} /> %</td></tr>
              <tr><td>Medium</td><td><input className="wf-num" defaultValue={m} /> g</td><td><input className="wf-num" defaultValue={40} /> %</td></tr>
              <tr><td>Strong</td><td><input className="wf-num" defaultValue={s} /> g</td><td><input className="wf-num" defaultValue={100} /> %</td></tr>
            </tbody>
          </table>
          <Note>Suggested for a {type.toLowerCase()} from early tests, not yet measured on your object. 1 g is the object standing still; above 200 g the sensor saturates.</Note>
        </AddShell>
      );
    }
    default: return (
      <AddShell n={6} title="Ready to rent out">
        <p className="wf-lead">Print this QR and stick it on the frame. Renters scan it to open the bike page.</p>
        <Ph label="QR code → bike page" h={200} />
        <div className="wf-actions"><Act onClick={() => window.print()}>Print the QR</Act> <Btn to="bike">Open the bike page</Btn> <Btn primary to="my-objects">Go to My objects</Btn></div>
      </AddShell>
    );
  }
}
