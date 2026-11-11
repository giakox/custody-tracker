// The renting path: rule → wallet → deposit → ride → return → waiting → outcome.
// Same structure and words as the approved wireframes, in the bike page's style.
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { demoEndRental, getBalance, getNetwork, getObject, getReadings, isWalletReady, requestReturn, startRental } from "../data/api";
import { DataError, type ObjectDetail, type Party, type Reading, type TxStep } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { RuleTiers } from "../components/RuleTiers";
import { TierMeter } from "../components/TierMeter";
import { RuleSimulator } from "../components/RuleSimulator";
import { TxSteps } from "../components/TxSteps";
import { RideMap } from "../components/RideMap";
import { CASE_IMAGE, ObjectImage } from "../components/ObjectImage";
import { day, hm, objectName, shortHex, span, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import "./object-page.css";
import "./site.css";
import "./rent.css";

const STAGES = ["Rule", "Deposit", "Ride", "Return", "Deposit back"] as const;
type Stage = (typeof STAGES)[number];

/** Frame shared by every step: header, the bike, where you are in the path. With `side`, the step sits
 *  beside a card that stays in view and holds what you are renting (Stripe Checkout, Airbnb "Confirm and pay"). */
function Shell({ d, stage, children, wide = false, side }: { d?: ObjectDetail; stage: Stage; children: ReactNode; wide?: boolean; side?: ReactNode }) {
  const at = STAGES.indexOf(stage);
  return (
    <div className="page">
      <SiteHeader />
      <main className={`rent ${wide || side ? "rent-wide" : ""}`}>
        <div className="rent-top">
          {d && <a className="link back" href={href(`object/${d.id}`)}>{objectName(d)}</a>}
          <ol className="rent-progress" aria-label="Rental steps">
            {STAGES.map((s, i) => <li key={s} className={i < at ? "done" : i === at ? "current" : ""} aria-current={i === at ? "step" : undefined}>{s}</li>)}
          </ol>
        </div>
        {side ? <div className="rent-frame"><div className="rent-step">{children}</div><aside className="rent-side" aria-label="Your rental">{side}</aside></div> : children}
      </main>
      <DemoSwitcher />
    </div>
  );
}

/** What you are renting, always the same card: the bike, who lends it, the money; the step's action goes inside. */
function TripCard({ d, lead, children }: { d: ObjectDetail; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="trip">
      <div className="trip-bike">
        {CASE_IMAGE && <img className="trip-photo" src={CASE_IMAGE.src} alt="" />}
        <div>
          <p className="trip-name">{objectName(d)}</p>
          <p className="trip-owner">lent by {d.ownerName ?? shortHex(d.owner.address)}</p>
        </div>
      </div>
      {lead}
      <dl className="trip-lines">
        {!lead && <div><dt>Deposit</dt><dd>{usd(d.terms.collateral)}</dd></div>}
        <div><dt>Price</dt><dd>2 dollars an hour</dd></div>
      </dl>
      <p className="trip-note">The price is paid to the owner, separately. The deposit comes back by the rule. {TEST_MONEY}</p>
      {children && <div className="trip-act">{children}</div>}
    </div>
  );
}

/** True on screens wide enough for the ride card to sit over the map. */
function useWide() {
  const q = "(min-width: 861px)";
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const on = () => setWide(m.matches); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return wide;
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
    <Shell d={d} stage="Rule" side={
      <TripCard d={d}>
        {busy ? (
          <p className="notice">This bike is not available right now. <a className="link" href={href("")}>Find another one on the map</a></p>
        ) : (
          <>
            <a className="btn btn-primary btn-lg" href={href(account ? `rent/${id}/deposit` : `rent/${id}/wallet`)}>Accept the rule and continue</a>
            <p className="hint-line">You can still back out before you leave the deposit.</p>
          </>
        )}
      </TripCard>
    }>
      <h1>The rule you <em>accept</em>.</h1>
      <p className="lead">You leave a deposit of {usd(d.terms.collateral)}. When you bring the bike back, the hardest knock of your ride decides how much of it comes back. Nobody decides it by hand. Try it:</p>
      <RuleSimulator terms={d.terms} />
      <ul className="fine">
        <li>Only your ride counts: knocks from earlier renters stay on their record.</li>
        <li>The deposit comes back when the owner confirms the bike is back with them.</li>
      </ul>
    </Shell>
  );
}

