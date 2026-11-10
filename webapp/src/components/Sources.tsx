import type { NetworkInfo, SourceStatus } from "../data/types";
import { addressUrl, ago, shortHex } from "../ui/format";

/** Closing note: where every number on the page comes from, and what is missing when the relayer is down. */
export function Sources({ net, status, updatedAt }: { net: NetworkInfo; status?: SourceStatus; updatedAt?: number }) {
  const link = (label: string, a: string) => {
    const url = addressUrl(net.explorer, a);
    return (
      <div key={label}>
        <dt>{label}</dt>
        <dd className="mono">{url ? <a href={url} target="_blank" rel="noreferrer">{shortHex(a, 6, 4)}</a> : shortHex(a, 6, 4)}</dd>
      </div>
    );
  };
  return (
    <footer className="block sources" aria-labelledby="sources-title">
      <div className="block-intro">
        <h2 id="sources-title">Where this comes from</h2>
        <p>
          Custody, shocks, collateral and settlements are read from two contracts on {net.label}. No server of ours can
          rewrite it.{status?.relayer === "offline" && <> The relayer that keeps the raw readings is offline right now: the map and the per-reading proofs are unavailable, everything else on this page is not affected.</>}
        </p>
      </div>
      <dl className="contracts">
        {link("Custody log", net.contracts.custodyLog)}
        {link("Rental escrow", net.contracts.escrow)}
        {link("Collateral token", net.contracts.token)}
        <div>
          <dt>Read from</dt>
          <dd className="mono"><span className={`live ${status?.chain === "unreachable" ? "down" : ""}`} aria-hidden="true" /> {net.label}{updatedAt ? `, ${ago(updatedAt)}` : ""}</dd>
        </div>
      </dl>
    </footer>
  );
}
