// The renting path in v2: wallet → deposit → ride → return → waiting → outcome.
// Logic, queries, source calls, step order and words are copied unchanged from the old RentPages.tsx (removed in lotto 5, see git history);
// only the markup is new.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { demoEndRental, getBalance, getNetwork, getObject, getReadings, isWalletReady, requestReturn, startRental } from "../data/api";
import { DataError, type ObjectDetail, type Party, type Reading, type TxStep } from "../data/types";
import { RideMap } from "../components/RideMap";
import { SpotMap } from "../components/SpotMap";
import { DEMO_SPOT } from "../data/mock/fleet";
import { day, g, hm, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { relation, useViewer } from "../ui/viewer";
import { priceOf } from "./price";
import { Button } from "./ui";
import { KnockList, RuleTry, knockRows } from "./rule";
import { Bill, Checkout, ErrorLine, Spinner, StepList, type Stage } from "./checkout";

function useBike(id: number) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000 });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  return { d: q.data, explorer: net.data?.explorer ?? null, error: q.error };
}

const Loading = ({ stage }: { stage: Stage }) => (
  <Checkout stage={stage} title="Loading the bike…"><div className="v2-co-wait"><Spinner size={40} /></div></Checkout>
);

const tripNote = <>{TEST_MONEY}</>;

