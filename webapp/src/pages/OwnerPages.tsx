// Owner side: My objects, confirming a return, adding an object. No glow here: the owner's view is a
// list of things to manage, not one object's live state.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { addObject, confirmReturn, getNetwork, getObject, listObjects, lookupRecorder } from "../data/api";
import { DataError, type NewObject, type ObjectDetail, type RecorderInfo, type Terms, type TxStep } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { TierMeter } from "../components/TierMeter";
import { CASE_IMAGE } from "../components/ObjectImage";
import { TxSteps } from "../components/TxSteps";
import { RuleTiers } from "../components/RuleTiers";
import { TubeRecorder } from "../components/TubeRecorder";
import { day, hm, nameOf, objectName, span, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { priceOf } from "./MyRentalsPages";
import "./object-page.css";
import "./site.css";
import "./rent.css";
import "./owner.css";

function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="page">
      <SiteHeader />
      <main className={`rent ${wide ? "rent-wide" : ""}`}>{children}</main>
      <DemoSwitcher />
    </div>
  );
}

const sum = (xs: string[]) => String(Math.round(xs.reduce((s, x) => s + Number(x), 0) * 100) / 100);

function useOwned() {
  const { account, ready } = useViewer();
  const q = useQuery({
    queryKey: ["owned", account?.address],
    enabled: !!account,
    refetchInterval: 4_000,
    queryFn: async () => {
      const all = await Promise.all((await listObjects()).map((o) => getObject(o.id)));
      return all.filter((d) => d.owner.address.toLowerCase() === account!.address.toLowerCase());
    },
  });
  return { account, ready, owned: q.data, loading: q.isPending && !!account };
}

// ---------- My objects ----------
export function MyObjectsPage() {
  const { account, ready, owned, loading } = useOwned();
  const { connect } = useViewer();
  if (ready && !account) {
    return (
      <Page>
        <h1>Your <em>bikes</em>.</h1>
        <p className="lead">Connect the wallet you rent out with to see your bikes, returns to confirm and what you earned.</p>
        <div className="actions"><button type="button" className="btn btn-primary" onClick={connect}>Connect wallet</button></div>
      </Page>
    );
  }
  const returns = (owned ?? []).filter((d) => d.pendingHandoff?.to.role === "owner");
  const settled = (owned ?? []).flatMap((d) => d.rentals.filter((r) => r.settlement).map((r) => ({ d, r })));
  const income = sum(settled.map(({ d, r }) => priceOf(r, d).amount));
  const fees = sum(settled.map(({ r }) => r.settlement!.fee));
  return (
    <Page wide>
      <div className="owner-head">
        <h1>Your <em>bikes</em>.</h1>
        {owned && owned.length > 0 && <a className="btn btn-primary" href={href("add/1")}>Add your bike</a>}
      </div>
      {loading && <p className="lead">Loading your bikes…</p>}

      {returns.map((d) => (
        <section key={d.id} className="panel to-confirm">
          <p className="kicker">Return to confirm</p>
          <h2>{nameOf(d.pendingHandoff!.from)} wants to return {objectName(d, false)}.</h2>
          <p>Returned {when(d.pendingHandoff!.anchor.at)}. Check it's back with you, then confirm: the deposit is settled by the rule, by itself.</p>
          <div className="actions"><a className="btn btn-primary" href={href(`confirm-return/${d.id}`)}>Confirm you have it back</a></div>
        </section>
      ))}

      {owned && owned.length === 0 && (
        <section className="empty-invite">
          <img className="invite-photo" src="./img/day/owner-shop.jpg" alt="A bike shop owner standing in his doorway, bikes parked outside" />
          <h2>Rent out your first <em>bike</em>.</h2>
          <p>You set the hourly price and the deposit. If a renter drops it, the rule you both accepted decides the fee: no argument at the counter.</p>
          <a className="btn btn-primary btn-lg" href={href("add/1")}>Add your first bike</a>
        </section>
      )}

      {owned && owned.length > 0 && (
        <>
          <dl className="kpis">
            <div><dt>Rental income</dt><dd className="mono">{usd(income)}</dd><dd className="sub">{settled.length} rentals at 2 dollars an hour, paid to you separately</dd></div>
            <div><dt>Kept for knocks</dt><dd className="mono">{usd(fees)}</dd><dd className="sub">From renters' deposits, by the rule. Already in your wallet.</dd></div>
            <div><dt>Bikes</dt><dd className="mono">{owned.length}</dd><dd className="sub">{owned.filter((d) => d.custodian.address.toLowerCase() !== d.owner.address.toLowerCase()).length} with a renter now</dd></div>
          </dl>

          <section className="objects">
            <h2>Your bikes</h2>
            <ol>
              {owned.map((d) => <ObjectRow key={d.id} d={d} />)}
            </ol>
          </section>
        </>
      )}
    </Page>
  );
}

