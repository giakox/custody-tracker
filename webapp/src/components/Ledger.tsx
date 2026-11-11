import { Fragment } from "react";
import type { Batch, ObjectDetail } from "../data/types";
import { g, hms, nameOf, shortHex, txUrl } from "../ui/format";
import { tierOf } from "../ui/story";
import { href } from "../ui/router";
import { TierMeter } from "./TierMeter";

function Row({ b, d, explorer }: { b: Batch; d: ObjectDetail; explorer: string | null }) {
  const tier = tierOf(d, b.maxPeakCg);
  const url = txUrl(explorer, b.anchor.tx);
  return (
    <tr id={`batch-${b.seq}`} className={`${tier > 0 ? "has-shock" : ""} ${b.recordedBeforeHandoff ? "late" : ""}`}>
      <td className="c-seq">{b.seq}</td>
      <td className="c-time"><time dateTime={new Date(b.anchor.at).toISOString()}>{hms(b.anchor.at)}</time></td>
      <td className="c-who">
        {nameOf(b.custodian)}
        {b.recordedBeforeHandoff && <span className="late-note">recorded before the return</span>}
      </td>
      <td className="c-peak"><span className="peak-cell"><span className={tier > 0 ? "shock" : ""}>{g(b.maxPeakCg)}</span><TierMeter tier={tier} /></span></td>
      <td className="c-tx">{url ? <a href={url} target="_blank" rel="noreferrer">{shortHex(b.anchor.tx)}</a> : shortHex(b.anchor.tx)}</td>
    </tr>
  );
}

function GapRow({ from, to, missing }: { from: number; to: number; missing: number }) {
  return (
    <tr className="gap">
      <td className="c-seq">{from === to ? from : `${from}–${to}`}</td>
      <td colSpan={4}>{missing === 1 ? "1 batch" : `${missing} batches`} missing from the record</td>
    </tr>
  );
}

export function Ledger({ d, explorer }: { d: ObjectDetail; explorer: string | null }) {
  const rows = [...d.batches].reverse();
  return (
    <section className="block ledger" aria-labelledby="ledger-title">
      <div className="block-intro">
        <h2 id="ledger-title">The ledger</h2>
        <p>
          Every batch the chip signed, in sequence. On-chain there is only each batch’s fingerprint (the root);
          the readings themselves stay off-chain and can be proven against it.
          {" "}<a className="link" href={href(`verify/${d.id}`)}>Verify a reading yourself</a>
        </p>
      </div>
      <div className="table-wrap">
        <table className="mono">
          <caption className="sr-only">Anchored batches, newest first</caption>
          <thead>
            <tr>
              <th scope="col" className="c-seq">Seq</th>
              <th scope="col" className="c-time">Anchored</th>
              <th scope="col" className="c-who">Custodian</th>
              <th scope="col" className="c-peak">Peak</th>
              <th scope="col" className="c-tx">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => {
              const older = rows[i + 1];
              const gap = older && b.seq - older.seq > 1;
              return (
                <Fragment key={b.seq}>
                  <Row b={b} d={d} explorer={explorer} />
                  {gap && <GapRow from={older.seq + 1} to={b.seq - 1} missing={b.seq - older.seq - 1} />}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {d.firstSeq !== null && d.firstSeq > 1 && (
        <p className="ledger-foot">
          The record starts at seq {d.firstSeq}: the chip had already counted {d.firstSeq - 1} {d.firstSeq - 1 === 1 ? "batch" : "batches"} before it was registered.
        </p>
      )}
    </section>
  );
}
