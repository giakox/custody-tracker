// Verify a reading (v2). Queries, the default batch, the pick and the call to getProof come unchanged from
// the old VerifyPage.tsx (removed in lotto 5, see git history); only the markup is new. The answer must be unmistakable, in words.
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, getProof, getReadings } from "../data/api";
import { DataError, type ProofResult } from "../data/types";
import { addressUrl, day, g, hm, hms, objectName, possessive, shortHex, TIER_NAMES, txUrl } from "../ui/format";
import { href } from "../ui/router";
import { tierOf } from "../ui/story";
import { Button } from "./ui";
import { ErrorLine, Spinner } from "./checkout";
import { PageV2 } from "./lists";

/** A long hex value, shortened on screen, whole in the clipboard. */
function Hex({ v }: { v: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  return <><dd className="v2-mono" title={v}>{v.length > 18 ? shortHex(v, 8, 6) : v}</dd><span><button type="button" className="v2-copy" onClick={copy} aria-label={`Copy ${v}`}>{copied ? "Copied" : "Copy"}</button></span></>;
}

export function VerifyV2({ id, seq: seqParam }: { id: number; seq: number | null }) {
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
  // On a phone the strip scrolls sideways: keep the picked second in view.
  const strip = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>(".v2-reading.is-picked");
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [index, readings.data]);

  return (
    <PageV2 narrow={720}>
      {d && <p><a className="v2-link-quiet" href={href(`object/${d.id}`)}>← {objectName(d)}</a></p>}
      <p className="v2-eyebrow v2-gap-24">Verify a reading</p>
      <h1 className="v2-h2">{batch && reading ? `Was this ${g(reading.peakCg)} reading really signed?` : "Verify a reading."}</h1>
      <p className="v2-lead v2-muted v2-gap-16">Pick a second of the ride. The blockchain checks it, not Sharify.</p>

      {readings.isError && (
        <section className="v2-page-section" aria-live="polite">
          <div className="v2-verdict">
            <p className="v2-verdict-title">The raw readings are offline right now.</p>
            <p className="v2-body v2-muted v2-gap-8">They are kept by the relayer, which isn't answering. A check needs them; the bike's record and the rule still come straight from the chain.</p>
          </div>
          <div className="v2-page-actions">
            <Button onClick={() => readings.refetch()} disabled={readings.isFetching}>{readings.isFetching ? "Asking again…" : "Try again"}</Button>
            {d && <Button variant="secondary" href={href(`object/${d.id}`)}>Back to the bike</Button>}
          </div>
        </section>
      )}

      {batch && readings.data && d && (
        <>
          <section className="v2-page-section" aria-label="Check one reading">
            <p className="v2-small v2-muted">Batch {batch.seq} · {readings.data.length} seconds of {possessive(batch.custodian)} ride · signed {day(batch.anchor.at)}, {hm(batch.anchor.at)}</p>
            {/* One 24 px circle per second; the picked one differs only by colour. */}
            <ol className="v2-readings" ref={strip} aria-label="Each second in this batch; pick one">
              {readings.data.map((r) => {
                const t = tierOf(d, r.peakCg);
                return (
                  <li key={r.index} className={t > 0 ? "has-knock" : undefined}>
                    <button type="button" className={`v2-reading${r.index === index ? " is-picked" : ""}`} onClick={() => pick(r.index)}
                      aria-label={`Second ${r.index + 1}: ${g(r.peakCg)} at ${hms(r.t)}${t > 0 ? `, a ${TIER_NAMES[t]} knock` : ""}`}
                      title={`${g(r.peakCg)}${t > 0 ? `, ${TIER_NAMES[t]} knock` : ""}, ${hms(r.t)}`} aria-pressed={r.index === index} />
                  </li>
                );
              })}
            </ol>
            {reading && (
              <p className="v2-body v2-gap-16">
                <span className="v2-strong">Second {reading.index + 1} of {readings.data.length}: {g(reading.peakCg)}</span>
                <span className="v2-muted"> · {(() => { const t = tierOf(d, reading.peakCg); return t ? `${TIER_NAMES[t]} knock` : "no knock"; })()} · at {hms(reading.t)}, near {reading.lat.toFixed(4)}, {reading.lon.toFixed(4)}</span>
              </p>
            )}
          </section>

          <section className="v2-page-section" aria-live="polite">
            {check.state === "idle" && (
              <>
                <Button onClick={run} disabled={!reading}>Check it on the blockchain</Button>
                <p className="v2-body v2-muted v2-gap-16">The contract recomputes the fingerprint and compares it with the signed one.</p>
              </>
            )}
            {check.state === "asking" && (
              <div className="v2-verdict"><p className="v2-body" style={{ display: "flex", alignItems: "center", gap: 16 }}><Spinner />Asking the contract… <span className="v2-mono">CustodyLog.verifyReading</span></p></div>
            )}
            {check.state === "done" && check.result && (
              <div className="v2-verdict">
                {check.result.verifiedOnChain ? (
                  <>
                    <p className="v2-verdict-title">Verified on-chain.</p>
                    <p className="v2-body v2-gap-8">This {g(check.result.reading.peakCg)} reading is part of batch {batch.seq}, signed by the recorder and anchored {day(batch.anchor.at)} at {hm(batch.anchor.at)} in {txUrl(explorer, batch.anchor.tx)
                      ? <a className="v2-textlink v2-mono" href={txUrl(explorer, batch.anchor.tx)!} target="_blank" rel="noreferrer">{shortHex(batch.anchor.tx)}</a>
                      : <span className="v2-mono">{shortHex(batch.anchor.tx)}</span>}. Anyone can check this.</p>
                  </>
                ) : (
                  <>
                    <p className="v2-verdict-title">Not on the chain.</p>
                    <p className="v2-body v2-gap-8">The contract could not link this reading to the batch's fingerprint: it was changed, or it never belonged to this batch.</p>
                  </>
                )}
              </div>
            )}
            {check.state === "error" && check.error && <ErrorLine>{check.error}</ErrorLine>}
            {check.state !== "asking" && check.state !== "idle" && <p className="v2-gap-16"><button type="button" className="v2-btn v2-btn-link" onClick={() => setCheck({ state: "idle" })}>Check another second</button></p>}
          </section>

          {!check.result && (
            <section className="v2-page-section v2-two" aria-label="What a check proves">
              <div className="v2-proves"><h2 className="v2-h3">What it proves</h2><p className="v2-small v2-muted v2-gap-8">The recorder signed this second, and nobody changed it since: not the renter, the owner or Sharify.</p></div>
              <div className="v2-proves"><h2 className="v2-h3">What it doesn't</h2><p className="v2-small v2-muted v2-gap-8">That the sensor was intact or fixed to the frame. It vouches for the data, not the hardware.</p></div>
            </section>
          )}
          {check.result && (
            <section className="v2-page-section" aria-labelledby="v-proof">
              <h2 className="v2-h3" id="v-proof">Check it yourself</h2>
              <p className="v2-body v2-muted v2-gap-8">Call <span className="v2-mono">verifyReading</span> on the CustodyLog contract{contract && <> at {addressUrl(explorer, contract)
                ? <a className="v2-textlink v2-mono" href={addressUrl(explorer, contract)!} target="_blank" rel="noreferrer">{shortHex(contract, 6, 4)}</a>
                : <span className="v2-mono">{shortHex(contract, 6, 4)}</span>}</>} with these values. It's a read: free, and it needs no account.</p>
              <dl className="v2-tech">
                <div><dt>object id</dt><dd className="v2-mono">{d.id}</dd><span /></div>
                <div><dt>seq</dt><dd className="v2-mono">{batch.seq}</dd><span /></div>
                <div><dt>index</dt><dd className="v2-mono">{check.result.reading.index}</dd><span /></div>
                <div><dt>record</dt><Hex v={check.result.record} /></div>
                {check.result.proof.map((p, i) => <div key={p}><dt>proof [{i}]</dt><Hex v={p} /></div>)}
                <div><dt>root (signed)</dt><Hex v={check.result.root} /></div>
                <div><dt>anchor tx</dt><Hex v={batch.anchor.tx} /></div>
                <div><dt>block</dt><dd className="v2-mono">{batch.anchor.block}</dd><span /></div>
              </dl>
              <p className="v2-body v2-muted v2-gap-16">The signature proves which recorder produced the data and that it wasn't changed afterwards; it doesn't prove the sensor itself was intact. Peak level: {TIER_NAMES[tierOf(d, check.result.reading.peakCg)]}.</p>
            </section>
          )}
        </>
      )}
      {!d && <p className="v2-lead v2-muted v2-gap-24">Reading the record from the chain…</p>}
    </PageV2>
  );
}