function ObjectRow({ d }: { d: ObjectDetail }) {
  const last = d.rentals.filter((r) => r.settlement && r.settlement.tier > 0).at(-1)?.settlement ?? null;
  const status = d.pendingHandoff?.to.role === "owner" ? `${nameOf(d.pendingHandoff.from)} is returning it`
    : d.status === "rented" ? `Out with ${nameOf(d.custodian)}, ${span(d.activeRental!.started.at, null)}`
      : d.status === "handoff-pending" ? `Offered to ${nameOf(d.pendingHandoff!.to)}`
        : d.status === "held-without-deposit" ? `${nameOf(d.custodian)} has it without a deposit` : "Available";
  return (
    <li>
      <a className="obj-row" href={href(`object/${d.id}`)}>
        {CASE_IMAGE && <img className="obj-photo" src={CASE_IMAGE.src} alt="" />}
        <span className="obj-name">{objectName(d)}</span>
        <span className={`obj-status ${d.status === "available" ? "" : "busy"}`}>{status}</span>
        <span className="obj-shock">{last ? <><TierMeter tier={last.tier} /><span className="shock">last a {TIER_NAMES[last.tier]} knock</span></> : <span className="none">never dropped</span>}</span>
        <span className="obj-count">{d.rentals.length === 1 ? "1 rental" : `${d.rentals.length} rentals`}</span>
      </a>
    </li>
  );
}

// ---------- Confirm a return ----------
export function ConfirmReturnPage({ id }: { id: number }) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000 });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const qc = useQueryClient();
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const d = q.data;
  // the rental being returned stays in view after it settles
  const [period, setPeriod] = useState<number | null>(null);
  useEffect(() => { if (d?.activeRental && period === null) setPeriod(d.activeRental.period); }, [d, period]);
  if (!d) return <Page><p className="lead">Loading the bike…</p></Page>;
  const r = d.rentals.find((x) => x.period === (period ?? d.activeRental?.period));
  if (!r || (!d.pendingHandoff && state === "idle" && !r.settlement)) {
    return (
      <Page>
        <h1>Nothing to <em>confirm</em>.</h1>
        <p className="lead">Nobody is returning {objectName(d, false)} right now.</p>
        <div className="actions"><a className="btn btn-secondary" href={href("my-objects")}>My bikes</a></div>
      </Page>
    );
  }
  const run = async () => {
    setState("running"); setError(null);
    try { await confirmReturn(id, setSteps); setState("done"); }
    catch (e) { setState("error"); setError(e instanceof DataError ? e.message : String(e)); }
    await qc.invalidateQueries();
  };
  const s = r.settlement;
  const c = r.current;
  const peak = s ? s.peakCg : c?.peakCg ?? null;
  const tier = s ? s.tier : c?.tier ?? 0;
  const fee = s ? s.fee : c?.wouldWithhold ?? "0";
  const price = priceOf(r, d);
  return (
    <Page>
      <p><a className="link back" href={href("my-objects")}>My bikes</a></p>
      {!s && <img className="step-photo" src="./img/day/return-smile.jpg" alt="A renter handing a bike back to its owner, both smiling" />}
      <h1>{s ? (s.tier ? <>Done: {usd(s.fee)} to you, {usd(s.refund)} back to <em>{nameOf(r.renter)}</em>.</> : <>Done: all {usd(s.refund)} back to <em>{nameOf(r.renter)}</em>.</>)
        : <>Do you have {objectName(d, false)} <em>back</em>?</>}</h1>
      {!s && <p className="lead">{nameOf(r.renter)} returned it {d.pendingHandoff ? when(d.pendingHandoff.anchor.at) : ""}. Confirm only when it is really with you. You don't decide the fee: the hardest knock of the ride does, by the rule.</p>}
      <dl className="facts">
        <div><dt>Rental</dt><dd className="mono">{nameOf(r.renter)}, {span(r.started.at, d.periods[r.period]?.end?.at ?? d.pendingHandoff?.anchor.at ?? null)}</dd><dd className="tag" title={`${day(r.started.at)}, ${hm(r.started.at)}`}>started {when(r.started.at)}</dd></div>
        <div><dt>Hardest knock</dt><dd className={`mono ${tier ? "shock" : ""}`}>{peak === null || !tier ? "none" : TIER_NAMES[tier]}</dd></div>
        <div><dt>To you, for the knock</dt><dd className="mono">{tier ? usd(fee) : "nothing"}</dd></div>
        <div><dt>Rental price</dt><dd className="mono">{usd(price.amount)}</dd><dd className="tag">paid to you separately</dd></div>
      </dl>
      <RuleTiers terms={d.terms} highlight={tier as 0 | 1 | 2 | 3} />
      {steps.length > 0 && <TxSteps steps={steps} deposit={usd(d.terms.collateral)} explorer={net.data?.explorer ?? null} viewer="owner" />}
      {error && <p className="notice error">{error}</p>}
      <div className="actions">
        {state === "done" || s
          ? <a className="btn btn-primary" href={href("my-objects")}>Back to My bikes</a>
          : <button type="button" className="btn btn-primary" onClick={run} disabled={state === "running"}>{state === "running" ? "Working…" : "Confirm it's back"}</button>}
      </div>
    </Page>
  );
}

