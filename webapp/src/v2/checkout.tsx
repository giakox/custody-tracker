import { useRef, type ReactNode } from "react";
import type { ObjectDetail, TxStep } from "../data/types";
import { CASE_IMAGE } from "./caseImage";
import { label, STATUS } from "./txWords";
import { objectName, txUrl, usd } from "../ui/format";
import { SiteHeaderV2 } from "./SiteChromeV2";
import { useBarSpace } from "./ui";
import "./tokens.css";
import "./components.css";
import "./checkout.css";

/** The renting path, as the old Shell (the old RentPages.tsx (removed in lotto 5, see git history)) counts it. */
export const STAGES = ["Rule", "Deposit", "Ride", "Return", "Deposit back"] as const;
export type Stage = (typeof STAGES)[number];

/** "Step 2 of 5" and a 4 px bar. */
export function StepBar({ n, total, name, label = "Steps", end }: { n: number; total: number; name: string; label?: string; end?: ReactNode }) {
  return (
    <div className="v2-co-progress">
      <div className="v2-co-progress-row"><p className="v2-small v2-muted">Step {n} of {total} · {name}</p>{end}</div>
      <div className="v2-co-bar" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={n}>
        <i style={{ width: `${(n / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** The renting path's bar, from the real stages above. */
export const Progress = ({ stage }: { stage: Stage }) => <StepBar n={STAGES.indexOf(stage) + 1} total={STAGES.length} name={stage} label="Rental steps" />;

/** One line for what you are renting: photo 64×64, name, price and deposit. */
export function BikeLine({ d, sub }: { d: ObjectDetail; sub?: ReactNode }) {
  return (
    <div className="v2-co-bike">
      {CASE_IMAGE && <img src={CASE_IMAGE.src} alt="" width="64" height="64" />}
      <div>
        <p className="v2-body v2-strong">{objectName(d)}</p>
        {/* Each piece stays whole; a line breaks only between them. */}
        <p className="v2-body v2-muted">{sub ?? <><span className="v2-nowrap">2 dollars an hour</span> · <span className="v2-nowrap">{usd(d.terms.collateral)} deposit</span></>}</p>
      </div>
    </div>
  );
}

/** "20 dollars" never splits across lines. */
const keepAmounts = (t: string) => t.replace(/(\d) (dollars?)/g, "$1\u00a0$2");

/** The cash-desk column: header, at most 640 wide; the one primary action sits at the end (fixed on phones). */
export function Checkout({ stage, steps, d, title, lead, action, children, note, back, aside, split, rail }: {
  stage?: Stage; steps?: { n: number; total: number; name: string; label?: string; end?: ReactNode }; d?: ObjectDetail; title: ReactNode; lead?: ReactNode;
  action?: ReactNode; children?: ReactNode; note?: ReactNode;
  /** A quiet "Back" link that sits left of the primary button (the owner's wizard). */
  back?: ReactNode;
  /** A side panel (the owner's live preview): a sticky column on desktop, a "Preview" fold above the button on phones. */
  aside?: ReactNode;
  /** Keep the 7 + 4 grid even without a side panel, so a multi-step flow never moves sideways. */
  split?: boolean;
  /** The list of every step, in the right column on wide screens; it replaces the horizontal bar there. */
  rail?: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);
  useBarSpace(bar);
  return (
    <div className={`v2 v2-co${action ? " has-action" : ""}`}>
      <SiteHeaderV2 variant="solid" />
      <main className={`v2-co-col${aside || split ? " has-aside" : ""}${rail ? " has-rail" : ""}`}>
        <div className="v2-co-main">
          {stage && <Progress stage={stage} />}
          {steps && <StepBar {...steps} />}
          {d && <BikeLine d={d} />}
          <div className="v2-co-title-row">
            <h1 className="v2-h2 v2-co-title">{typeof title === "string" ? keepAmounts(title) : title}</h1>
            {rail && steps?.end && <span className="v2-co-title-end">{steps.end}</span>}
          </div>
          {lead && <p className="v2-lead v2-muted v2-co-lead">{lead}</p>}
          {children && <div className="v2-co-body">{children}</div>}
          {aside && <details className="v2-co-fold"><summary>Preview</summary><div className="v2-gap-16">{aside}</div></details>}
          {action && <div ref={bar} className={`v2-co-action${back ? " has-back" : ""}`}>{back}{action}</div>}
          {note && <p className="v2-body v2-muted v2-co-note">{note}</p>}
        </div>
        {(aside || rail) && (
          <aside className="v2-co-aside">
            {rail}
            {aside && <div className={rail ? "v2-co-aside-preview" : undefined} aria-label="Preview">{aside}</div>}
          </aside>
        )}
      </main>
    </div>
  );
}

/** Every step of a flow, as a vertical list: done (ticked, a link back), current, to do. Wide screens only. */
export function StepRail({ names, current, hrefFor, label, linkDone = true }: { names: string[]; current: number; hrefFor: (n: number) => string; label: string; linkDone?: boolean }) {
  return (
    <nav className="v2-rail" aria-label={label}>
      <ol>
        {names.map((name, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "todo";
          const inner = (
            <>
              <span className="v2-rail-dot" aria-hidden="true">{state === "done" && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
              <span className="v2-rail-name">{name}</span>
            </>
          );
          return (
            <li key={name} className={`v2-rail-step is-${state}${n < current ? " line-done" : ""}`} aria-current={state === "current" ? "step" : undefined}>
              {state === "done" && linkDone ? <a className="v2-rail-hit" href={hrefFor(n)}>{inner}<span className="v2-sr"> (done, go back to this step)</span></a> : <span className="v2-rail-hit">{inner}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** A spinning ring; still when the reader asked for less motion. */
export const Spinner = ({ size = 24 }: { size?: number }) => <span className="v2-spin" style={{ width: size, height: size }} aria-hidden="true" />;

/** The wallet signatures and the steps the relayer does, as a vertical list (same words as TxSteps). */
export function StepList({ steps, deposit, explorer, viewer = "renter" }: { steps: TxStep[]; deposit: string; explorer: string | null; viewer?: "renter" | "owner" }) {
  return (
    <ol className="v2-steps-list">
      {steps.map((s, i) => {
        const url = s.tx ? txUrl(explorer, s.tx) : null;
        const busy = s.status === "signing" || s.status === "pending";
        return (
          <li key={`${s.id}-${i}`} className={`v2-step is-${s.status}`} aria-current={busy ? "step" : undefined}>
            <span className="v2-step-dot" aria-hidden="true">
              {s.status === "confirmed" && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span className="v2-step-text">
              <span className="v2-body">{label(s, deposit, viewer)}</span>
              <span className="v2-body v2-muted">
                {s.viaWallet ? "" : "Nothing to do on your side · "}
                {s.error ?? STATUS[s.status]}
                {s.tx && s.status === "confirmed" && url && <> · <a className="v2-textlink" href={url} target="_blank" rel="noreferrer" title={s.tx}>proof</a></>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** An error is a plain sentence; the way on is the page's own button ("Try again"). */
export const ErrorLine = ({ children }: { children: ReactNode }) => <p className="v2-body v2-co-error" role="alert">{children}</p>;

/** Money rows with the amount on the right. */
export function Bill({ rows }: { rows: { k: ReactNode; v: ReactNode; strong?: boolean }[] }) {
  return (
    <dl className="v2-bill">
      {rows.map((r, i) => <div key={i} className={r.strong ? "is-strong" : ""}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
    </dl>
  );
}
