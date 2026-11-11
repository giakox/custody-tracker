import { DataPreview } from "./dev/DataPreview";
import { useEffect } from "react";
import { useRoute } from "./ui/router";
import { Wireframes } from "./wireframes/Wireframes";
import { HomeV2 } from "./v2/HomeV2";
import { BikesV2 } from "./v2/BikesV2";
import { ObjectV2 } from "./v2/ObjectV2";
import { ActiveV2, DepositV2, OutcomeV2, ReturnV2, RuleV2, WaitingV2, WalletV2 } from "./v2/RentV2";
import { ConfirmV2 } from "./v2/ConfirmV2";
import { MyRentalsV2, ReceiptV2 } from "./v2/MineV2";
import { AddV2, MyObjectsV2 } from "./v2/OwnerV2";
import { VerifyV2 } from "./v2/VerifyV2";
import { DesignV2 } from "./v2/DesignV2";


/** The tab and history read as plain words: "Rent: the rule · Sharify". */
const TITLES: Record<string, string> = { bikes: "Find a bike", object: "The bike", rent: "Rent a bike", "my-rentals": "Your rentals", "my-objects": "Your bikes", "confirm-return": "Confirm a return", add: "Add your bike", receipt: "Receipt", verify: "Check a reading", design: "How Sharify is designed" };

const num = (v: string | undefined, fallback = 1) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : fallback; };

export function App() {
  const parts = useRoute(true);
  const [page, a, b] = parts;
  // A new page starts at its top (a hash change keeps the old scroll). #/bikes is its own page now, so it does too.
  const where = parts.join("/");
  useEffect(() => { window.scrollTo(0, 0); }, [where]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = page && TITLES[page] ? `${TITLES[page]} · Sharify` : "Sharify: borrow a bike, the rule decides"; }, [page]);
  if (page === "v2") return <HomeV2 />;
  if (page === "bikes") return <BikesV2 />;
  if (page === "dev") return <DataPreview />;
  if (page === "wireframes") return <Wireframes parts={parts.slice(1)} />;
  if (page === "object") return <ObjectV2 id={num(a)} />;
  if (page === "rent") {
    const id = num(a);
    switch (b) {
      case "wallet": return <WalletV2 id={id} />;
      case "deposit": return <DepositV2 id={id} />;
      case "active": return <ActiveV2 id={id} />;
      case "return": return <ReturnV2 id={id} />;
      case "waiting": return <WaitingV2 id={id} />;
      case "outcome": return <OutcomeV2 id={id} />;
      default: return <RuleV2 id={id} />;
    }
  }
  if (page === "my-rentals") return <MyRentalsV2 />;
  if (page === "my-objects") return <MyObjectsV2 />;
  if (page === "confirm-return") return <ConfirmV2 id={num(a)} />;
  if (page === "add") return <AddV2 n={Math.min(6, num(a))} />;
  if (page === "receipt") return <ReceiptV2 id={num(a)} period={Number(b) || 0} />;
  if (page === "verify") return <VerifyV2 id={num(a)} seq={b !== undefined && Number.isFinite(Number(b)) ? Number(b) : null} />;
  if (page === "design") return <DesignV2 />;
  return <HomeV2 />;
}
