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
import { day, hm, objectName, shortHex, span, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import "./object-page.css";
import "./site.css";
import "./rent.css";

const STAGES = ["Rule", "Deposit", "Ride", "Return", "Deposit back"] as const;
type Stage = (typeof STAGES)[number];

/** Frame shared by every step: header, the bike, where you are in the path. */
function Shell({ d, stage, children, wide = false }: { d?: ObjectDetail; stage: Stage; children: ReactNode; wide?: boolean }) {
  const at = STAGES.indexOf(stage);
  return (
    <div className="page">
      <SiteHeader />
      <main className={`rent ${wide ? "rent-wide" : ""}`}>
        <div className="rent-top">
          {d && <a className="link back" href={href(`object/${d.id}`)}>{objectName(d)}</a>}
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

const Loading = ({ stage }: { stage: Stage }) => <Shell stage={stage}><p className="lead">Loading the bike…</p></Shell>;

// ---------- 1 · the rule ----------
export function RulePage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  if (!d) return <Loading stage="Rule" />;
  const r = relation(d, account);
  const busy = d.status !== "available" && !r.isOfferedToMe;
  return (
    <Shell d={d} stage="Rule">
      <h1>The rule you <em>accept</em>.</h1>
      <p className="lead">You leave a deposit of {usd(d.terms.collateral)}. When you bring the bike back, the hardest knock of your ride decides how much of it comes back, by this table. Nobody decides it by hand. <span className="test-money">{TEST_MONEY}</span></p>
      <dl className="facts">
        <div><dt>Rental price</dt><dd className="mono">2 dollars an hour</dd><dd className="tag">paid to the owner, separately from the deposit</dd></div>
        <div><dt>Deposit</dt><dd className="mono">{usd(d.terms.collateral)}</dd><dd className="tag">comes back by this table</dd></div>
      </dl>
      <RuleSimulator terms={d.terms} />
      <ul className="fine">
        <li>Only your ride counts: knocks from earlier renters stay on their record.</li>
        <li>The deposit comes back when the owner confirms the bike is back with them.</li>
      </ul>
      {busy ? (
        <p className="notice">This bike is not available right now. <a className="link" href={href("")}>Find another one on the map</a></p>
      ) : (
        <>
          <div className="actions">
            <a className="btn btn-primary btn-lg" href={href(account ? `rent/${id}/deposit` : `rent/${id}/wallet`)}>Accept the rule and continue</a>
          </div>
          <p className="hint-line">By continuing you accept this rule for this rental. You can still back out before you leave the deposit.</p>
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
      <p className="lead">A wallet is the app that holds your money. The deposit leaves from it and comes back to it: Sharify never holds your money or your keys.</p>
      <div className="wallets">
        <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>MetaMask</b><span>Browser extension or mobile app</span></button>
        <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>Another wallet</b><span>WalletConnect</span></button>
      </div>
      <p className="hint-line">{busy ? "Waiting for your wallet…" : "You need a little free test money for network fees (Base Sepolia, a test network)."}</p>
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
      <h1>{state === "done" ? <>Unlocked. Enjoy the <em>ride</em>.</> : <>Leave the <em>deposit</em>.</>}</h1>
      <p className="lead">{state === "done"
        ? `Your ${deposit} are held by the rule, not by the owner. From now on, knocks are recorded under your name.`
        : ready.data
          ? `Your wallet is already set up: it will ask you to confirm ${signatures} times, a few seconds each. Keep this page open.`
          : `First rental from this wallet: it will ask you to confirm ${signatures} times, a few seconds each. Next time it's two. Keep this page open.`} <span className="test-money">{TEST_MONEY}</span></p>
      <div className="deposit">
        <div className="deposit-main">
          {shown.length > 0 && <TxSteps steps={shown} deposit={deposit} explorer={explorer} />}
          {error && <p className="notice error">{error === "You rejected the request in your wallet." ? "You rejected the request in your wallet. Nothing was sent: try again when you're ready." : error}</p>}
          <div className="actions">
            {state === "done"
              ? <a className="btn btn-primary" href={href(`rent/${id}/active`)}>Go to your rental</a>
              : <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : state === "error" ? "Try again"   : `Leave ${deposit}`}</button>}
          </div>
        </div>
        <aside className="deposit-summary" aria-label="What you leave">
          <div className="sum-bike">
            <ObjectImage deviceId={d.deviceId} glow={false} />
            <div>
              <p className="sum-name">{objectName(d)}</p>
              <p className="sum-owner">lent by {d.ownerName ?? shortHex(d.owner.address)}</p>
            </div>
          </div>
          <dl className="sum-lines">
            <div><dt>You leave</dt><dd className="mono big">{deposit}</dd></div>
            <div><dt>Rental price</dt><dd className="mono">2 dollars an hour</dd><dd className="tag">paid to the owner, separately</dd></div>
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
          <p className="kicker">Your rental · {span(r.started.at, null)} so far</p>
          <h1>{c.peakCg === null
            ? <>No readings <em>yet</em>.</>
            : alert ? <>A {TIER_NAMES[c.tier]} knock so far: {usd(c.wouldWithhold)} would be <em>kept</em>.</>
              : <>No knocks so far: all {usd(r.collateral)} would come <em>back</em>.</>}</h1>
          <dl className="facts">
            <div><dt>Deposit</dt><dd className="mono">{usd(r.collateral)}</dd></div>
            <div><dt>Hardest knock</dt><dd className={`mono ${alert ? "shock" : ""}`}>{c.peakCg === null || c.tier === 0 ? "none" : TIER_NAMES[c.tier]}</dd></div>
            <div><dt>Last update from the bike</dt><dd className="mono">{lastBatch ? when(lastBatch.anchor.at) : "any moment now"}</dd></div>
          </dl>
          <RuleTiers terms={d.terms} highlight={c.tier} />
          <div className="actions"><a className="btn btn-primary" href={href(`rent/${id}/return`)}>Return the bike</a></div>
        </div>
        <div className="ride-side">
          <div className="glow" aria-hidden="true"><i className="glow-blue" /><i className="glow-orange" /><i className="grain" /></div>
          {ride.data?.length
            ? <RideMap readings={ride.data} lightCg={d.terms.lightCg} />
            : <ObjectImage alert={alert} deviceId={d.deviceId} />}
          <p className="hint-line">{ride.isError ? "The map of your ride is not available right now. Everything else on this page is up to date." : "Your route is shown only to you."}</p>
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
        <li>Tell the owner it's back. Knocks still count under your name until the owner confirms.</li>
        <li>When the owner confirms, your deposit comes back by itself, by the rule.</li>
      </ol>
      {steps.length > 0 && <TxSteps steps={steps} deposit={usd(d.terms.collateral)} explorer={explorer} />}
      {error && <p className="notice error">{error}</p>}
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : "It's back"}</button>
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
        <li className="tx-step confirmed"><span className="tx-dot">✓</span><span className="tx-body"><span className="tx-label">You returned it</span><span className="tx-status">{p ? when(p.anchor.at) : "Done"}</span></span></li>
        <li className="tx-step pending"><span className="tx-dot">2</span><span className="tx-body"><span className="tx-label">The owner confirms it's back</span><span className="tx-status">Waiting</span></span></li>
        <li className="tx-step waiting"><span className="tx-dot">3</span><span className="tx-body"><span className="tx-label">Your deposit comes back by the rule</span><span className="tx-status">Automatic</span></span></li>
      </ol>
      <section className="panel">
        <h2>What if the owner doesn't confirm?</h2>
        <p>The owner sees your return on their page. Your deposit waits for their confirmation; nobody else can take it, and the owner can't change the rule.</p>
      </section>
      <p className="demo-line">
        Demo only: <button type="button" className="link-btn" onClick={ownerConfirm} disabled={demoBusy}>{demoBusy ? "the owner is confirming…" : "have the owner confirm now"}</button>
      </p>
    </Shell>
  );
}

// ---------- 7 · outcome ----------
export function OutcomePage({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  if (!d) return <Loading stage="Deposit back" />;
  const mine = d.rentals.filter((x) => x.settlement && account && x.renter.address.toLowerCase() === account.address.toLowerCase()).at(-1);
  if (!mine?.settlement) {
    return <Shell d={d} stage="Deposit back"><h1>Not settled <em>yet</em>.</h1><div className="actions"><a className="btn btn-secondary" href={href(`rent/${id}/waiting`)}>See where it stands</a></div></Shell>;
  }
  const s = mine.settlement;
  const cause = s.causeSeq !== null ? d.batches.find((b) => b.seq === s.causeSeq) : null;
  return (
    <Shell d={d} stage="Deposit back" wide>
      <section className={`ride-hero outcome tier-glow-${s.tier}`}>
        <div>
          <h1>{s.tier === 0 ? <>Your whole deposit is <em>back</em>.</> : Number(s.refund) === 0 ? <>The whole deposit was <em>kept</em>.</> : <>{usd(s.refund)} back, {usd(s.fee)} <em>kept</em>.</>}</h1>
          <p className="lead">{s.tier === 0
            ? `No knocks were recorded during your ride, so all ${usd(mine.collateral)} came back to you.`
            : <>During your ride the bike recorded a <span className="shock">{TIER_NAMES[s.tier]}</span> knock{cause ? ` ${when(cause.anchor.at)}` : ""}. By the rule you accepted, {usd(s.fee)} went to the owner.</>}</p>
        </div>
        <ObjectImage alert={s.tier > 0} deviceId={d.deviceId} />
      </section>
      <RuleTiers terms={d.terms} highlight={s.tier} />
      <div className="actions">
        <a className="btn btn-primary" href={href(`receipt/${id}/${mine.period}`)}>Receipt</a>
        {s.causeSeq !== null && <a className="btn btn-secondary" href={href(`verify/${id}/${s.causeSeq}`)}>Check that knock yourself</a>}
        <a className="btn btn-secondary" href={href("my-rentals")}>My rentals</a>
      </div>
      <p className="hint-line" title={`${day(s.anchor.at)}, ${hm(s.anchor.at)}`}>Settled {when(s.anchor.at)}, by the rule.</p>
    </Shell>
  );
}
