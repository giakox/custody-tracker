import type { TxStep } from "../data/types";
import { shortHex, txUrl } from "../ui/format";

/** Words for a step: what happens, from the renter's point of view. Copy lives here, not in the data. */
function label(s: TxStep, deposit: string, viewer: "renter" | "owner") {
  const owner = s.signer.role === "owner";
  if (viewer === "owner" && s.id === "accept") return "You confirm the bike is back with you";
  switch (s.id) {
    case "propose": return owner ? "The owner offers you the bike" : "You hand the bike back to the owner";
    case "accept": return owner ? "The owner confirms it's back" : "You take custody of the bike";
    case "faucet": return `You get ${deposit} test dUSD (first time only)`;
    case "approve": return "You allow the contract to take deposits (once)";
    case "deposit": return `You lock the ${deposit} deposit`;
    case "settle": return "The contract settles the deposit";
    case "register": return "You register the recorder's key";
    case "create": return "You create the object, owned by you";
    case "setTerms": return "You set the deposit and the rules";
  }
}

const STATUS: Record<TxStep["status"], string> = {
  waiting: "Waiting",
  signing: "Confirm in your wallet",
  pending: "Sent, waiting for the network",
  confirmed: "Done",
  failed: "Not sent",
};

export function TxSteps({ steps, deposit, explorer, viewer = "renter" }: { steps: TxStep[]; deposit: string; explorer: string | null; viewer?: "renter" | "owner" }) {
  return (
    <ol className="tx-steps">
      {steps.map((s, i) => {
        const url = s.tx ? txUrl(explorer, s.tx) : null;
        return (
          <li key={`${s.id}-${i}`} className={`tx-step ${s.status}`} aria-current={s.status === "signing" || s.status === "pending" ? "step" : undefined}>
            <span className="tx-dot" aria-hidden="true">{s.status === "confirmed" ? "✓" : i + 1}</span>
            <span className="tx-body">
              <span className="tx-label">{label(s, deposit, viewer)}</span>
              <span className="tx-status mono">
                {s.viaWallet ? "" : "Signed by the owner's side · "}
                {s.error ?? STATUS[s.status]}
                {s.tx && s.status === "confirmed" && <> · {url ? <a href={url} target="_blank" rel="noreferrer">{shortHex(s.tx)}</a> : shortHex(s.tx)}</>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
