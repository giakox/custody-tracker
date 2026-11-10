// The renting path: rule → wallet → deposit → ride → return → waiting → outcome.
// Same structure and words as the approved wireframes, in the bike page's style.
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { demoEndRental, getBalance, getNetwork, getObject, getReadings, isWalletReady, requestReturn, startRental } from "../data/api";
import { DataError, type ObjectDetail, type Party, type Reading, type TxStep } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { RuleTiers } from "../components/RuleTiers";
import { RuleSimulator } from "../components/RuleSimulator";
import { TxSteps } from "../components/TxSteps";
import { RideMap } from "../components/RideMap";
import { ObjectImage } from "../components/ObjectImage";
import { g, hm, objectName, shortHex, span, TIER_NAMES, usd } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import "./object-page.css";
import "./site.css";
import "./rent.css";

const STAGES = ["Rule", "Deposit", "Ride", "Return", "Settled"] as const;
type Stage = (typeof STAGES)[number];

/** Frame shared by every step: header, the bike, where you are in the path. */
function Shell({ d, stage, children, wide = false }: { d?: ObjectDetail; stage: Stage; children: ReactNode; wide?: boolean }) {
  const at = STAGES.indexOf(stage);
  return (
    <div className="page">
      <SiteHeader />
      <main className={`rent ${wide ? "rent-wide" : ""}`}>
        <div className="rent-top">
          {d && <a className="link mono back" href={href(`object/${d.id}`)}>{objectName(d)}</a>}
          <ol className="rent-progress" aria-label="Rental steps">
            {STAGES.map((s, i) => <li key={s} className={i < at ? "done" : i === at ? "current" : ""} aria-current={i === at ? "step" : undefined}>{s}</li>)}
          </ol>
        </div>
        {children}
      </main>
      <DemoSwitcher />
    </div>
  );
}

function useBike(id: number) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000 });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  return { d: q.data, explorer: net.data?.explorer ?? null, error: q.error };
}

const Loading = ({ stage }: { stage: Stage }) => <Shell stage={stage}><p className="lead">Reading the bike from the chain…</p></Shell>;

// ---------- 1 · the rule ----------
export function RulePage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  const [ok, setOk] = useState(false);
  if (!d) return <Loading stage="Rule" />;
  const r = relation(d, account);
  const busy = d.status !== "available" && !r.isOfferedToMe;
  return (
    <Shell d={d} stage="Rule">
      <h1>The rule you <em>accept</em>.</h1>
      <p className="lead">You lock a {usd(d.terms.collateral)} deposit. When you return the bike, a contract looks at the worst shock recorded during your rental and pays out by this table. Nobody decides it by hand.</p>
      <dl className="facts">
        <div><dt>Rental price</dt><dd className="mono">2 dUSD per hour</dd><dd className="tag mono">paid when you return it · not in today's contract</dd></div>
        <div><dt>Deposit</dt><dd className="mono">{usd(d.terms.collateral)}</dd><dd className="tag mono">back by this table</dd></div>
      </dl>
      <RuleSimulator terms={d.terms} />
      <ul className="fine">
        <li>Only your rental counts: shocks from earlier renters stay on their record.</li>
        <li>1 g is the bike standing still: gravity is included in every number.</li>
        <li>The deposit comes back when the owner confirms the bike is back with them.</li>
      </ul>
      {busy ? (
        <p className="notice">This bike is not available right now. <a className="link" href={href("")}>Find another one on the map</a></p>
      ) : (
        <>
          <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> <span>I accept this rule for this rental.</span></label>
          <div className="actions">
            {ok
              ? <a className="btn btn-primary" href={href(account ? `rent/${id}/deposit` : `rent/${id}/wallet`)}>Continue</a>
              : <span className="btn btn-primary is-off" aria-disabled="true">Continue</span>}
          </div>
          {!ok && <p className="hint-line">Tick the box to continue.</p>}
        </>
      )}
    </Shell>
  );
}

// ---------- 2 · wallet ----------
export function WalletPage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { connect } = useViewer();
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); await connect(); window.location.hash = `#/rent/${id}/deposit`; };
  return (
    <Shell d={d} stage="Deposit">
      <h1>Connect a <em>wallet</em>.</h1>
      <p className="lead">The deposit leaves from your own wallet and comes back to it. Sharify never holds your money or your keys.</p>
      <div className="wallets">
        <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>MetaMask</b><span className="mono">Browser extension or mobile app</span></button>
        <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>Another wallet</b><span className="mono">WalletConnect</span></button>
      </div>
      <p className="hint-line">{busy ? "Waiting for your wallet…" : "You need a wallet with a little test ETH on Base Sepolia."}</p>
    </Shell>
  );
}

