// The owner's pages (v2): My bikes and the six-step "Add your bike". Queries, the draft, validation,
// the source calls and the words come unchanged from the old OwnerPages.tsx (removed in lotto 5, see git history); only the markup is new.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { usePosterPdf } from "./print";
import { addObject, getNetwork, getObject, listObjects, lookupRecorder } from "../data/api";
import { DataError, type NewObject, type ObjectDetail, type RecorderInfo, type Terms, type TxStep } from "../data/types";
import { CASE_IMAGE } from "./caseImage";
import { nameOf, objectName, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { priceOf } from "./price";
import { Button, StatusPill } from "./ui";
import { KnockList, knockRows } from "./rule";
import { Bill, Checkout, ErrorLine, Spinner, StepList, StepRail } from "./checkout";
import { ListRow, PageV2, RowList } from "./lists";

const sum = (xs: string[]) => String(Math.round(xs.reduce((s, x) => s + Number(x), 0) * 100) / 100);
const PHOTO = CASE_IMAGE?.src;

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

/** The one-line status of a bike, as the old ObjectRow words it. */
function statusOf(d: ObjectDetail) {
  return d.pendingHandoff?.to.role === "owner" ? `${nameOf(d.pendingHandoff.from)} is returning it`
    : d.status === "rented" ? `Out with ${nameOf(d.custodian)}`
      : d.status === "handoff-pending" ? `Offered to ${nameOf(d.pendingHandoff!.to)}`
        : d.status === "held-without-deposit" ? `${nameOf(d.custodian)} has it, no deposit` : "Available";
}

const OwnerSteps = () => (
  <ol className="v2-steps3">
    <li><span><span className="v2-strong">Fix a recorder to the frame.</span> A small sealed box; you pair it with your bike from your phone.</span></li>
    <li><span><span className="v2-strong">Set your price and your rule.</span> The hourly price, the deposit and what each kind of knock costs.</span></li>
    <li><span><span className="v2-strong">Confirm when it's back.</span> The deposit settles by itself, by the rule you set.</span></li>
  </ol>
);

// ---------- My bikes ----------
export function MyObjectsV2() {
  const { account, ready, owned, loading } = useOwned();
  const { connect } = useViewer();
  const qc = useQueryClient();
  if (ready && !account) {
    return (
      <PageV2>
        <p className="v2-eyebrow">Your bikes</p>
        <h1 className="v2-h2">Connect the wallet you lend with.</h1>
        <p className="v2-lead v2-muted v2-gap-16 v2-page-lead">Your bikes and earnings live in your wallet. Sharify keeps no account.</p>
        <div className="v2-page-actions"><Button onClick={connect}>Connect wallet</Button><Button variant="secondary" href={href("add/1")}>Add a bike</Button></div>
      </PageV2>
    );
  }
  const returns = (owned ?? []).filter((d) => d.pendingHandoff?.to.role === "owner");
  const settled = (owned ?? []).flatMap((d) => d.rentals.filter((r) => r.settlement).map((r) => ({ d, r })));
  const income = sum(settled.map(({ d, r }) => priceOf(r, d).amount));
  const fees = sum(settled.map(({ r }) => r.settlement!.fee));
  const out = (owned ?? []).filter((d) => d.custodian.address.toLowerCase() !== d.owner.address.toLowerCase()).length;
  const warm = (d: ObjectDetail) => () => { if (!qc.getQueryData(["object", d.id])) qc.setQueryData(["object", d.id], d); };
  return (
    <PageV2>
      <p className="v2-eyebrow">Your bikes</p>
      <h1 className="v2-h2">{owned && owned.length === 0 ? "Your first bike, in three steps." : returns.length === 0 ? "Nothing needs you right now." : returns.length === 1 ? "One return to confirm." : `${returns.length} returns to confirm.`}</h1>
      {loading && <p className="v2-lead v2-muted v2-gap-16">Loading your bikes…</p>}

      {owned && owned.length === 0 && (
        <section className="v2-page-section v2-page-lead">
          <OwnerSteps />
          <div className="v2-page-actions"><Button href={href("add/1")}>Add your first bike</Button></div>
        </section>
      )}

      {owned && owned.length > 0 && (
        <div className="v2-owner-grid">
          <div className="v2-owner-main">
            {returns.length > 0 && (
              <section aria-label="Returns to confirm">
                <RowList>
                  {returns.map((d) => (
                    <ListRow key={d.id} img={PHOTO} href={href(`confirm-return/${d.id}`)}
                      title={`${nameOf(d.pendingHandoff!.from)} is returning ${objectName(d, false)}.`} pill={<StatusPill tone="live">To confirm</StatusPill>}
                      meta={<>Handed back {when(d.pendingHandoff!.anchor.at)}. Check it's back with you, then confirm: the deposit is settled by the rule, by itself.</>}
                      right={<span className="v2-link-quiet">Confirm you have it back</span>} />
                  ))}
                </RowList>
              </section>
            )}
            <section className="v2-page-section" aria-labelledby="bikes-title">
              <h2 className="v2-h3" id="bikes-title">Your bikes</h2>
              <RowList>
                {owned.map((d) => {
                  const last = d.rentals.filter((r) => r.settlement && r.settlement.tier > 0).at(-1)?.settlement ?? null;
                  const st = statusOf(d);
                  return (
                    <li key={d.id} className="v2-row" onPointerEnter={warm(d)} onFocus={warm(d)}>
                      <a className="v2-row-hit" href={href(`object/${d.id}`)}>
                        {PHOTO ? <img className="v2-row-photo" src={PHOTO} alt="" width="96" height="96" /> : <span className="v2-row-photo" />}
                        <span className="v2-row-main">
                          <span className="v2-row-title">{objectName(d)}<StatusPill tone={d.status === "rented" ? "live" : "quiet"}>{st}</StatusPill></span>
                          <span className="v2-row-meta">{d.rentals.length === 1 ? "1 rental" : `${d.rentals.length} rentals`} · {last ? `last ${TIER_NAMES[last.tier]} knock` : "never dropped"}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </RowList>
              <div className="v2-page-actions"><Button variant="secondary" href={href("add/1")}>Add a bike</Button></div>
              <p className="v2-body v2-muted v2-gap-8">A recorder, a price, a deposit. About two minutes.</p>
            </section>
          </div>
          <aside className="v2-owner-aside" aria-label="What you earned">
            <p className="v2-small v2-muted">Earned with Sharify</p>
            <p className="v2-owner-big">{usd(sum([income, fees]))}</p>
            <Bill rows={[
              { k: <>Rental price<span className="v2-receipt-sub">{settled.length} rentals, paid apart</span></>, v: usd(income) },
              { k: <>Kept for knocks<span className="v2-receipt-sub">From deposits, by the rule</span></>, v: usd(fees) },
            ]} />
            <p className="v2-body v2-muted v2-gap-24">{out === 0 ? "All your bikes are with you." : out === 1 ? "1 bike is out with a renter." : `${out} bikes are out with renters.`} {TEST_MONEY}</p>
          </aside>
        </div>
      )}
    </PageV2>
  );
}

// ---------- Add your bike ----------
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

const termsOf = (d: Draft): Terms => ({ collateral: d.deposit || "0", lightCg: d.levels[0] * 100, mediumCg: d.levels[1] * 100, strongCg: d.levels[2] * 100, lightBps: d.bps[0] * 100, mediumBps: d.bps[1] * 100, strongBps: d.bps[2] * 100 });

/** After publishing, the draft is reset: the steps are done, but no longer places to go back to. */
const rail = (current: number) => <StepRail names={STEP_NAMES} current={current} hrefFor={(k) => href(`add/${k}`)} label="Add your bike" linkDone={current <= 6} />;
const CANCEL = <a className="v2-link-quiet" href={href("my-objects")}>Cancel</a>;

/** One step of the wizard: Cancel on top, "Step N of 6", the title; Back on the left, the primary on the right. */
function AddShell({ n, title, lead, children, next, onNext, aside, action }: { n: number; title: ReactNode; lead?: ReactNode; children: ReactNode; next?: string; onNext?: () => void; aside?: ReactNode; action?: ReactNode }) {
  const back = n > 1 && n < 6 ? <a className="v2-link-quiet" href={href(`add/${n - 1}`)}>Back</a> : undefined;
  return (
    <Checkout steps={{ n, total: 6, name: STEP_NAMES[n - 1], label: "Add your bike", end: CANCEL }} title={title} lead={lead}
      back={back} aside={aside} split rail={rail(n)}
      action={action ?? (next ? <Button onClick={onNext} disabled={!onNext}>{next}</Button> : undefined)}>
      {children}
    </Checkout>
  );
}

/** What renters will see, updating as the owner types (the old ListingPreview). */
function Preview({ d, onPhoto, rule }: { d: Draft; onPhoto?: (url: string) => void; rule?: ReturnType<typeof knockRows> }) {
  return (
    <section className="v2-preview" aria-label="How renters will see your bike">
      <p className="v2-small v2-muted">How renters will see it</p>
      <div className="v2-preview-row">
        {onPhoto ? (
          <label className="v2-preview-photo">
            {d.photo ? <img src={d.photo} alt="Your bike" /> : <span className="v2-preview-add">Add a photo</span>}
            <input className="v2-sr" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(URL.createObjectURL(f)); }} />
          </label>
        ) : <span className="v2-preview-photo">{d.photo ? <img src={d.photo} alt="" /> : <span className="v2-preview-add">Your photo</span>}</span>}
        <div>
          <p className="v2-body v2-strong">{d.label.trim() || "Your bike"}</p>
          <p className="v2-body v2-muted">{d.kind}{d.spot.trim() ? `, ${d.spot.trim()}` : ""}</p>
          <p className="v2-body"><span className="v2-strong">{d.price || "0"} dollars</span> an hour</p>
          <p className="v2-body v2-muted">{d.deposit || "0"} dollars deposit</p>
        </div>
      </div>
      <ul className="v2-preview-check">
        <li>{d.recorder ? `✓ Recorder ending in ${d.recorder.deviceId.slice(-4).toUpperCase()}` : "Recorder not paired yet"}</li>
        <li>{d.label.trim() && d.spot.trim() ? "✓ Name and parking spot" : "Name and parking spot to add"}</li>
      </ul>
      {onPhoto && <p className="v2-body v2-muted">In daylight, the whole bike, where it's parked.</p>}
      {rule && <div><p className="v2-small v2-muted">The rule renters accept</p><KnockList rows={rule.map((r, i) => (i === 0 ? { ...r, sum: "All of it back" } : r))} className="v2-knocks-grid v2-knocks-mini" /></div>}
    </section>
  );
}

const Tick = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** A camera drawn as a 1.5 px line, 32 px, in a white 72 px circle. */
const Camera = () => (
  <span className="v2-scanbox-icon"><svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.6l1.4-2h7l1.4 2h2.6A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg></span>
);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="v2-field"><span className="v2-field-label">{label}</span>{children}</label>;
}

let draft: Draft = { ...EMPTY }; // survives moving between the six steps (they are separate routes)

export function AddV2({ n }: { n: number }) {
  const [d, setD] = useState<Draft>(draft);
  const set = (p: Partial<Draft>) => { draft = { ...draft, ...p }; setD(draft); };
  const go = (k: number) => { window.location.hash = `#/add/${k}`; window.scrollTo(0, 0); };
  const { account, connect } = useViewer();
  const [mounted, setMounted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [hasOne, setHasOne] = useState<"yes" | "no" | null>(null);

  switch (n) {
    case 1: return (
      <AddShell n={1} title="Do you have a Sharify recorder?" lead="A small sealed box that signs every hard knock. One per bike."
        next={hasOne === "yes" ? "Continue" : undefined} onNext={hasOne === "yes" ? () => go(2) : undefined}>
        <img className="v2-add-photo v2-add-photo-small" src="./img/day/recorder-hand.jpg" alt="A hand holding the Sharify recorder next to a bike" />
        <fieldset className="v2-tiles">
          <legend className="v2-sr">Do you have a Sharify recorder?</legend>
          <label className="v2-tile-choice">
            <span><span className="v2-body v2-strong">Yes, I have one</span><span className="v2-body v2-muted">Next you'll fix it to the bike and pair it.</span></span>
            <input className="v2-sr" type="radio" name="has-recorder" checked={hasOne === "yes"} onChange={() => setHasOne("yes")} />
            <span className="v2-tile-mark" aria-hidden="true"><Tick /></span>
          </label>
          <label className="v2-tile-choice">
            <span><span className="v2-body v2-strong">No, not yet</span><span className="v2-body v2-muted">Recorder, mount and battery.</span></span>
            <input className="v2-sr" type="radio" name="has-recorder" checked={hasOne === "no"} onChange={() => setHasOne("no")} />
            <span className="v2-tile-mark" aria-hidden="true"><Tick /></span>
          </label>
        </fieldset>
        {hasOne === "no" && (
          <div className="v2-infobox" role="status">
            <p className="v2-body">You need a recorder first. Ordering opens later; the price isn't set yet.</p>
            <p className="v2-gap-16"><a className="v2-link-quiet" href={href("")}>Back to the home</a></p>
          </div>
        )}
      </AddShell>
    );
    case 2: return (
      <AddShell n={2} title="Fix it to the frame." next="Continue" onNext={mounted ? () => go(3) : undefined}>
        <img className="v2-add-photo" src="./img/day/recorder-hand.jpg" alt="The recorder, a small black box, held against a bike's frame" />
        <ol className="v2-steps3">
          <li><span><span className="v2-strong">Rigid to the frame</span>, with the clamps in the box. Never on foam or tape: it would feel less than the bike does.</span></li>
          <li><span><span className="v2-strong">Any orientation</span> works.</span></li>
          <li><span><span className="v2-strong">Keep the USB-C port reachable</span> for charging.</span></li>
        </ol>
        <label className={`v2-check${mounted ? " is-on" : ""}`}>
          <input className="v2-sr" type="checkbox" checked={mounted} onChange={(e) => setMounted(e.target.checked)} />
          <span className="v2-check-box" aria-hidden="true">{mounted && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
          <span><span className="v2-body v2-strong v2-line">It's fixed and doesn't move by hand.</span><span className="v2-body v2-muted v2-line">Give it a firm push: nothing should wobble.</span></span>
        </label>
      </AddShell>
    );
    case 3: {
      const scan = async () => { setScanning(true); try { set({ recorder: await lookupRecorder("sharify:pk:a41c07d2e9b35f18") }); } finally { setScanning(false); } };
      const r = d.recorder;
      return (
        <AddShell n={3} title="Pair the recorder." lead="Scan the QR on the recorder to link it to your bike."
          action={r ? <Button onClick={() => go(4)}>Continue</Button> : <Button onClick={scan} disabled={scanning}>{scanning ? <><Spinner size={18} />Reading…</> : "Scan the QR"}</Button>}>
          {r ? (
            <section className="v2-paired" aria-live="polite">
              <div className="v2-paired-head">
                <span className="v2-paired-mark" aria-hidden="true"><Tick size={20} /></span>
                <div>
                  <p className="v2-paired-title">Recorder paired</p>
                  <p className="v2-body v2-muted" title={r.deviceId}>Ending in {r.deviceId.slice(-4).toUpperCase()}</p>
                </div>
              </div>
              <dl className="v2-paired-rows">
                <div><dt>Last signal</dt><dd>{r.lastSeenAt ? when(r.lastSeenAt) : "never"}</dd></div>
                <div><dt>Battery</dt><dd>{r.batteryPct ?? "—"}%</dd></div>
              </dl>
            </section>
          ) : (
            <div className="v2-scanbox" role="status">
              <Camera />
              <p className="v2-body">{scanning ? "Reading the QR…" : "Point the camera at the QR on the recorder"}</p>
            </div>
          )}
          {r && r.objects > 0 && <ErrorLine>This recorder is already paired with {r.objects === 1 ? "another bike" : `${r.objects} other bikes`}. Pairing it again is possible today but shouldn't be: see the limits in How Sharify is designed.</ErrorLine>}
        </AddShell>
      );
    }
    case 4: return (
      <AddShell n={4} title="Your bike." lead="What renters see on the map and the bike page." next="Continue" onNext={d.label.trim() && d.spot.trim() ? () => go(5) : undefined}
        aside={<Preview d={d} onPhoto={(photo) => set({ photo })} />}>
        <div className="v2-form">
          <Field label="Name"><input className="v2-field-input" value={d.label} placeholder="Blue city bike" onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Type">
            <select className="v2-field-input" value={d.kind} onChange={(e) => { const k = e.target.value as Kind; set({ kind: k, levels: SUGGESTED[k] }); }}>
              {(Object.keys(SUGGESTED) as Kind[]).map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Where it's parked"><input className="v2-field-input" value={d.spot} placeholder="Via Sarfatti 25, Milan" onChange={(e) => set({ spot: e.target.value })} /></Field>
          <p className="v2-small v2-muted">Shown on the map only while the bike is free.</p>
        </div>
      </AddShell>
    );
    case 5: {
      const err = validate(d);
      const lv = (i: number, v: string) => { const a = [...d.levels] as [number, number, number]; a[i] = Number(v); set({ levels: a }); };
      const bp = (i: number, v: string) => { const a = [...d.bps] as [number, number, number]; a[i] = Number(v); set({ bps: a }); };
      return (
        <AddShell n={5} title="Your rules." lead="Renters accept these before they unlock. Locked during a rental." next="Save the rules" onNext={err ? undefined : () => go(6)}
          aside={<Preview d={d} rule={err ? undefined : knockRows(termsOf(d))} />}>
          <div className="v2-form v2-form-2">
            <Field label="Price per hour, dollars"><input className="v2-field-input" inputMode="decimal" value={d.price} onChange={(e) => set({ price: e.target.value })} /></Field>
            <Field label="Deposit, dollars"><input className="v2-field-input" inputMode="decimal" value={d.deposit} onChange={(e) => set({ deposit: e.target.value })} /></Field>
          </div>
          <div className="v2-levels" role="table" aria-label="Knock levels">
            <div className="v2-levels-row v2-levels-head" role="row"><span role="columnheader">Knock</span><span role="columnheader">From, g</span><span role="columnheader">You keep, %</span><span role="columnheader">That is</span></div>
            {(["light", "medium", "strong"] as const).map((name, i) => (
              <div className="v2-levels-row" role="row" key={name}>
                <span role="cell" className="v2-body v2-strong">{name[0].toUpperCase() + name.slice(1)}</span>
                <span role="cell"><input className="v2-field-input" inputMode="decimal" value={d.levels[i]} onChange={(e) => lv(i, e.target.value)} aria-label={`${name} level in g`} /></span>
                <span role="cell"><input className="v2-field-input" inputMode="decimal" value={d.bps[i]} onChange={(e) => bp(i, e.target.value)} aria-label={`${name}: share of the deposit you keep`} /></span>
                <span role="cell" className="v2-body">{usd(String(Math.round(Number(d.deposit || 0) * d.bps[i]) / 100))}</span>
              </div>
            ))}
          </div>
          <p className="v2-small v2-muted">Suggested for a {d.kind.toLowerCase()}. 1 g is a bike standing still, a pothole about 15 g.</p>
          {err && <ErrorLine>{err}</ErrorLine>}
        </AddShell>
      );
    }
    default:
      if (!d.recorder || !d.label.trim()) {
        const back = !d.recorder ? 3 : 4;
        return (
          <Checkout steps={{ n: 6, total: 6, name: STEP_NAMES[5], label: "Add your bike", end: CANCEL }} split rail={rail(6)} title="A step is missing."
            lead={!d.recorder ? "Pair the recorder first." : "Give the bike a name and a parking spot first."}
            action={<Button href={href(`add/${back}`)}>Go to step {back}</Button>} />
        );
      }
      return <AddReady d={d} account={!!account} connect={connect} />;
  }
}

/** Base URL a phone can open: the published site if set, else this Mac's network address instead of localhost. */
function publicBase() {
  const env = import.meta.env.VITE_PUBLIC_URL;
  if (env) return env.endsWith("/") ? env : `${env}/`;
  const { protocol, hostname, port, pathname, origin } = window.location;
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  const host = local && typeof __LAN_HOST__ === "string" && __LAN_HOST__ ? `${protocol}//${__LAN_HOST__}${port ? `:${port}` : ""}` : origin;
  return `${host}${pathname}`;
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
  const url = useMemo(() => (id ? `${publicBase()}#/object/${id}` : null), [id]);
  // Black on white: the v2 QR prints on any sticker.
  useEffect(() => { if (url) QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0a0a0a", light: "#ffffff" } }).then(setQr); }, [url]);
  const posterPdf = usePosterPdf({ url, name: d.label || `Bike ${id ?? ""}`, spot: d.spot, price: d.price, deposit: d.deposit });
  const terms = termsOf(d);
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
    <Checkout steps={{ n: 6, total: 6, name: STEP_NAMES[5], label: "Add your bike", end: id ? undefined : CANCEL }} split rail={rail(id ? 7 : 6)}
      aside={id ? undefined : <Preview d={d} rule={knockRows(terms)} />}
      title={id ? "Ready to rent out." : "Publish your bike."}
      lead={id
        ? "Print the QR and stick it on the frame. Renters scan it to rent."
        : `Your wallet asks ${shown.length || 3} times, then the bike is live.`}
      back={!id && !busy ? <a className="v2-link-quiet" href={href("add/5")}>Back</a> : undefined}
      action={!id
        ? (account
          ? <Button onClick={run} disabled={busy}>{busy ? <><Spinner size={18} />Working…</> : `Publish ${d.label || "the bike"}`}</Button>
          : <Button onClick={connect}>Connect wallet</Button>)
        : <Button full onClick={() => { if (posterPdf) window.open(posterPdf, "_blank"); }} disabled={!posterPdf}>Print the QR</Button>}
      note={id
        ? <><a className="v2-textlink" href={href(`object/${id}`)}>Open the bike page</a> · <a className="v2-textlink" href={href("my-objects")}>Go to My bikes</a></>
        : "On-chain for good: the recorder, your ownership, the rule."}>
      {id ? (<>
        <figure className="v2-qr">
          {qr ? <div className="v2-qr-svg" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="v2-qr-svg" />}
          <figcaption className="v2-body v2-muted">{d.label || `Bike ${id}`} · scan to rent</figcaption>
        </figure>
      </>) : (
        <>
          <Bill rows={[
            { k: "Deposit", v: usd(d.deposit), strong: true },
            { k: <>Rental price<span className="v2-receipt-sub">paid apart</span></>, v: `${usd(d.price)} an hour` },
            { k: "Recorder", v: d.recorder ? "paired" : "not paired" },
          ]} />
        </>
      )}
      {shown.length > 0 && <StepList steps={shown} deposit={usd(d.deposit)} explorer={net.data?.explorer ?? null} viewer="owner" />}
      {error && <ErrorLine>{error}</ErrorLine>}
    </Checkout>
  );
}
