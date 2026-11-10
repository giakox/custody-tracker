import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { describeScenarios } from "../data/mock/scenarios";
import { mockActions, mockScenario } from "../data/mock/source";
import { applyTheme, currentTheme, THEMES, type ThemeId } from "../ui/theme";

const VIEWERS = [
  { id: "none", label: "Visitor" },
  { id: "alice", label: "Alice (renter)" },
  { id: "bob", label: "Bob (renter)" },
  { id: "owner", label: "Owner" },
];
const STATES = ["default", "rented", "rented-clean", "handoff", "return-pending", "strong", "late-batch", "relayer-offline"];

/** Demo-only control for the presentation: who is looking and what state the bike is in.
 *  Small and out of the way on purpose; it reloads the page with ?scenario= and ?as=. */
export function DemoSwitcher({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const as = params.get("as") ?? (mockScenario.account ?? "none");
  const descr = Object.fromEntries(describeScenarios().map((s) => [s.name, s.description]));
  const apply = (key: "scenario" | "as" | "theme", value: string) => {
    if (key === "theme") applyTheme(value as ThemeId);
    params.set(key, value);
    window.location.search = params.toString();
  };
  return (
    <div className={`demo ${inline ? "demo-inline" : ""} ${open ? "open" : ""}`}>
      {open && (
        <div className="demo-panel" role="dialog" aria-label="Demo controls">
          <label>Look
            <select value={currentTheme()} onChange={(e) => apply("theme", e.target.value)}>
              {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label>View as
            <select value={as} onChange={(e) => apply("as", e.target.value)}>
              {VIEWERS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </label>
          <label>Bike
            <select value={mockScenario.name} onChange={(e) => apply("scenario", e.target.value)}>
              {STATES.map((s) => <option key={s} value={s} title={descr[s]}>{s}</option>)}
            </select>
          </label>
          <p>{descr[mockScenario.name]}</p>
          <button type="button" className="demo-act" onClick={() => { mockActions.drop(1); qc.invalidateQueries(); }}>Drop the demo bike (41.2 g)</button>
          <button type="button" className="demo-act" onClick={() => { mockActions.setUpWallet(); setOpen(false); qc.invalidateQueries(); }}>Wallet already set up (2 signatures)</button>
          <p>Only counts while the bike is rented: the next batch carries the shock.</p>
        </div>
      )}
      <button type="button" className="demo-toggle mono" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Demo"}</button>
    </div>
  );
}
