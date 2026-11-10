import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, getStatus } from "../data/api";
import { DataError } from "../data/types";
import { Hero, StickyAction } from "../components/Hero";
import { Timeline } from "../components/Timeline";
import { Ledger } from "../components/Ledger";
import { Sources } from "../components/Sources";
import { SiteHeader } from "../components/SiteHeader";
import { HowItWorks } from "../components/HowItWorks";
import { DemoSwitcher } from "../components/DemoSwitcher";
import "./object-page.css";
import "./site.css";

/** Loading and failure states. The glow means "the chain is answering", so failures get none. */
function Message({ title, children, glow = false }: { title: React.ReactNode; children: React.ReactNode; glow?: boolean }) {
  return (
    <section className="hero message">
      {glow && <div className="glow" aria-hidden="true"><i className="glow-blue" /><i className="grain" /></div>}
      <div className="hero-head">
        <h1>{title}</h1>
        <p className="hero-summary">{children}</p>
      </div>
    </section>
  );
}

export function ObjectPage({ id }: { id: number }) {
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const status = useQuery({ queryKey: ["status"], queryFn: getStatus, refetchInterval: 4_000 });
  const obj = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000, retry: 1 });
  const err = obj.error instanceof DataError ? obj.error : null;

  let body: React.ReactNode;
  if (obj.data && net.data) {
    body = (
      <>
        <Hero d={obj.data} />
        <Timeline d={obj.data} explorer={net.data.explorer} />
        <Ledger d={obj.data} explorer={net.data.explorer} />
        <HowItWorks />
        <Sources net={net.data} status={status.data} updatedAt={obj.dataUpdatedAt || undefined} />
        <StickyAction d={obj.data} />
      </>
    );
  } else if (err?.code === "not-found") {
    body = <Message title={<>There is no <em>object {id}</em> on this network.</>}>Check the number on the label of the recorder, or open the page from its QR code.</Message>;
  } else if (obj.isError) {
    body = (
      <Message title={<>The blockchain is <em>not answering</em>.</>}>
        Nothing on this page can be shown without it, and we will not show a copy from our own server instead. It retries every few seconds.
      </Message>
    );
  } else {
    body = <Message glow title={<>Reading object {id} from the <em>chain</em>…</>}>Custody, shocks and settlements come straight from the contracts.</Message>;
  }

  return (
    <div className="page">
      <SiteHeader />
      <main>{body}</main>
      <DemoSwitcher />
    </div>
  );
}
