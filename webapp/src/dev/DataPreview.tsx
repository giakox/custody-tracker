// Developer page: shows what src/data returns for the current scenario and runs the flows.
// Not part of the designed interface (no styling on purpose).
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../data/api";
import { DataError, type TxStep } from "../data/types";
import { describeScenarios } from "../data/mock/scenarios";
import { mockScenario } from "../data/mock/source";

const json = (v: unknown) => JSON.stringify(v, null, 1);

export function DataPreview() {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ["status"], queryFn: api.getStatus });
  const account = useQuery({ queryKey: ["account"], queryFn: api.getAccount });
  const objects = useQuery({ queryKey: ["objects"], queryFn: api.listObjects });
  const one = useQuery({ queryKey: ["object", 1], queryFn: () => api.getObject(1), enabled: !!objects.data?.length });
  const lastSeq = one.data?.lastSeq;
  const readings = useQuery({ queryKey: ["readings", 1, lastSeq], queryFn: () => api.getReadings(1, lastSeq!), enabled: lastSeq != null, retry: false });
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [flowError, setFlowError] = useState<string | null>(null);

  const run = (fn: (on: (s: TxStep[]) => void) => Promise<void>) => async () => {
    setFlowError(null);
    try { await fn(setSteps); } catch (e) { setFlowError(e instanceof DataError ? `${e.code}: ${e.message}` : String(e)); }
    qc.invalidateQueries();
  };

  return (
    <main style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, padding: 16 }}>
      <h1 style={{ fontSize: 14 }}>Data preview · scenario “{mockScenario.name}”</h1>
      <p>{describeScenarios().map((s) => <a key={s.name} href={`?scenario=${s.name}`} title={s.description} style={{ marginRight: 10 }}>{s.name}</a>)}</p>
      <p>status {json(status.data)} · account {account.data ? account.data.label : "none"}</p>
      <p>
        Flows on object #1:{" "}
        <button onClick={run((on) => api.proposeHandover(1, "0x14875694BC86727565c5B799a28475c0267CA41A", on))}>owner: offer to alice</button>{" "}
        <button onClick={run((on) => api.startRental(1, on))}>renter: unlock</button>{" "}
        <button onClick={run((on) => api.requestReturn(1, on))}>renter: return</button>{" "}
        <button onClick={run((on) => api.confirmReturn(1, on))}>owner: confirm return</button>{" "}
        <button onClick={run((on) => api.demoStartRental(1, "0x6aC3e1F0d2B9a4c7E58f1D03b2A9e6C4d7F18b52", on))}>demo: unlock bob</button>{" "}
        <button onClick={run((on) => api.demoEndRental(1, on))}>demo: return</button>
      </p>
      <pre data-testid="steps">{steps.map((s) => `${s.id} · ${s.signer.label} · ${s.viaWallet ? "wallet" : "relayer"} · ${s.status}${s.error ? " · " + s.error : ""}`).join("\n")}</pre>
      {flowError && <p style={{ color: "crimson" }} data-testid="flow-error">{flowError}</p>}
      {objects.error && <p style={{ color: "crimson" }}>{String(objects.error)}</p>}
      <p data-testid="summary">{objects.isPending ? "loading…" : `${objects.data?.length ?? 0} objects: ` + (objects.data ?? []).map((o) => `#${o.id} ${o.status} fees ${o.totalFees}`).join(" · ")}</p>
      {one.data && (
        <>
          <p data-testid="detail">
            #{one.data.id} {one.data.status} · custodian {one.data.custodian.label} · seq {one.data.firstSeq}–{one.data.lastSeq} · gaps {json(one.data.gaps)}
            <br />periods: {one.data.periods.map((p) => `${p.period}:${p.custodian.label}:${p.maxPeakCg ?? "—"}`).join(" ")}
            <br />rentals: {one.data.rentals.map((r) => `${r.renter.label}/${r.status}/${r.settlement ? `tier ${r.settlement.tier} fee ${r.settlement.fee} cause ${r.settlement.causeSeq}` : `now ${json(r.current)}`}`).join(" · ")}
            <br />late batches: {one.data.batches.filter((b) => b.recordedBeforeHandoff).map((b) => `seq ${b.seq} → ${b.custodian.label} (${b.maxPeakCg})`).join(", ") || "none"}
            <br />pending: {one.data.pendingHandoff ? `${one.data.pendingHandoff.from.label} → ${one.data.pendingHandoff.to.label}` : "none"}
          </p>
          <p data-testid="readings">readings of seq {lastSeq}: {readings.error ? String(readings.error) : readings.data ? `${readings.data.length} · first ${json(readings.data[0])}` : "…"}</p>
        </>
      )}
    </main>
  );
}
