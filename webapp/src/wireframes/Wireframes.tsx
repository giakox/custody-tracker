// Clickable black-and-white wireframes of the whole product, at #/wireframes/…
// Separate from the designed object page: no palette, no glow, no shared styles.
import { ProtoProvider } from "./state";
import { Controls, Header } from "./ui";
import { BikePage, HomePage, IndexPage, VerifyPage, WhyPage } from "./pages-public";
import { ActivePage, DepositPage, MyRentalsPage, OutcomePage, ReceiptPage, ReturnPage, RulePage, WaitingPage, WalletPage } from "./pages-rent";
import { AddPage, ConfirmReturnPage, MyObjectsPage } from "./pages-owner";
import "./wireframes.css";

function route(parts: string[]) {
  const [a, b] = parts;
  switch (a) {
    case undefined: return <IndexPage />;
    case "home": return <HomePage />;
    case "bike": return <BikePage />;
    case "verify": return <VerifyPage />;
    case "why": return <WhyPage />;
    case "my-rentals": return <MyRentalsPage />;
    case "receipt": return <ReceiptPage />;
    case "my-objects": return <MyObjectsPage />;
    case "confirm-return": return <ConfirmReturnPage />;
    case "add": return <AddPage n={Math.min(6, Math.max(1, Number(b) || 1))} />;
    case "rent":
      switch (b) {
        case "wallet": return <WalletPage />;
        case "deposit": return <DepositPage />;
        case "active": return <ActivePage />;
        case "return": return <ReturnPage />;
        case "waiting": return <WaitingPage />;
        case "outcome": return <OutcomePage />;
        default: return <RulePage />;
      }
    default: return <IndexPage />;
  }
}

export function Wireframes({ parts }: { parts: string[] }) {
  return (
    <ProtoProvider>
      <div className="wf">
        <Controls />
        {parts.length > 0 && <Header />}
        <main key={parts.join("/")}>{route(parts)}</main>
      </div>
    </ProtoProvider>
  );
}