// ---------- 3 · deposit ----------
/** The signatures the unlock will ask for, known before the user presses anything. */
function plannedSteps(d: ObjectDetail, me: Party, ready: boolean, balance: number): TxStep[] {
  const c = Number(d.terms.collateral);
  const offered = !!d.pendingHandoff && d.pendingHandoff.to.address.toLowerCase() === me.address.toLowerCase();
  const mk = (id: TxStep["id"], signer: Party, viaWallet: boolean): TxStep => ({ id, signer, viaWallet, status: "waiting", tx: null, error: null });
  return [
    ...(offered ? [] : [mk("propose", d.owner, false)]),
    mk("accept", me, true),
    ...(!ready && balance < c ? [mk("faucet", me, true)] : []),
    ...(!ready ? [mk("approve", me, true)] : []),
    mk("deposit", me, true),
  ];
}

export function DepositPage({ id }: { id: number }) {
  const { d, explorer } = useBike(id);
  const { account } = useViewer();
  const qc = useQueryClient();
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const ready = useQuery({ queryKey: ["wallet-ready", id], queryFn: () => isWalletReady(id) });
  const bal = useQuery({ queryKey: ["balance", account?.address], queryFn: () => getBalance(account!.address), enabled: !!account });
  const run = async () => {
    setState("running"); setError(null);
    try { await startRental(id, setSteps); setState("done"); }
    catch (e) { setState("error"); setError(e instanceof DataError ? e.message : String(e)); }
    await qc.invalidateQueries();
  };
  if (!d) return <Loading stage="Deposit" />;
  const deposit = usd(d.terms.collateral);
  const planned = account && ready.data !== undefined ? plannedSteps(d, account, ready.data, Number(bal.data ?? 0)) : [];
  const shown = steps.length ? steps : planned;
  const signatures = shown.filter((s) => s.viaWallet).length;
  return (
    <Shell d={d} stage="Deposit" wide>
      <h1>{state === "done" ? <>Unlocked. Ride <em>safe</em>.</> : <>Lock the <em>deposit</em>.</>}</h1>
      <p className="lead">{state === "done"
        ? `${deposit} is in the contract. From now on the bike records under your name.`
        : ready.data
          ? `Your wallet is already set up: ${signatures} confirmations, a few seconds each on the network. Keep this page open.`
          : `First rental from this wallet: ${signatures} confirmations, a few seconds each on the network. Next time it's two. Keep this page open.`}</p>
      <div className="deposit">
        <div className="deposit-main">
          {shown.length > 0 && <TxSteps steps={shown} deposit={deposit} explorer={explorer} />}
          {error && <p className="notice error">{error === "You rejected the request in your wallet." ? "You rejected the request in your wallet. Nothing was sent: try again when you're ready." : error}</p>}
          <div className="actions">
            {state === "done"
              ? <a className="btn btn-primary" href={href(`rent/${id}/active`)}>Go to your rental</a>
              : <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : state === "error" ? "Try again" : `Lock ${deposit}`}</button>}
          </div>
        </div>
        <aside className="deposit-summary" aria-label="What you are locking">
          <div className="sum-bike">
            <ObjectImage deviceId={d.deviceId} glow={false} />
            <div>
              <p className="sum-name">{objectName(d)}</p>
              <p className="mono sum-owner">from {d.ownerName ?? shortHex(d.owner.address)}</p>
            </div>
          </div>
          <dl className="sum-lines">
            <div><dt>You lock</dt><dd className="mono big">{deposit}</dd></div>
            <div><dt>Rental price</dt><dd className="mono">2 dUSD per hour</dd><dd className="tag mono">paid at the return · not in today's contract</dd></div>
          </dl>
          <p className="rule-title">Back to you by this rule</p>
          <RuleTiers terms={d.terms} />
          <p className="hint-line"><a className="link" href={href(`rent/${id}`)}>Read the rule again</a></p>
        </aside>
      </div>
    </Shell>
  );
}

