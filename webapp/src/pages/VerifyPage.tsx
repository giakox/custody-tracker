// Verify a reading: the strongest moment of the live demo. Pick a reading, then ask the contract
// whether it belongs to the batch the recorder signed. The answer must be unmistakable.
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, getProof, getReadings } from "../data/api";
import { DataError, type ProofResult } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { TierMeter } from "../components/TierMeter";
import { addressUrl, g, hm, hms, day, objectName, possessive, shortHex, TIER_NAMES, txUrl } from "../ui/format";
import { href } from "../ui/router";
import { tierOf } from "../ui/story";
import "./object-page.css";
import "./site.css";
import "./rent.css";
import "./verify.css";

export function VerifyPage({ id, seq: seqParam }: { id: number; seq: number | null }) {
  const obj = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id) });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const d = obj.data;
  // default: the latest batch with a shock, else the latest batch
  const seq = seqParam ?? (d ? ([...d.batches].reverse().find((b) => tierOf(d, b.maxPeakCg) > 0) ?? d.batches.at(-1))?.seq ?? null : null);
  const batch = d?.batches.find((b) => b.seq === seq) ?? null;
  const readings = useQuery({ queryKey: ["readings", id, seq], queryFn: () => getReadings(id, seq!), enabled: seq !== null, retry: false });
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    if (readings.data && index === null) {
      const max = readings.data.reduce((best, r) => (r.peakCg > readings.data[best].peakCg ? r.index : best), 0);
      setIndex(max);
    }
  }, [readings.data, index]);
  const [check, setCheck] = useState<{ state: "idle" | "asking" | "done" | "error"; result?: ProofResult; error?: string }>({ state: "idle" });
  const pick = (i: number) => { setIndex(i); setCheck({ state: "idle" }); };
  const run = async () => {
    if (seq === null || index === null) return;
    setCheck({ state: "asking" });
    try {
      const [res] = await Promise.all([getProof(id, seq, index), new Promise((r) => setTimeout(r, 900))]);
      setCheck({ state: "done", result: res });
    } catch (e) { setCheck({ state: "error", error: e instanceof DataError ? e.message : String(e) }); }
  };

  const reading = index !== null ? readings.data?.[index] : undefined;
  const explorer = net.data?.explorer ?? null;
  const contract = net.data?.contracts.custodyLog;
  const maxPeak = readings.data ? Math.max(...readings.data.map((r) => r.peakCg)) : 0;

  return (
    <div className="page">
      <SiteHeader />
      <main className="rent rent-wide verify">
        {d && <p><a className="link back" href={href(`object/${d.id}`)}>{objectName(d)}</a></p>}
        <h1>Verify a <em>reading</em>.</h1>
        <p className="lead">Pick one second of the ride and ask the blockchain whether it is really part of what the recorder signed. You don't have to trust Sharify.</p>

        {readings.isError && (
          <p className="notice">The raw readings are kept by the relayer, which is offline right now. The proof needs them; everything else on the bike page still comes from the chain.</p>
        )}

        {batch && readings.data && d && (
          <>
            <section className={`vc state-${check.state}`} aria-label="Check one reading">
              <div className="vc-reading">
                <p className="vc-kicker">Batch {batch.seq} · {readings.data.length} seconds of {possessive(batch.custodian)} ride · signed {day(batch.anchor.at)}, {hm(batch.anchor.at)}</p>
                <ol className="bars" aria-label="Peak of each second in this batch; pick one">
                  {readings.data.map((r) => {
                    const t = tierOf(d, r.peakCg);
                    return (
                      <li key={r.index}>
                        <button type="button" className={`bar ${t > 0 ? "is-shock" : ""} ${r.index === index ? "is-picked" : ""}`} onClick={() => pick(r.index)}
                          aria-label={`Second ${r.index + 1}: ${g(r.peakCg)} at ${hms(r.t)}`} data-tip={`${g(r.peakCg)}, ${hms(r.t)}`} aria-pressed={r.index === index}>
                          <i style={{ height: `${Math.max(6, (Math.log(r.peakCg) / Math.log(Math.max(maxPeak, 200))) * 100)}%` }} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
                {reading && (
                  <p className="vc-pick">
                    <span className="vc-pick-n">Second {reading.index + 1} of {readings.data.length}</span>
                    <span className={`vc-pick-g ${tierOf(d, reading.peakCg) ? "shock" : ""}`}>{g(reading.peakCg)}</span>
                    <TierMeter tier={tierOf(d, reading.peakCg)} showNone />
                    <span className="vc-pick-when">at {hms(reading.t)}, near {reading.lat.toFixed(4)}, {reading.lon.toFixed(4)}</span>
                  </p>
                )}
              </div>

              <div className="vc-act" aria-live="polite">
                {check.state === "idle" && (
                  <>
                    <button type="button" className="btn btn-primary btn-lg" onClick={run} disabled={!reading}>Check it on the blockchain</button>
                    <p className="vc-how">The contract recomputes this batch's fingerprint from the reading and compares it with the one the recorder signed.</p>
                  </>
                )}
                {check.state === "asking" && (
                  <div className="v-asking"><span className="spinner" aria-hidden="true" /><p>Asking the contract… <span className="mono">CustodyLog.verifyReading</span></p></div>
                )}
                {check.state === "done" && check.result && (
                  check.result.verifiedOnChain ? (
                    <div className="v-result ok">
                      <span className="v-mark" aria-hidden="true">✓</span>
                      <div>
                        <p className="v-title">Verified on-chain.</p>
                        <p className="v-sub">This {g(check.result.reading.peakCg)} reading is part of batch {batch.seq}, signed by the recorder and anchored {day(batch.anchor.at)} at {hm(batch.anchor.at)} in {txUrl(explorer, batch.anchor.tx)
                          ? <a className="link mono" href={txUrl(explorer, batch.anchor.tx)!} target="_blank" rel="noreferrer">{shortHex(batch.anchor.tx)}</a>
                          : <span className="mono">{shortHex(batch.anchor.tx)}</span>}. Anyone can check this.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="v-result bad">
                      <span className="v-mark" aria-hidden="true">×</span>
                      <div>
                        <p className="v-title">Not on the chain.</p>
                        <p className="v-sub">The contract could not link this reading to the batch's fingerprint: it was changed, or it never belonged to this batch.</p>
                      </div>
                    </div>
                  )
                )}
                {check.state === "error" && <p className="notice error">{check.error}</p>}
                {check.state !== "asking" && check.state !== "idle" && <button type="button" className="link-btn again" onClick={() => setCheck({ state: "idle" })}>Check another second</button>}
              </div>
            </section>

            {check.result && (
              <section className="v-proof">
                <h2>Check it yourself</h2>
                <p>Call <span className="mono">verifyReading</span> on the CustodyLog contract{contract && <> at {addressUrl(explorer, contract)
                  ? <a className="link mono" href={addressUrl(explorer, contract)!} target="_blank" rel="noreferrer">{shortHex(contract, 6, 4)}</a>
                  : <span className="mono">{shortHex(contract, 6, 4)}</span>}</>} with these values. It's a read: free, and it needs no account.</p>
                <dl className="v-hex mono">
                  <div><dt>object id</dt><dd>{d.id}</dd></div>
                  <div><dt>seq</dt><dd>{batch.seq}</dd></div>
                  <div><dt>index</dt><dd>{check.result.reading.index}</dd></div>
                  <div><dt>record</dt><dd>{check.result.record}</dd></div>
                  <div><dt>proof</dt><dd>{check.result.proof.map((p) => <span key={p}>{p}</span>)}</dd></div>
                  <div><dt>root (signed)</dt><dd>{check.result.root}</dd></div>
                </dl>
                <p className="hint-line">The signature proves which recorder produced the data and that it wasn't changed afterwards; it doesn't prove the sensor itself was intact. Peak level: {TIER_NAMES[tierOf(d, check.result.reading.peakCg)]}.</p>
              </section>
            )}
          </>
        )}
        {!d && <p className="lead">Reading the record from the chain…</p>}
      </main>
      <DemoSwitcher />
    </div>
  );
}
