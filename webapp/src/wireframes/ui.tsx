import { useEffect, useRef, useState, type ReactNode } from "react";
import { BIKE_LABEL, ROLE_LABEL, useProto, wf, type BikeState, type Role } from "./state";

export const A = ({ to, children, className }: { to: string; children: ReactNode; className?: string }) =>
  <a className={className} href={wf(to)} onClick={() => window.scrollTo(0, 0)}>{children}</a>;
export const Btn = ({ to, children, primary }: { to: string; children: ReactNode; primary?: boolean }) =>
  <A to={to} className={`wf-btn ${primary ? "primary" : ""}`}>{children}</A>;
export const Act = ({ onClick, children, primary, disabled }: { onClick: () => void; children: ReactNode; primary?: boolean; disabled?: boolean }) =>
  <button type="button" className={`wf-btn ${primary ? "primary" : ""}`} onClick={onClick} disabled={disabled}>{children}</button>;

/** Grey block standing in for an image, map, camera or QR. */
export const Ph = ({ label, h = 140 }: { label: string; h?: number }) =>
  <div className="wf-ph" style={{ minHeight: h }}><span>{label}</span></div>;
export const Note = ({ children }: { children: ReactNode }) => <p className="wf-note">{children}</p>;
export const Box = ({ title, children }: { title?: string; children: ReactNode }) =>
  <section className="wf-box">{title && <h3>{title}</h3>}{children}</section>;

/** Prototype controls: point of view and bike state. Not part of the product. */
export function Controls() {
  const { role, setRole, bike, setBike, shock, setShock } = useProto();
  return (
    <div className="wf-controls" role="region" aria-label="Prototype controls">
      <a href={wf("")}>Map of the wireframes</a>
      <label>View as{" "}
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
      </label>
      <label>Bike{" "}
        <select value={bike} onChange={(e) => { const b = e.target.value as BikeState; setBike(b); setShock(b === "returned-shock"); }}>
          {(Object.keys(BIKE_LABEL) as BikeState[]).map((b) => <option key={b} value={b}>{BIKE_LABEL[b]}</option>)}
        </select>
      </label>
      <label><input type="checkbox" checked={shock} onChange={(e) => setShock(e.target.checked)} /> Dropped during the rental (41.2 g)</label>
    </div>
  );
}

/** Product header: logo, then Connect wallet or the two personal areas. */
export function Header() {
  const { role, setRole } = useProto();
  return (
    <header className="wf-header">
      <A to="home" className="wf-logo">[Logo] Sharify</A>
      <nav>
        <A to="why">How it works</A>
        {role === "visitor"
          ? <Act onClick={() => setRole("renter")}>Connect wallet</Act>
          : <>
            <A to="my-rentals">My rentals</A>
            <A to="my-objects">My objects</A>
            <span className="wf-acct">{role === "owner" ? "0xDD15…FC35" : "0x6aC3…8b52"}</span>
          </>}
      </nav>
    </header>
  );
}

export type StepStatus = "waiting" | "signing" | "pending" | "confirmed" | "failed";
export type Step = { label: string; who: string; status: StepStatus };

/** Runs a list of transactions with fake timings, the way the real flow reports them. */
export function useTxRun(labels: { label: string; who: string }[], onDone: () => void, failAt = -1) {
  const [steps, setSteps] = useState<Step[]>(labels.map((l) => ({ ...l, status: "waiting" })));
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function run() {
    setRunning(true); setError(null);
    const s = labels.map((l) => ({ ...l, status: "waiting" as StepStatus }));
    for (let i = 0; i < s.length; i++) {
      if (!alive.current) return;
      s[i].status = "signing"; setSteps([...s]); await sleep(700);
      if (i === failAt) { s[i].status = "failed"; setSteps([...s]); setError("You rejected the request in your wallet. Nothing was sent; try again when you're ready."); setRunning(false); return; }
      s[i].status = "pending"; setSteps([...s]); await sleep(1100);
      if (!alive.current) return;
      s[i].status = "confirmed"; setSteps([...s]);
    }
    setRunning(false); onDone();
  }
  return { steps, running, error, run };
}

const STATUS_TEXT: Record<StepStatus, string> = {
  waiting: "Waiting", signing: "Confirm in your wallet…", pending: "Sent, waiting for the network (2–5 s)…", confirmed: "Done", failed: "Rejected",
};
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="wf-steps">
      {steps.map((s, i) => (
        <li key={i} className={s.status}>
          <span className="wf-dot" aria-hidden="true">{s.status === "confirmed" ? "✓" : i + 1}</span>
          <span><b>{s.label}</b><br /><small>{s.who} · {STATUS_TEXT[s.status]}</small></span>
        </li>
      ))}
    </ol>
  );
}