// ---------- Add an object ----------
const STEP_NAMES = ["Recorder", "Mount", "Pair", "Your bike", "Rules", "Ready"];
type Kind = NewObject["kind"];
/** Suggested levels per type, from the indicative table in docs/CALIBRATION.md (not yet measured). */
const SUGGESTED: Record<Kind, [number, number, number]> = {
  "City bike": [20, 40, 80], "E-bike": [20, 40, 80], "Cargo bike": [15, 35, 70], "Road bike": [20, 40, 80], Camera: [30, 80, 180], Other: [8, 30, 80],
};

type Draft = { recorder: RecorderInfo | null; label: string; kind: Kind; spot: string; photo: string | null; price: string; deposit: string; levels: [number, number, number]; bps: [number, number, number] };
const EMPTY: Draft = { recorder: null, label: "", kind: "City bike", spot: "", photo: null, price: "2", deposit: "50", levels: SUGGESTED["City bike"], bps: [10, 40, 100] };

function validate(d: Draft): string | null {
  const [l, m, s] = d.levels;
  if (!(l > 1 && l < m && m < s)) return "Levels must go up: light below medium below strong, all above 1 g (the bike standing still).";
  if (s >= 200) return "The recorder can't measure above 200 g, so the strong level must start below 200 g.";
  const [a, b, c] = d.bps;
  if (!(a >= 0 && a <= b && b <= c && c <= 100)) return "Shares must go up from light to strong, and stay within 100%.";
  if (!(Number(d.deposit) > 0)) return "Set a deposit above 0.";
  return null;
}

function AddShell({ n, title, children, next, onNext, wide = false, aside }: { n: number; title: ReactNode; children: ReactNode; next?: string; onNext?: () => void; wide?: boolean; aside?: ReactNode }) {
  return (
    <Page wide={wide}>
      <div className="rent-top">
        <a className="link back" href={href("my-objects")}>Cancel</a>
        <ol className="rent-progress" aria-label="Add your bike">
          {STEP_NAMES.map((s, i) => <li key={s} className={i + 1 < n ? "done" : i + 1 === n ? "current" : ""} aria-current={i + 1 === n ? "step" : undefined}>{s}</li>)}
        </ol>
      </div>
      <h1>{title}</h1>
      <div className={aside ? "add-grid" : undefined}>
        <div>
          {children}
          {(next || (n > 1 && n < 6)) && (
            <div className="actions">
              {next && (onNext ? <button type="button" className="btn btn-primary" onClick={onNext}>{next}</button> : <span className="btn btn-primary is-off" aria-disabled="true">{next}</span>)}
              {n > 1 && n < 6 && <a className="btn btn-secondary" href={href(`add/${n - 1}`)}>Back</a>}
            </div>
          )}
        </div>
        {aside}
      </div>
    </Page>
  );
}