// ---------- 4 · rental in progress ----------
function useRideReadings(d: ObjectDetail | undefined) {
  const rental = d?.activeRental;
  const seqs = rental ? d!.batches.filter((b) => b.period === rental.period).map((b) => b.seq) : [];
  return useQuery({
    queryKey: ["ride", d?.id, seqs.join(",")],
    queryFn: async (): Promise<Reading[]> => (await Promise.all(seqs.map((s) => getReadings(d!.id, s)))).flat(),
    enabled: seqs.length > 0,
    retry: false,
  });
}

export function ActivePage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  const ride = useRideReadings(d);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  if (!d) return <Loading stage="Ride" />;
  const r = d.activeRental;
  if (!r || !relation(d, account).isCustodian) {
    return (
      <Shell d={d} stage="Ride">
        <h1>No rental <em>in progress</em>.</h1>
        <p className="lead">You don't have this bike right now.</p>
        <div className="actions"><a className="btn btn-primary" href={href("")}>Find a bike</a></div>
      </Shell>
    );
  }
  const c = r.current!;
  const alert = c.tier > 0;
  const lastBatch = d.batches.filter((b) => b.period === r.period).at(-1);
  return (
    <Shell d={d} stage="Ride" wide>
      <section className={`ride-hero tier-glow-${alert ? c.tier : 0}`}>
        <div>
          <p className="kicker">Your rental · since {hm(r.started.at)} · {span(r.started.at, null)}</p>
          <h1>{c.peakCg === null
            ? <>No readings <em>yet</em>.</>
            : alert ? <>{g(c.peakCg)} so far: {usd(c.wouldWithhold)} would be <em>withheld</em>.</>
              : <>No shock so far: all {usd(r.collateral)} would come <em>back</em>.</>}</h1>
          <dl className="facts">
            <div><dt>Deposit</dt><dd className="mono">{usd(r.collateral)} locked</dd></div>
            <div><dt>Worst shock</dt><dd className={`mono ${alert ? "shock" : ""}`}>{c.peakCg === null ? "—" : `${g(c.peakCg)} · ${TIER_NAMES[c.tier]}`}</dd></div>
            <div><dt>Last reading</dt><dd className="mono">{lastBatch ? `${Math.max(0, Math.round((Date.now() - lastBatch.anchor.at) / 1000))} s ago` : "waiting for the first batch"}</dd></div>
          </dl>
          <RuleTiers terms={d.terms} highlight={c.tier} />
          <div className="actions"><a className="btn btn-primary" href={href(`rent/${id}/return`)}>Return the bike</a></div>
        </div>
        <div className="ride-side">
          <div className="glow" aria-hidden="true"><i className="glow-blue" /><i className="glow-orange" /><i className="grain" /></div>
          {ride.data?.length
            ? <RideMap readings={ride.data} lightCg={d.terms.lightCg} />
            : <ObjectImage alert={alert} deviceId={d.deviceId} />}
          <p className="hint-line">{ride.isError ? "The map of your ride needs the relayer, which is offline. Everything else comes from the chain." : "Your route is shown only to you."}</p>
        </div>
      </section>
    </Shell>
  );
}

// ---------- 5 · return ----------
export function ReturnPage({ id }: { id: number }) {
  const { d, explorer } = useBike(id);
  const qc = useQueryClient();
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setState("running"); setError(null);
    try { await requestReturn(id, setSteps); await qc.invalidateQueries(); window.location.hash = `#/rent/${id}/waiting`; }
    catch (e) { setState("error"); setError(e instanceof DataError ? e.message : String(e)); }
  };
  if (!d) return <Loading stage="Return" />;
  return (
    <Shell d={d} stage="Return">
      <h1>Return the <em>bike</em>.</h1>
      <ol className="numbered">
        <li>Leave it where the owner asked, locked.</li>
        <li>Send the return. The bike keeps recording under your name until the owner confirms.</li>
        <li>When the owner confirms, the contract settles the deposit on its own.</li>
      </ol>
      {steps.length > 0 && <TxSteps steps={steps} deposit={usd(d.terms.collateral)} explorer={explorer} />}
      {error && <p className="notice error">{error}</p>}
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : "Send the return"}</button>
        <a className="btn btn-secondary" href={href(`rent/${id}/active`)}>Back to your rental</a>
      </div>
    </Shell>
  );
}

