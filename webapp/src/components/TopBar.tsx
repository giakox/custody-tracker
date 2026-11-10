import { useEffect, useState } from "react";
import type { NetworkInfo, SourceStatus } from "../data/types";
import { ago } from "../ui/format";

/** Wordmark + where the data comes from and how fresh it is. */
export function TopBar({ net, status, updatedAt }: { net?: NetworkInfo; status?: SourceStatus; updatedAt?: number }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const chainDown = status?.chain === "unreachable";
  return (
    <header className="topbar">
      <a className="wordmark" href="#/">
        {/* 3× of the 28 px display height: the original is 1216 px wide and 157 KB. */}
        <img src="./brand/sharify-logo-dark-header.png" alt="Sharify" width="104" height="28" />
      </a>
      <div className="source mono">
        {net?.isMock && <span className="sample" title="Sample data: not read from the blockchain">Sample data</span>}
        <span className={`live ${chainDown ? "down" : ""}`} aria-hidden="true" />
        <span>{net ? net.label : "Connecting"}</span>
        {updatedAt ? <span className="fresh">updated {ago(updatedAt)}</span> : null}
      </div>
    </header>
  );
}
