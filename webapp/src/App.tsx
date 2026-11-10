import { ObjectPage } from "./pages/ObjectPage";
import { HomePage } from "./pages/HomePage";
import { ActivePage, DepositPage, OutcomePage, ReturnPage, RulePage, WaitingPage, WalletPage } from "./pages/RentPages";
import { MyRentalsPage, ReceiptPage } from "./pages/MyRentalsPages";
import { AddPage, ConfirmReturnPage, MyObjectsPage } from "./pages/OwnerPages";
import { VerifyPage } from "./pages/VerifyPage";
import { DesignPage } from "./pages/DesignPage";
import { DataPreview } from "./dev/DataPreview";
import { useRoute } from "./ui/router";
import { Wireframes } from "./wireframes/Wireframes";


const num = (v: string | undefined, fallback = 1) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : fallback; };

export function App() {
  const parts = useRoute();
  const [page, a, b] = parts;
  if (page === "dev") return <DataPreview />;
  if (page === "wireframes") return <Wireframes parts={parts.slice(1)} />;
  if (page === "object") return <ObjectPage id={num(a)} />;
  if (page === "rent") {
    const id = num(a);
    switch (b) {
      case "wallet": return <WalletPage id={id} />;
      case "deposit": return <DepositPage id={id} />;
      case "active": return <ActivePage id={id} />;
      case "return": return <ReturnPage id={id} />;
      case "waiting": return <WaitingPage id={id} />;
      case "outcome": return <OutcomePage id={id} />;
      default: return <RulePage id={id} />;
    }
  }
  if (page === "my-rentals") return <MyRentalsPage />;
  if (page === "my-objects") return <MyObjectsPage />;
  if (page === "confirm-return") return <ConfirmReturnPage id={num(a)} />;
  if (page === "add") return <AddPage n={Math.min(6, num(a))} />;
  if (page === "receipt") return <ReceiptPage id={num(a)} period={Number(b) || 0} />;
  if (page === "verify") return <VerifyPage id={num(a)} seq={b !== undefined && Number.isFinite(Number(b)) ? Number(b) : null} />;
  if (page === "design") return <DesignPage />;
  return <HomePage />;
}