// ---------- 6 · waiting for the owner ----------
export function WaitingPage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  const qc = useQueryClient();
  const [demoBusy, setDemoBusy] = useState(false);
  const mine = d?.rentals.filter((x) => account && x.renter.address.toLowerCase() === account.address.toLowerCase()).at(-1);
  const settled = !!mine?.settlement;
  useEffect(() => { if (settled) window.location.hash = `#/rent/${id}/outcome`; }, [settled, id]);
  if (!d) return <Loading stage="Return" />;
  const p = d.pendingHandoff;
  const ownerConfirm = async () => { setDemoBusy(true); try { await demoEndRental(id, () => {}); } finally { await qc.invalidateQueries(); setDemoBusy(false); } };
  return (
    <Shell d={d} stage="Return">
      <h1>Waiting for the owner to <em>confirm</em>.</h1>
      <p className="lead">The owner has to confirm the bike is back with them. Until then it still counts as yours. Nothing else is needed from you.</p>
      <ol className="tx-steps">
        <li className="tx-step confirmed"><span className="tx-dot">✓</span><span className="tx-body"><span className="tx-label">You returned it</span><span className="tx-status mono">{p ? hm(p.anchor.at) : "Done"}</span></span></li>
        <li className="tx-step pending"><span className="tx-dot">2</span><span className="tx-body"><span className="tx-label">The owner confirms it's back</span><span className="tx-status mono">{p ? `Waiting since ${hm(p.anchor.at)}` : "Waiting"}</span></span></li>
        <li className="tx-step waiting"><span className="tx-dot">3</span><span className="tx-body"><span className="tx-label">The contract settles the deposit</span><span className="tx-status mono">Automatic</span></span></li>
      </ol>
      <section className="panel">
        <h2>What if the owner never confirms?</h2>
        <p>Today your deposit stays locked: the contract has no deadline, so a return only counts once the owner accepts it. This is a known limit.</p>
        <p><b>Proposed fix:</b> if the owner hasn't confirmed 24 hours after your return, the return counts anyway and the deposit settles by the same rule. <span className="tag mono">not in today's contract</span></p>
      </section>
      <p className="demo-line mono">
        Demo only: <button type="button" className="link-btn" onClick={ownerConfirm} disabled={demoBusy}>{demoBusy ? "the owner is confirming…" : "have the owner confirm now"}</button>
      </p>
    </Shell>
  );
}

// ---------- 7 · outcome ----------
export function OutcomePage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  if (!d) return <Loading stage="Settled" />;
  const mine = d.rentals.filter((x) => x.settlement && account && x.renter.address.toLowerCase() === account.address.toLowerCase()).at(-1);
  if (!mine?.settlement) {
    return <Shell d={d} stage="Settled"><h1>Not settled <em>yet</em>.</h1><div className="actions"><a className="btn btn-secondary" href={href(`rent/${id}/waiting`)}>See where it stands</a></div></Shell>;
  }
  const s = mine.settlement;
  const cause = s.causeSeq !== null ? d.batches.find((b) => b.seq === s.causeSeq) : null;
  return (
    <Shell d={d} stage="Settled" wide>
      <section className={`ride-hero outcome tier-glow-${s.tier}`}>
        <div>
          <h1>{s.tier === 0 ? <>All {usd(mine.collateral)} are <em>back</em>.</> : Number(s.refund) === 0 ? <>The whole deposit was <em>withheld</em>.</> : <>{usd(s.refund)} back, {usd(s.fee)} <em>withheld</em>.</>}</h1>
          <p className="lead">{s.tier === 0
            ? `Nothing above ${g(d.terms.lightCg)} was recorded during your rental, so the contract returned the whole deposit.`
            : <>During your rental the bike recorded a <span className="shock mono">{g(s.peakCg)}</span> shock{cause ? ` at ${hm(cause.anchor.at)}` : ""}. That is the {TIER_NAMES[s.tier]} level of the rule you accepted, so {usd(s.fee)} went to the owner.</>}</p>
        </div>
        <ObjectImage alert={s.tier > 0} deviceId={d.deviceId} />
      </section>
      <RuleTiers terms={d.terms} highlight={s.tier} />
      <div className="actions">
        <a className="btn btn-primary" href={href(`receipt/${id}/${mine.period}`)}>Receipt</a>
        {s.causeSeq !== null && <a className="btn btn-secondary" href={href(`verify/${id}/${s.causeSeq}`)}>Check the {g(s.peakCg)} reading</a>}
        <a className="btn btn-secondary" href={href("my-rentals")}>My rentals</a>
      </div>
      <p className="hint-line mono">Settled in transaction {shortHex(s.anchor.tx)} at {hm(s.anchor.at)}.</p>
    </Shell>
  );
}