// ---------- 2 · wallet ----------
export function WalletV2({ id }: { id: number }) {
  const { d } = useBike(id);
  const isMock = !!useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity }).data?.isMock;
  const { connect } = useViewer();
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); await connect(); window.location.hash = `#/rent/${id}/deposit`; };
  return (
    <Checkout stage="Deposit" d={d} title="Connect a wallet."
      lead="The deposit leaves your wallet and comes back to it. Sharify never holds your money."
      action={isMock ? <Button full onClick={go} disabled={busy}>{busy ? <><Spinner size={18} />Connecting…</> : "Use the demo test wallet"}</Button> : undefined}
      note={tripNote}>
      {!isMock && (
        <div className="v2-co-wallets">
          <button type="button" className="v2-co-wallet" onClick={go} disabled={busy}><span className="v2-body v2-strong">MetaMask</span><span className="v2-body v2-muted">Browser extension or mobile app</span></button>
          <button type="button" className="v2-co-wallet" onClick={go} disabled={busy}><span className="v2-body v2-strong">Another wallet</span><span className="v2-body v2-muted">WalletConnect</span></button>
          <p className="v2-body v2-muted">You need a little free test money for network fees (Base Sepolia, a test network).</p>
        </div>
      )}
      <section aria-labelledby="ahead-title">
        <h2 className="v2-co-sub" id="ahead-title">Your wallet will ask three times</h2>
        <ol className="v2-co-list">
          <li><span><span className="v2-strong">Take the bike</span><span className="v2-co-li-sub">You accept the owner's offer</span></span></li>
          <li><span><span className="v2-strong">Allow deposits</span><span className="v2-co-li-sub">Only the first time</span></span></li>
          <li><span><span className="v2-strong">Leave {d ? usd(d.terms.collateral) : "the deposit"}</span><span className="v2-co-li-sub">To the rule, not to the owner</span></span></li>
        </ol>
      </section>
    </Checkout>
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

export function DepositV2({ id }: { id: number }) {
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
  const action = !account ? <Button full href={href(`rent/${id}/wallet`)}>Connect a wallet</Button>
    : state === "done" ? <Button full href={href(`rent/${id}/active`)}>Go to your rental</Button>
    : <Button full onClick={run} disabled={state === "running"}>{state === "running" ? <><Spinner size={18} />Confirm in your wallet…</> : state === "error" ? "Try again" : `Leave ${deposit}`}</Button>;
  return (
    <Checkout stage="Deposit" d={d} title={state === "done" ? "Unlocked. Enjoy the ride." : "Leave the deposit."}
      lead={!account ? "Connect a wallet first."
        : state === "done" ? `The rule holds your ${deposit}. Knocks now count under your name.`
        : `Your wallet asks ${signatures} times. Keep this page open.`}
      action={action}
      note={<>{state !== "done" && <><a className="v2-textlink" href={href(`rent/${id}`)}>The rule</a> · </>}{tripNote}</>}>
      {account && (
        <>
          <Bill rows={[{ k: state === "done" ? "Held by the rule" : "You leave", v: deposit, strong: true }]} />
          {shown.length > 0 && <StepList steps={shown} deposit={deposit} explorer={explorer} />}
          {error && <ErrorLine>{error === "You rejected the request in your wallet." ? "You rejected the request in your wallet. Nothing was sent: try again when you're ready." : error}</ErrorLine>}
        </>
      )}
    </Checkout>
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

/** Elapsed time as a clock: "12:04", or "1:12:04" past the hour. */
function clock(fromMs: number) {
  const s = Math.max(0, Math.floor((Date.now() - fromMs) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

export function ActiveV2({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  const ride = useRideReadings(d);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  if (!d) return <Loading stage="Ride" />;
  const r = d.activeRental;
  if (!r || !relation(d, account).isCustodian) {
    return <Checkout stage="Ride" d={d} title="No rental in progress." lead="You don't have this bike right now." action={<Button full href={href("")}>Find a bike</Button>} />;
  }
  const c = r.current!;
  const alert = c.tier > 0;
  const lastBatch = d.batches.filter((b) => b.period === r.period).at(-1);
  const dep = Number(r.collateral);
  const kept = c.tier ? Number(c.wouldWithhold) : 0;
  const back = dep - kept;
  const rows = knockRows(d.terms);
  const current = c.peakCg === null ? -1 : c.tier;
  return (
    <Checkout stage="Ride" d={d}
      title={c.peakCg === null ? "No readings yet." : alert ? `A ${TIER_NAMES[c.tier]} knock: ${usd(c.wouldWithhold)} would be kept.` : `No knocks: all ${usd(r.collateral)} would come back.`}
      action={<Button full href={href(`rent/${id}/return`)}>Return the bike</Button>}
      note={ride.isError ? "Your route map is not available right now." : "Only you see your route."}>
      <div className="v2-ride-stats">
        <div className="v2-ride-stat">
          <p className="v2-small v2-muted">Riding for</p>
          <p className="v2-ride-time" aria-label={`${clock(r.started.at)} so far`}>{clock(r.started.at)}</p>
        </div>
        <div className="v2-ride-stat">
          <p className="v2-small v2-muted">Hardest knock</p>
          <p className="v2-ride-peak-g">{c.peakCg === null ? "None yet" : g(c.peakCg)}</p>
          <p className="v2-small">{c.peakCg === null ? "No readings yet" : c.tier ? `${TIER_NAMES[c.tier][0].toUpperCase()}${TIER_NAMES[c.tier].slice(1)} knock` : "No knock"}</p>
        </div>
        <p className="v2-small v2-muted v2-ride-seen">Last report {lastBatch ? when(lastBatch.anchor.at) : "a moment ago"}</p>
      </div>
      <section aria-labelledby="ride-now">
        <h2 className="v2-co-sub" id="ride-now">If you returned it now</h2>
        <Bill rows={[{ k: "Back to you", v: usd(String(back)), strong: true }, ...(kept > 0 ? [{ k: `Kept, ${TIER_NAMES[c.tier]} knock`, v: usd(String(kept)) }] : []), { k: "Deposit", v: usd(r.collateral) }]} />
      </section>
      {ride.data?.length ? <div className="v2-co-map"><RideMap readings={ride.data} lightCg={d.terms.lightCg} /></div> : null}
      <section aria-labelledby="ride-rule-title">
        <h2 className="v2-co-sub" id="ride-rule-title">The rule you accepted</h2>
        <KnockList rows={rows} current={current >= 0 ? current : undefined} className="v2-knocks-grid" />
      </section>
    </Checkout>
  );
}

// ---------- 5 · return ----------
export function ReturnV2({ id }: { id: number }) {
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
    <Checkout stage="Return" d={d} title="Return the bike."
      action={<Button full onClick={run} disabled={state === "running"}>{state === "running" ? <><Spinner size={18} />Working…</> : state === "error" ? "Try again" : "It's back"}</Button>}
      note={<a className="v2-textlink" href={href(`rent/${id}/active`)}>Back to your rental</a>}>
      <figure>
        <div className="v2-co-pair">
          <img src="./img/day/bocconi-park.jpg" alt="The spot: a bike rack outside Bocconi, people walking past" />
          <div className="v2-co-map"><SpotMap spot={DEMO_SPOT} label="Leave it here" /></div>
        </div>
        <figcaption className="v2-gap-16"><p className="v2-body v2-strong">The rack outside Bocconi</p><p className="v2-small v2-muted">Where the owner wants it back</p></figcaption>
      </figure>
      <ol className="v2-co-list">
        <li><span><span className="v2-strong">Lock it to the rack</span></span></li>
        <li><span><span className="v2-strong">Press "It's back"</span><span className="v2-co-li-sub">Knocks count as yours until the owner confirms</span></span></li>
        <li><span><span className="v2-strong">The deposit comes back</span><span className="v2-co-li-sub">By the rule, when the owner confirms</span></span></li>
      </ol>
      {steps.length > 0 && <StepList steps={steps} deposit={usd(d.terms.collateral)} explorer={explorer} />}
      {error && <ErrorLine>{error}</ErrorLine>}
    </Checkout>
  );
}

// ---------- 6 · waiting for the owner ----------
export function WaitingV2({ id }: { id: number }) {
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
    <Checkout stage="Return" d={d} title="Waiting for the owner to confirm."
      lead="Nothing else to do on your side."
      note={<>Demo only: <button type="button" className="v2-btn v2-btn-link" onClick={ownerConfirm} disabled={demoBusy}>{demoBusy ? "the owner is confirming…" : "have the owner confirm now"}</button></>}>
      <div className="v2-co-wait"><Spinner size={48} /></div>
      <Bill rows={[{ k: "Returned", v: p ? when(p.anchor.at) : "just now" }, { k: "Held by the rule", v: usd(d.terms.collateral), strong: true }]} />
      <p className="v2-small v2-muted">Nobody can take the deposit while you wait: not the owner, not Sharify.</p>
    </Checkout>
  );
}

// ---------- 7 · outcome ----------
export function OutcomeV2({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  const mineP = d?.rentals.filter((x) => x.settlement && account && x.renter.address.toLowerCase() === account.address.toLowerCase()).at(-1);
  const seqs = d && mineP ? d.batches.filter((x) => x.period === mineP.period).map((x) => x.seq) : [];
  const ride = useQuery({ queryKey: ["ride-done", id, seqs.join(",")], queryFn: async () => (await Promise.all(seqs.map((q) => getReadings(id, q)))).flat(), enabled: seqs.length > 0, retry: false });
  if (!d) return <Loading stage="Deposit back" />;
  const mine = d.rentals.filter((x) => x.settlement && account && x.renter.address.toLowerCase() === account.address.toLowerCase()).at(-1);
  if (!mine?.settlement) {
    return <Checkout stage="Deposit back" d={d} title="Not settled yet." action={<Button full href={href(`rent/${id}/waiting`)}>See where it stands</Button>} />;
  }
  const s = mine.settlement;
  const cause = s.causeSeq !== null ? d.batches.find((b) => b.seq === s.causeSeq) : null;
  const price = priceOf(mine, d);
  return (
    <Checkout stage="Deposit back" d={d}
      title={s.tier === 0 ? "Thanks for riding. Your whole deposit is back." : "Thanks for riding. The rule settled it."}
      lead={s.tier === 0
        ? `No knocks were recorded during your ride, so all ${usd(mine.collateral)} came back to you.`
        : `A ${TIER_NAMES[s.tier]} knock${cause ? ` ${when(cause.anchor.at)}` : ""}: ${usd(s.fee)} went to the owner.`}
      action={<Button full href={href(`receipt/${id}/${mine.period}`)}>Receipt</Button>}
      note={<span title={`${day(s.anchor.at)}, ${hm(s.anchor.at)}`}>Settled {when(s.anchor.at)}, by the rule. {s.causeSeq !== null && <><a className="v2-textlink" href={href(`verify/${id}/${s.causeSeq}`)}>Check that knock yourself</a> · </>}<a className="v2-textlink" href={href("my-rentals")}>My rentals</a></span>}>
      <p className="v2-big">{usd(s.refund)} back</p>
      <Bill rows={[
        { k: "Deposit", v: usd(mine.collateral) },
        { k: s.tier > 0 ? `Kept, ${TIER_NAMES[s.tier]} knock` : "Kept", v: usd(s.fee) },
        { k: "Back to you", v: usd(s.refund), strong: true },
        { k: "Rental price, paid apart", v: usd(price.amount) },
      ]} />
      {ride.data?.length
        ? <div><div className="v2-co-map"><RideMap readings={ride.data} lightCg={d.terms.lightCg} /></div><p className="v2-body v2-muted v2-gap-8">Your ride{s.tier ? ", the knock in black" : ""}. Shown only to you.</p></div>
        : null}
    </Checkout>
  );
}

// ---------- 1 · the rule ----------
export function RuleV2({ id }: { id: number }) {
  const { d } = useBike(id);
  const { account } = useViewer();
  if (!d) return <Loading stage="Rule" />;
  const r = relation(d, account);
  const busy = d.status !== "available" && !r.isOfferedToMe;
  return (
    <Checkout stage="Rule" d={d} title="The rule you accept."
      lead={`Leave ${usd(d.terms.collateral)}. The hardest knock of your ride decides how much comes back.`}
      action={busy ? undefined : <Button full href={href(account ? `rent/${id}/deposit` : `rent/${id}/wallet`)}>Accept the rule and continue</Button>}
      note={busy ? undefined : <>You can back out until you leave the deposit.</>}>
      {busy && <p className="v2-body">This bike is not available right now. <a className="v2-textlink" href={href("")}>Find another one on the map</a></p>}
      <RuleTry terms={d.terms} id="rule-try" grid />
    </Checkout>
  );
}
