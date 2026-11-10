import type { ObjectDetail } from "../data/types";
import { hm, nameOf } from "../ui/format";

type Step = { name: string; note: string | null; state: "done" | "current" | "next"; flag?: boolean };

/** Available → Rented → Returned → Settled for the current (or last) rental cycle. */
function steps(d: ObjectDetail): Step[] {
  const last = d.rentals.at(-1);
  const p = d.pendingHandoff;
  const avail = last ? hm(d.periods[last.period - 1].start.at) : null;
  const mk = (states: Step["state"][], notes: (string | null)[], flag?: number): Step[] =>
    ["Available", "Rented", "Returned", "Deposit settled"].map((name, i) => ({ name, state: states[i], note: notes[i], flag: flag === i }));

  if (p && p.to.role !== "owner") return mk(["current", "next", "next", "next"], ["now", `offered to ${nameOf(p.to)}`, null, null]);
  if (p && last) return mk(["done", "done", "current", "next"], [avail, hm(last.started.at), `requested ${hm(p.anchor.at)}`, null]);
  if (d.status === "held-without-deposit") {
    const cur = d.periods.at(-1)!;
    return mk(["done", "current", "next", "next"], [hm(d.periods[cur.period - 1].start.at), `since ${hm(cur.start.at)}, no deposit`, null, null], 1);
  }
  if (d.status === "rented" && last) return mk(["done", "current", "next", "next"], [avail, `since ${hm(last.started.at)}`, null, null]);
  if (last?.settlement) {
    const returned = d.periods[last.period].end;
    return mk(["done", "done", "done", "done"], [avail, hm(last.started.at), returned ? hm(returned.at) : null, hm(last.settlement.anchor.at)]);
  }
  return mk(["current", "next", "next", "next"], ["now", null, null, null]);
}

export function StateLine({ d }: { d: ObjectDetail }) {
  const list = steps(d);
  return (
    <ol className="stateline" aria-label="Rental status">
      {list.map((s) => (
        <li key={s.name} className={`step ${s.state} ${s.flag ? "flag" : ""}`} aria-current={s.state === "current" ? "step" : undefined}>
          <span className="node" aria-hidden="true" />
          <span className="step-name">{s.name}</span>
          <span className="step-note mono">{s.note ?? " "}</span>
        </li>
      ))}
    </ol>
  );
}
