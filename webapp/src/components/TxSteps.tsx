import type { TxStep } from "../data/types";
import { txUrl } from "../ui/format";

/** Words for a step: what happens, from the renter's point of view. Copy lives here, not in the data. */
function label(s: TxStep, deposit: string, viewer: "renter" | "owner") {
  const owner = s.signer.role === "owner";
  if (viewer === "owner" && s.id === "accept") return "You confirm the bike is back with you";
  switch (s.id) {
    case "propose": return owner ? "The owner offers you the bike" : "You hand the bike back to the owner";
    case "accept": return owner ? "The owner confirms it's back" : "You take the bike";
    case "faucet": return `You get ${deposit} in test money (first time only)`;
    case "approve": return "You allow deposits from this wallet (once)";
    case "deposit": return `You leave the ${deposit} deposit`;
    case "settle": return "Your deposit comes back by the rule";
    case "register": return "You link the recorder to you";
    case "create": return "You add your bike";
    case "setTerms": return "You publish the deposit and the rules";
  }
}

const STATUS: Record<TxStep["status"], string> = {
  waiting: "Waiting",
  signing: "Confirm in your wallet",
  pending: "Sent, a few seconds…",
  confirmed: "Done",
  failed: "Not sent",
};

export function TxSteps({ steps, deposit, explorer, viewer = "renter" }: { steps: TxStep[]; deposit: string; explorer: string | null; viewer?: "renter" | "owner" }) {
  return (
    <ol className="tx-steps">
      {steps.map((s, i) => {
        const url = s.tx ? txUrl(explorer, s.tx) : null;
        const n = steps.slice(0, i + 1).filter((x) => x.viaWallet).length;
        return (
          <li key={`${s.id}-${i}`} className={`tx-step ${s.status} ${s.viaWallet ? "" : "auto"}`} aria-current={s.status === "signing" || s.status === "pending" ? "step" : undefined}>
            <span className="tx-dot" aria-hidden="true">{s.status === "confirmed" ? "✓" : s.viaWallet ? n : ""}</span>
            <span className="tx-body">
              <span className="tx-label">{label(s, deposit, viewer)}</span>
              <span className="tx-status">
                {s.viaWallet ? "" : "Nothing to do on your side · "}
                {s.error ?? STATUS[s.status]}
                {s.tx && s.status === "confirmed" && url && <> · <a className="tx-proof" href={url} target="_blank" rel="noreferrer" title={s.tx}>proof</a></>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