// ---------- 2 · wallet ----------
export function WalletPage({ id }: { id: number }) {
  const { d } = useBike(id);
  const isMock = !!useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity }).data?.isMock;
  const { connect } = useViewer();
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); await connect(); window.location.hash = `#/rent/${id}/deposit`; };
  return (
    <Shell d={d} stage="Deposit" side={d && <TripCard d={d} />}>
      <h1>Connect a <em>wallet</em>.</h1>
      <p className="lead">{isMock
        ? "A wallet is the app that holds your money. For this demo we made you a test wallet, with test money only. In the live version it is your own wallet: the deposit leaves from it and comes back to it, and Sharify never holds your money or your keys."
        : "A wallet is the app that holds your money. The deposit leaves from it and comes back to it: Sharify never holds your money or your keys."}</p>
      <div className="wallets">
        {isMock
          ? <button type="button" className="wallet-opt primary" onClick={go} disabled={busy}><b>Use the demo test wallet</b><span>Test money only. Nothing real is used, and it is not your wallet.</span></button>
          : <>
            <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>MetaMask</b><span>Browser extension or mobile app</span></button>
            <button type="button" className="wallet-opt" onClick={go} disabled={busy}><b>Another wallet</b><span>WalletConnect</span></button>
          </>}
      </div>
      <p className="hint-line">{busy ? "Waiting for your wallet…" : isMock ? "In the live version you connect your own wallet." : "You need a little free test money for network fees (Base Sepolia, a test network)."}</p>
      <img className="step-photo" src="./img/day/unlock-phone.jpg" alt="Hands holding a phone next to a parked city bike" />
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
    <Shell d={d} stage="Deposit" side={
      <TripCard d={d} lead={<p className="trip-big"><span>You leave</span><b>{deposit}</b></p>}>
        <p className="hint-line">It comes back by the rule you accepted. <a className="link" href={href(`rent/${id}`)}>Read it again</a></p>
      </TripCard>
    }>
      <h1>{state === "done" ? <>Unlocked. Enjoy the <em>ride</em>.</> : <>Leave the <em>deposit</em>.</>}</h1>
      {!account ? <>
        <p className="lead">The deposit leaves from a wallet and comes back to it. Connect one first.</p>
        <div className="actions"><a className="btn btn-primary" href={href(`rent/${id}/wallet`)}>Connect a wallet</a></div>
      </> : <>
      <p className="lead">{state === "done"
        ? `Your ${deposit} are held by the rule, not by the owner. From now on, knocks are recorded under your name.`
        : ready.data
          ? `Your wallet is already set up: it will ask you to confirm ${signatures} times, a few seconds each. Keep this page open.`
          : `First rental from this wallet: it will ask you to confirm ${signatures} times, a few seconds each. Next time it's two. Keep this page open.`}</p>
      <div className="deposit-main">
          {shown.length > 0 && <TxSteps steps={shown} deposit={deposit} explorer={explorer} />}
          {error && <p className="notice error">{error === "You rejected the request in your wallet." ? "You rejected the request in your wallet. Nothing was sent: try again when you're ready." : error}</p>}
          <div className="actions">
            {state === "done"
              ? <a className="btn btn-primary" href={href(`rent/${id}/active`)}>Go to your rental</a>
              : <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : state === "error" ? "Try again"   : `Leave ${deposit}`}</button>}
          </div>
        </div>
      </>}
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
  const wideScreen = useWide();
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
      <section className={`ride-live tier-glow-${alert ? c.tier : 0}`} aria-labelledby="ride-title">
        <div className="ride-stage">
          {ride.data?.length
            ? <RideMap readings={ride.data} lightCg={d.terms.lightCg} padLeft={wideScreen ? 500 : 0} />
            : <ObjectImage alert={alert} deviceId={d.deviceId} glow={false} />}
          <div className="ride-card">
            <p className="live-kicker"><i className="pulse" aria-hidden="true" />Your rental · {span(r.started.at, null)} so far</p>
            <h1 id="ride-title">{c.peakCg === null
              ? <>No readings <em>yet</em>.</>
              : alert ? <>A {TIER_NAMES[c.tier]} knock: {usd(c.wouldWithhold)} would be <em>kept</em>.</>
                : <>No knocks: all {usd(r.collateral)} would come <em>back</em>.</>}</h1>
            <p className="ride-meta"><TierMeter tier={c.peakCg === null ? 0 : c.tier} showNone /><span>{usd(r.collateral)} deposit · the bike last reported {lastBatch ? when(lastBatch.anchor.at) : "a moment ago"}</span></p>
            <div className="actions"><a className="btn btn-primary" href={href(`rent/${id}/return`)}>Return the bike</a></div>
          </div>
        </div>
        <p className="hint-line">{ride.isError ? "The map of your ride is not available right now. Everything else on this page is up to date." : "Your route is shown only to you."}</p>
      </section>
      <section className="ride-rule" aria-labelledby="ride-rule-title">
        <h2 id="ride-rule-title">The rule you accepted</h2>
        <RuleTiers terms={d.terms} highlight={c.tier} />
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
    <Shell d={d} stage="Return" side={
      <TripCard d={d}>
        <button type="button" className="btn btn-primary btn-lg" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : "It's back"}</button>
        <a className="btn btn-secondary" href={href(`rent/${id}/active`)}>Back to your rental</a>
      </TripCard>
    }>
      <h1>Return the <em>bike</em>.</h1>
      <ol className="numbered tiles">
        <li><span><b>Leave it where the owner asked</b>, locked.</span></li>
        <li><span><b>Tell the owner it's back</b> with the button. Knocks still count under your name until the owner confirms.</span></li>
        <li><span><b>Your deposit comes back by itself</b>, by the rule, when the owner confirms.</span></li>
      </ol>
      {steps.length > 0 && <TxSteps steps={steps} deposit={usd(d.terms.collateral)} explorer={explorer} />}
      {error && <p className="notice error">{error}</p>}
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
    <Shell d={d} stage="Return" side={
      <TripCard d={d}>
        <p className="demo-line">Demo only: <button type="button" className="link-btn" onClick={ownerConfirm} disabled={demoBusy}>{demoBusy ? "the owner is confirming…" : "have the owner confirm now"}</button></p>
      </TripCard>
    }>
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
    <Shell d={d} stage="Deposit back" side={
      <TripCard d={d} lead={<p className="trip-big"><span>Back to you</span><b>{usd(s.refund)}</b>{s.tier > 0 && <span className="shock">{usd(s.fee)} kept for the {TIER_NAMES[s.tier]} knock</span>}</p>}>
        <a className="btn btn-primary" href={href(`receipt/${id}/${mine.period}`)}>Receipt</a>
        {s.causeSeq !== null && <a className="btn btn-secondary" href={href(`verify/${id}/${s.causeSeq}`)}>Check that knock yourself</a>}
        <p className="hint-line" title={`${day(s.anchor.at)}, ${hm(s.anchor.at)}`}>Settled {when(s.anchor.at)}, by the rule. <a className="link" href={href("my-rentals")}>My rentals</a></p>
      </TripCard>
    }>
      <h1>{s.tier === 0 ? <>Thanks for riding. Your whole deposit is <em>back</em>.</> : Number(s.refund) === 0 ? <>The whole deposit was <em>kept</em>.</> : <>{usd(s.refund)} back, {usd(s.fee)} <em>kept</em>.</>}</h1>
      <p className="lead">{s.tier === 0
        ? `No knocks were recorded during your ride, so all ${usd(mine.collateral)} came back to you.`
        : <>During your ride the bike recorded a <span className="shock">{TIER_NAMES[s.tier]}</span> knock{cause ? ` ${when(cause.anchor.at)}` : ""}. By the rule you accepted, {usd(s.fee)} went to the owner.</>}</p>
      {s.tier === 0
        ? <img className="step-photo" src="./img/day/return-smile.jpg" alt="A renter handing a bike back to its owner, both smiling" />
        : <RuleTiers terms={d.terms} highlight={s.tier} />}
    </Shell>
  );
}
