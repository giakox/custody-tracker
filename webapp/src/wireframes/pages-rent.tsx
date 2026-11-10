import { useState } from "react";
import { A, Act, Box, Btn, Note, Ph, StepList, useTxRun } from "./ui";
import { go, useProto } from "./state";

const TIERS = [
  { name: "Light", from: "8 g", fee: "10%", amount: "5 dUSD" },
  { name: "Medium", from: "30 g", fee: "40%", amount: "20 dUSD" },
  { name: "Strong", from: "80 g", fee: "100%", amount: "50 dUSD" },
];

function RuleTable({ highlight }: { highlight?: number }) {
  return (
    <table className="wf-table">
      <thead><tr><th>If the worst shock is</th><th>From</th><th>Withheld</th><th>You get back</th></tr></thead>
      <tbody>
        <tr className={highlight === 0 ? "hl" : ""}><td>Below light</td><td>under 8 g</td><td>nothing</td><td>50 dUSD</td></tr>
        {TIERS.map((t, i) => (
          <tr key={t.name} className={highlight === i + 1 ? "hl" : ""}><td>{t.name}</td><td>{t.from}</td><td>{t.fee} · {t.amount}</td><td>{50 - Number(t.amount.split(" ")[0])} dUSD</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function RulePage() {
  const { role } = useProto();
  const [ok, setOk] = useState(false);
  return (
    <div className="wf-page narrow">
      <p><A to="bike">Back to the bike</A></p>
      <h1>The rule you accept</h1>
      <p className="wf-lead">You lock a 50 dUSD deposit. When you return the bike, a contract looks at the worst shock recorded during your rental and pays out by this table. Nobody decides it by hand.</p>
      <dl className="wf-dl">
        <dt>Rental price</dt><dd>2 dUSD per hour, paid when you return it <span className="wf-tag">not in today's contract</span></dd>
        <dt>Deposit</dt><dd>50 dUSD, back by this table</dd>
      </dl>
      <RuleTable />
      <ul className="wf-small">
        <li>Only your rental counts: shocks from earlier renters stay on their record.</li>
        <li>1 g is the bike standing still: gravity is included in every number.</li>
        <li>The deposit comes back when the owner confirms the bike is back with them.</li>
      </ul>
      <label className="wf-check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> I accept this rule for this rental.</label>
      <div className="wf-actions">
        <Act primary disabled={!ok} onClick={() => go(role === "visitor" ? "rent/wallet" : "rent/deposit")}>Continue</Act>
      </div>
      {!ok && <Note>Tick the box to continue.</Note>}
    </div>
  );
}

export function WalletPage() {
  const { setRole } = useProto();
  const connect = () => { setRole("renter"); go("rent/deposit"); };
  return (
    <div className="wf-page narrow">
      <p><A to="rent/rule">Back to the rule</A></p>
      <h1>Connect a wallet</h1>
      <p className="wf-lead">The deposit leaves from your own wallet and comes back to it. Sharify never holds your money or your keys.</p>
      <div className="wf-stack">
        <Act primary onClick={connect}>MetaMask</Act>
        <Act onClick={connect}>Another wallet (WalletConnect)</Act>
      </div>
      <Note>No wallet? You need one with a little test ETH on Base Sepolia. A short guide goes here.</Note>
    </div>
  );
}

export function DepositPage() {
  const [setUp, setSetUp] = useState(false);
  return <DepositFlow key={String(setUp)} setUp={setUp} onSetUp={setSetUp} />;
}

/** First rental: 4 signatures. Wallet already set up (dUSD in hand, contract already allowed): 2. */
function DepositFlow({ setUp, onSetUp }: { setUp: boolean; onSetUp: (v: boolean) => void }) {
  const { setBike, setShock, setRole } = useProto();
  const [done, setDone] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const steps = setUp
    ? [{ label: "Take custody of the bike", who: "You sign" }, { label: "Lock the deposit", who: "You sign" }]
    : [
      { label: "Take custody of the bike", who: "You sign" },
      { label: "Get 50 test dUSD (first time only)", who: "You sign" },
      { label: "Allow the contract to take 50 dUSD (first time only)", who: "You sign" },
      { label: "Lock the deposit", who: "You sign" },
    ];
  const tx = useTxRun(steps, () => { setRole("renter"); setBike("rented"); setShock(false); setDone(true); }, failNext ? steps.length - 2 : -1);
  return (
    <div className="wf-page narrow">
      <h1>{done ? "Unlocked. Ride safe." : "Lock the deposit"}</h1>
      <p className="wf-lead">{done ? "50 dUSD is in the contract. The bike now records under your name."
        : `${setUp ? "Two" : "Four"} confirmations in your wallet. Each takes a few seconds on the network; keep this page open.`}</p>
      <StepList steps={tx.steps} />
      {tx.error && <p className="wf-error">{tx.error}</p>}
      <div className="wf-actions">
        {done ? <Btn primary to="rent/active">Go to your rental</Btn>
          : <Act primary disabled={tx.running} onClick={tx.run}>{tx.error ? "Try again" : tx.running ? "Working…" : "Start"}</Act>}
      </div>
      {!done && !tx.running && (
        <>
          <label className="wf-check proto"><input type="checkbox" checked={setUp} onChange={(e) => onSetUp(e.target.checked)} /> Prototype: wallet already set up (dUSD taken and allowed before), 2 signatures</label>
          <label className="wf-check proto"><input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} /> Prototype: reject a request in the wallet</label>
        </>
      )}
    </div>
  );
}

export function ActivePage() {
  const { shock, setShock, bike } = useProto();
  if (bike !== "rented") {
    return <div className="wf-page narrow"><h1>No rental in progress</h1><p>Find a bike and rent it first.</p><Btn primary to="bike">Open the demo bike</Btn></div>;
  }
  return (
    <div className="wf-page narrow">
      <p className="wf-kicker">Your rental · The demo bike</p>
      <h1>{shock ? "41.2 g so far: 20 dUSD would be withheld." : "No shock so far: all 50 dUSD would come back."}</h1>
      <dl className="wf-dl">
        <dt>Since</dt><dd>14:02 (32 min)</dd>
        <dt>Deposit</dt><dd>50 dUSD locked in the contract</dd>
        <dt>Worst shock</dt><dd>{shock ? "41.2 g at 14:07 · medium" : "1.1 g · nothing above 8 g"}</dd>
        <dt>Last reading</dt><dd>16 s ago</dd>
      </dl>
      <RuleTable highlight={shock ? 2 : 0} />
      <Ph label="Map of the ride, shocks marked" h={180} />
      <div className="wf-actions"><Btn primary to="rent/return">Return the bike</Btn></div>
      {!shock && <label className="wf-check proto"><input type="checkbox" checked={shock} onChange={(e) => setShock(e.target.checked)} /> Prototype: drop the bike (41.2 g)</label>}
    </div>
  );
}

export function ReturnPage() {
  const { setBike } = useProto();
  const [done, setDone] = useState(false);
  const tx = useTxRun([{ label: "Hand the bike back to the owner", who: "You sign" }], () => { setBike("return-requested"); setDone(true); });
  return (
    <div className="wf-page narrow">
      <p><A to="rent/active">Back to your rental</A></p>
      <h1>Return the bike</h1>
      <ol>
        <li>Leave it where the owner asked, locked.</li>
        <li>Send the return. The bike keeps recording under your name until the owner confirms.</li>
        <li>When the owner confirms, the contract settles the deposit on its own.</li>
      </ol>
      <StepList steps={tx.steps} />
      <div className="wf-actions">
        {done ? <Btn primary to="rent/waiting">Continue</Btn> : <Act primary disabled={tx.running} onClick={tx.run}>{tx.running ? "Working…" : "Send the return"}</Act>}
      </div>
    </div>
  );
}

export function WaitingPage() {
  const { bike, setBike, shock } = useProto();
  const settled = bike === "returned-shock" || bike === "free";
  return (
    <div className="wf-page narrow">
      <h1>{settled ? "The owner confirmed." : "Waiting for the owner to confirm."}</h1>
      <p className="wf-lead">The owner has to confirm the bike is back with them. Until then it still counts as yours. Nothing else is needed from you.</p>
      <ol className="wf-steps">
        <li className="confirmed"><span className="wf-dot">✓</span><span><b>You returned it</b><br /><small>14:31</small></span></li>
        <li className={settled ? "confirmed" : "pending"}><span className="wf-dot">{settled ? "✓" : 2}</span><span><b>Owner confirms</b><br /><small>{settled ? "14:33" : "Waiting since 14:31"}</small></span></li>
        <li className={settled ? "confirmed" : "waiting"}><span className="wf-dot">{settled ? "✓" : 3}</span><span><b>Contract settles the deposit</b><br /><small>Automatic</small></span></li>
      </ol>
      {!settled && (
        <Box title="What if the owner never confirms?">
          <p>Today your deposit stays locked: the contract has no deadline, so a return only counts once the owner accepts it. This is a known limit.</p>
          <p><b>Proposed fix:</b> if the owner hasn't confirmed 24 hours after your return, the return counts anyway and the deposit settles by the same rule. <span className="wf-tag">not in today's contract</span></p>
        </Box>
      )}
      <div className="wf-actions">
        {settled ? <Btn primary to="rent/outcome">See the outcome</Btn>
          : <Act onClick={() => setBike(shock ? "returned-shock" : "free")}>Prototype: the owner confirms</Act>}
      </div>
    </div>
  );
}

export function OutcomePage() {
  const { bike } = useProto();
  const shock = bike === "returned-shock";
  return (
    <div className="wf-page narrow">
      <h1>{shock ? "30 dUSD back, 20 withheld." : "All 50 dUSD are back."}</h1>
      <p className="wf-lead">{shock
        ? "During your rental the bike recorded a 41.2 g shock at 14:07. That is the medium level of the rule you accepted, so 40% of the deposit went to the owner."
        : "Nothing above 8 g was recorded during your rental, so the contract returned the whole deposit."}</p>
      <RuleTable highlight={shock ? 2 : 0} />
      <div className="wf-actions">
        {shock && <Btn to="verify">Check the 41.2 g reading</Btn>}
        <Btn primary to="receipt">Receipt</Btn>
        <Btn to="my-rentals">My rentals</Btn>
      </div>
    </div>
  );
}

export function MyRentalsPage() {
  const { bike } = useProto();
  return (
    <div className="wf-page narrow">
      <h1>My rentals</h1>
      {(bike === "rented" || bike === "return-requested") && (
        <Box title="In progress">
          <p>The demo bike · since 14:02 · 50 dUSD locked{bike === "return-requested" ? " · waiting for the owner" : ""}</p>
          <Btn primary to={bike === "rented" ? "rent/active" : "rent/waiting"}>Open</Btn>
        </Box>
      )}
      <Box title="Past">
        <table className="wf-table">
          <thead><tr><th>Bike</th><th>When</th><th>Worst shock</th><th>Back to you</th><th></th></tr></thead>
          <tbody>
            {bike === "returned-shock" && <tr><td>The demo bike</td><td>Today 14:02–14:31</td><td>41.2 g · medium</td><td>30 of 50 dUSD</td><td><A to="receipt">Receipt</A></td></tr>}
            {bike === "free" && <tr><td>The demo bike</td><td>Today 14:02–14:31</td><td>1.1 g</td><td>50 of 50 dUSD</td><td><A to="receipt">Receipt</A></td></tr>}
            <tr><td>The demo bike</td><td>8 Nov 18:10–18:40</td><td>1.3 g</td><td>50 of 50 dUSD</td><td><A to="receipt">Receipt</A></td></tr>
          </tbody>
        </table>
      </Box>
      {bike === "free" && <Note>No rental in progress. <A to="home">Rent a bike</A></Note>}
    </div>
  );
}

export function ReceiptPage() {
  const { bike } = useProto();
  const dropped = bike === "returned-shock";
  return (
    <div className="wf-page narrow">
      <p><A to="my-rentals">Back to My rentals</A></p>
      <h1>Receipt</h1>
      <dl className="wf-dl">
        <dt>Bike</dt><dd>The demo bike, from Giacomo's bikes <span className="wf-addr">0xDD15…FC35</span></dd>
        <dt>Rental</dt><dd>Today, 14:02–14:31</dd>
        <dt>Rental price</dt><dd>1 dUSD (29 min at 2 dUSD/hour) <span className="wf-tag">paid outside the contract today</span></dd>
        <dt>Deposit</dt><dd>50 dUSD</dd>
        <dt>Worst shock</dt><dd>{dropped ? "41.2 g at 14:07 · medium" : "1.1 g · nothing above 8 g"}</dd>
        <dt>Damage fee</dt><dd>{dropped ? "20 dUSD (40% of the deposit)" : "none"}</dd>
        <dt>Deposit back to you</dt><dd>{dropped ? "30 dUSD" : "50 dUSD"}</dd>
      </dl>
      <Box title="Transactions">
        <ul className="wf-small"><li>Deposit · 0xa299…7fd6</li>{dropped && <li>Shock recorded · 0x3086…da9c</li>}<li>Return · 0x1bd0…098d</li><li>Settlement · 0x5ad7…d593</li></ul>
      </Box>
      <div className="wf-actions">{dropped && <Btn to="verify">Verify the shock reading</Btn>} <Act onClick={() => window.print()}>Print</Act></div>
    </div>
  );
}