/** What renters will see, updating as the owner types (Airbnb's host preview). */
function ListingPreview({ d }: { d: Draft }) {
  return (
    <aside className="listing-preview" aria-label="How renters will see your bike">
      <p className="preview-k">How renters will see it</p>
      <div className="preview-card">
        {d.photo ? <img src={d.photo} alt="" /> : <div className="preview-empty">Your photo</div>}
        <div className="preview-body">
          <p className="preview-name">{d.label.trim() || "Your bike"}</p>
          <p className="preview-meta">{d.kind}{d.spot.trim() ? `, ${d.spot.trim()}` : ""}</p>
          <p className="preview-price"><b>{d.price || "0"} dollars</b> an hour · deposit {d.deposit || "0"}</p>
        </div>
      </div>
    </aside>
  );
}

let draft: Draft = { ...EMPTY }; // survives moving between the six steps (they are separate routes)

export function AddPage({ n }: { n: number }) {
  const [d, setD] = useState<Draft>(draft);
  const set = (p: Partial<Draft>) => { draft = { ...draft, ...p }; setD(draft); };
  const go = (k: number) => { window.location.hash = `#/add/${k}`; window.scrollTo(0, 0); };
  const { account, connect } = useViewer();
  const [mounted, setMounted] = useState(false);
  const [scanning, setScanning] = useState(false);

  switch (n) {
    case 1: return (
      <AddShell n={1} title={<>Do you have a Sharify <em>recorder</em>?</>}>
        <img className="step-photo" src="./img/day/recorder-hand.jpg" alt="A hand holding the Sharify recorder next to a bike" />
        <p className="lead">The recorder is a small sealed box that notes every hard knock and seals each note. Each bike needs its own.</p>
        <div className="choice">
          <button type="button" className="choice-opt" onClick={() => go(2)}><b>Yes, I have one</b><span>Next you'll fix it to the bike and pair it.</span></button>
          <div className="choice-opt off"><b>No, not yet</b><span>Recorder, mount and battery. Ordering opens later; the price isn't set yet.</span></div>
        </div>
      </AddShell>
    );
    case 2: return (
      <AddShell n={2} title={<>Fix it to the <em>frame</em>.</>} next="Continue" onNext={mounted ? () => go(3) : undefined}>
        <div className="mount">
          <div className="mount-art" aria-hidden="true"><TubeRecorder /></div>
          <ol className="numbered">
            <li>Rigid to the frame, with the clamps in the box. Never on foam or tape: it would feel less than the bike does.</li>
            <li>Any orientation works.</li>
            <li>Keep the USB-C port reachable for charging.</li>
          </ol>
        </div>
        <label className="check"><input type="checkbox" checked={mounted} onChange={(e) => setMounted(e.target.checked)} /> <span>It's fixed and doesn't move by hand.</span></label>
      </AddShell>
    );
    case 3: {
      const scan = async () => { setScanning(true); try { set({ recorder: await lookupRecorder("sharify:pk:a41c07d2e9b35f18") }); } finally { setScanning(false); } };
      const r = d.recorder;
      return (
        <AddShell n={3} title={<>Pair the <em>recorder</em>.</>} next="Continue" onNext={r ? () => go(4) : undefined}>
          <p className="lead">Scan the QR on the recorder. It tells Sharify which box belongs to your bike.</p>
          <div className="scan">
            <div className={`scan-frame ${scanning ? "is-scanning" : r ? "is-found" : ""}`} aria-hidden="true"><i /><i /><i /><i /><span className="mono">{scanning ? "Reading…" : r ? "Found" : "Point the camera at the recorder's QR"}</span></div>
            <div>
              {r ? (
                <dl className="facts single">
                  <div><dt>Recorder</dt><dd className="mono" title={r.deviceId}>ending in {r.deviceId.slice(-4).toUpperCase()}</dd></div>
                  <div><dt>Last signal</dt><dd className="mono">{r.lastSeenAt ? when(r.lastSeenAt) : "never"}</dd></div>
                  <div><dt>Battery</dt><dd className="mono">{r.batteryPct ?? "—"}%</dd></div>
                </dl>
              ) : <button type="button" className="btn btn-secondary" onClick={scan} disabled={scanning}>{scanning ? "Reading…" : "Scan the QR"}</button>}
              {r && r.objects > 0 && <p className="notice">This recorder is already paired with {r.objects === 1 ? "another bike" : `${r.objects} other bikes`}. Pairing it again is possible today but shouldn't be: see the limits in How Sharify is designed.</p>}
            </div>
          </div>
        </AddShell>
      );
    }
    case 4: return (
      <AddShell n={4} wide aside={<ListingPreview d={d} />} title={<>Your <em>bike</em>.</>} next="Continue" onNext={d.label.trim() && d.spot.trim() ? () => go(5) : undefined}>
        <div className="form">
          <label className="photo">
            {d.photo ? <img src={d.photo} alt="Your bike" /> : <span className="mono">Add a photo</span>}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) set({ photo: URL.createObjectURL(f) }); }} />
          </label>
          <div className="fields">
            <label className="field"><span>Name</span><input value={d.label} placeholder="Blue city bike" onChange={(e) => set({ label: e.target.value })} /></label>
            <label className="field"><span>Type</span>
              <select value={d.kind} onChange={(e) => { const k = e.target.value as Kind; set({ kind: k, levels: SUGGESTED[k] }); }}>
                {(Object.keys(SUGGESTED) as Kind[]).map((k) => <option key={k}>{k}</option>)}
              </select>
            </label>
            <label className="field"><span>Where it's parked</span><input value={d.spot} placeholder="Via Sarfatti 25, Milan" onChange={(e) => set({ spot: e.target.value })} /></label>
            <p className="hint-line">The map shows the bike here when it's free, never where a renter leaves it. The type sets the suggested knock levels on the next step.</p>
          </div>
        </div>
      </AddShell>
    );
    case 5: {
      const err = validate(d);
      const terms: Terms = { collateral: d.deposit || "0", lightCg: d.levels[0] * 100, mediumCg: d.levels[1] * 100, strongCg: d.levels[2] * 100, lightBps: d.bps[0] * 100, mediumBps: d.bps[1] * 100, strongBps: d.bps[2] * 100 };
      const lv = (i: number, v: string) => { const a = [...d.levels] as [number, number, number]; a[i] = Number(v); set({ levels: a }); };
      const bp = (i: number, v: string) => { const a = [...d.bps] as [number, number, number]; a[i] = Number(v); set({ bps: a }); };
      return (
        <AddShell n={5} wide aside={<ListingPreview d={d} />} title={<>Your <em>rules</em>.</>} next="Save the rules" onNext={err ? undefined : () => go(6)}>
          <p className="lead">Renters accept these before they unlock. You can't change them during a rental. <span className="test-money">{TEST_MONEY}</span></p>
          <div className="rule-form">
            <label className="field"><span>Price per hour</span><span className="unit"><input inputMode="decimal" value={d.price} onChange={(e) => set({ price: e.target.value })} /> dollars</span><span className="tag">paid to you separately</span></label>
            <label className="field"><span>Deposit</span><span className="unit"><input inputMode="decimal" value={d.deposit} onChange={(e) => set({ deposit: e.target.value })} /> dollars</span></label>
          </div>
          <table className="levels">
            <thead><tr><th>Knock</th><th>From</th><th>You keep</th></tr></thead>
            <tbody>
              {(["light", "medium", "strong"] as const).map((name, i) => (
                <tr key={name}>
                  <td><TierMeter tier={(i + 1) as 1 | 2 | 3} /></td>
                  <td><span className="unit"><input inputMode="decimal" value={d.levels[i]} onChange={(e) => lv(i, e.target.value)} aria-label={`${name} level in g`} /> g</span></td>
                  <td><span className="unit"><input inputMode="decimal" value={d.bps[i]} onChange={(e) => bp(i, e.target.value)} aria-label={`${name}: share of the deposit you keep`} /> %</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint-line">Suggested for a {d.kind.toLowerCase()} from early tests, not measured on your bike. Knocks are in g: 1 g is the bike standing still, a pothole is about 15 g.</p>
          {err ? <p className="notice error">{err}</p> : <><p className="rule-title">What renters will see</p><RuleTiers terms={terms} /></>}
        </AddShell>
      );
    }
    default:
      if (!d.recorder || !d.label.trim()) {
        const back = !d.recorder ? 3 : 4;
        return (
          <AddShell n={6} title={<>A step is <em>missing</em>.</>}>
            <p className="lead">{!d.recorder ? "Pair the recorder first." : "Give the bike a name and a parking spot first."}</p>
            <div className="actions"><a className="btn btn-primary" href={href(`add/${back}`)}>Go to step {back}</a></div>
          </AddShell>
        );
      }
      return <AddReady d={d} account={!!account} connect={connect} />;
  }
}

function AddReady({ d, account, connect }: { d: Draft; account: boolean; connect: () => Promise<void> }) {
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const qc = useQueryClient();
  const { account: me } = useViewer();
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [id, setId] = useState<number | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const url = useMemo(() => (id ? `${window.location.origin}${window.location.pathname}#/object/${id}` : null), [id]);
  useEffect(() => { if (url) QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#02070a", light: "#e6edf1" } }).then(setQr); }, [url]);
  const terms: Terms = { collateral: d.deposit, lightCg: d.levels[0] * 100, mediumCg: d.levels[1] * 100, strongCg: d.levels[2] * 100, lightBps: d.bps[0] * 100, mediumBps: d.bps[1] * 100, strongBps: d.bps[2] * 100 };
  // the three signatures, listed before anything is sent
  const planned: TxStep[] = me ? (["register", "create", "setTerms"] as const)
    .filter((k) => k !== "register" || !d.recorder?.registered)
    .map((k) => ({ id: k, signer: me, viaWallet: true, status: "waiting", tx: null, error: null })) : [];
  const shown = steps.length ? steps : planned;
  const run = async () => {
    setBusy(true); setError(null);
    try {
      const newId = await addObject({ qr: "sharify:pk:a41c07d2e9b35f18", label: d.label, kind: d.kind, spot: d.spot, pricePerHour: d.price, terms }, setSteps);
      setId(newId); draft = { ...EMPTY };
      await qc.invalidateQueries();
    } catch (e) { setError(e instanceof DataError ? e.message : String(e)); }
    setBusy(false);
  };
  return (
    <AddShell n={6} wide title={id ? <>Ready to <em>rent out</em>.</> : <>Publish your <em>bike</em>.</>}>
      <p className="lead">{id
        ? "It's published and it's yours. Print the QR and stick it on the frame: renters scan it to open the bike page."
        : `Your wallet will ask you to confirm ${shown.length || 3} times, a few seconds each. Your bike goes live when they're done.`}</p>
      <div className="deposit">
        <div className="deposit-main">
          {shown.length > 0 && <TxSteps steps={shown} deposit={usd(d.deposit)} explorer={net.data?.explorer ?? null} viewer="owner" />}
          {error && <p className="notice error">{error}</p>}
          {!id ? (
            <div className="actions">
              {account
                ? <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>{busy ? "Working…" : `Publish ${d.label || "the bike"}`}</button>
                : <button type="button" className="btn btn-primary" onClick={connect}>Connect wallet</button>}
              {!busy && <a className="btn btn-secondary" href={href("add/5")}>Back</a>}
            </div>
          ) : (
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print the QR</button>
              <a className="btn btn-secondary" href={href(`object/${id}`)}>Open the bike page</a>
              <a className="btn btn-secondary" href={href("my-objects")}>Go to My bikes</a>
            </div>
          )}
        </div>
        {id ? (
          <figure className="qr-print qr-big">
            {qr ? <div className="qr-svg" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="qr-svg" />}
            <figcaption>{d.label || `Bike ${id}`} · scan to rent</figcaption>
          </figure>
        ) : (
          <aside className="deposit-summary" aria-label="What renters will see">
            <div className="sum-bike">
              <div className="sum-photo">{d.photo ? <img src={d.photo} alt="" /> : <span className="mono">{d.kind}</span>}</div>
              <div>
                <p className="sum-name">{d.label || "Your bike"}</p>
                <p className="mono sum-owner">{d.kind} · {d.spot}</p>
              </div>
            </div>
            <dl className="sum-lines">
              <div><dt>Deposit</dt><dd className="mono big">{usd(d.deposit)}</dd></div>
              <div><dt>Rental price</dt><dd className="mono">{usd(d.price)} an hour</dd><dd className="tag">paid to you separately</dd></div>
              <div><dt>Recorder</dt><dd>{d.recorder ? "paired" : "not paired"}</dd></div>
            </dl>
            <p className="rule-title">The rule renters accept</p>
            <RuleTiers terms={terms} />
            <p className="hint-line">Public, and nobody can rewrite it: the recorder, that the bike is yours, the rule. Kept by Sharify: name, photo, type, spot and price.</p>
          </aside>
        )}
      </div>
    </AddShell>
  );
}
