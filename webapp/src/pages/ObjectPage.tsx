import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, getStatus } from "../data/api";
import { DataError } from "../data/types";
import { BookCard, ListingIntro, ListingTop, StickyAction } from "../components/Hero";
import { SiteFooter } from "../components/SiteFooter";
import { Timeline } from "../components/Timeline";
import { Ledger } from "../components/Ledger";
import { Sources } from "../components/Sources";
import { SiteHeader } from "../components/SiteHeader";
import { Moments } from "../components/HowItWorks";
import { DemoSwitcher } from "../components/DemoSwitcher";
import "./object-page.css";
import "./site.css";
import "./listing.css";

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
  const [proof, setProof] = useState(false);

  let body: React.ReactNode;
  if (obj.data && net.data) {
    const d = obj.data;
    const tier = d.status === "rented" ? d.activeRental?.current?.tier ?? 0 : 0;
    body = (
      <div className={`listing tier-glow-${tier}`}>
        <ListingTop d={d} />
        <div className="l-body">
          <div className="l-col">
            <ListingIntro d={d} />
            <div className={proof ? "proof" : "no-proof"}>
              <Timeline d={d} explorer={net.data.explorer} proof={proof} />
              <div className="proof-toggle">
                <button type="button" className="btn btn-secondary" aria-expanded={proof} onClick={() => setProof(!proof)}>{proof ? "Hide the proof" : "See the proof"}</button>
                <p>{proof ? "Transactions, batch numbers and where the data comes from." : "Every line above can be checked on a public blockchain, without asking us."}</p>
              </div>
              {proof && <>
                <Ledger d={d} explorer={net.data.explorer} />
                <Sources net={net.data} status={status.data} updatedAt={obj.dataUpdatedAt || undefined} />
              </>}
            </div>
          </div>
          <BookCard d={d} />
        </div>
        <Moments title="How renting works" designLink />
        <StickyAction d={d} />
      </div>
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
    body = (
      <section className="hero bike-top skeleton-hero" aria-busy="true" aria-label="Loading the bike">
        <div className="bike-copy"><i className="sk sk-s" /><i className="sk sk-xl" /><i className="sk sk-xl sk-w60" /><i className="sk sk-m" /><i className="sk sk-btn" /></div>
        <div className="bike-side"><i className="sk sk-photo" /></div>
      </section>
    );
  }

  return (
    <div className="page">
      <SiteHeader />
      <main>{body}</main>
      <SiteFooter />
      <DemoSwitcher />
    </div>
  );
}
