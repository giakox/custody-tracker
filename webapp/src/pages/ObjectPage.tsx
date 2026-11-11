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
import { href } from "../ui/router";
import "./object-page.css";
import "./site.css";
import "./listing.css";

/** Failure states: what happened, what still works, and a way on (Stripe's and Linear's error pages). */
function Message({ title, children, tone = "info", actions }: { title: React.ReactNode; children: React.ReactNode; tone?: "info" | "down"; actions?: React.ReactNode }) {
  return (
    <section className={`state-page tone-${tone}`} aria-live="polite">
      <div className="state-card">
        <span className="state-dot" aria-hidden="true" />
        <h1>{title}</h1>
        <p>{children}</p>
        {actions && <div className="actions">{actions}</div>}
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
        <Moments title="How renting works" journey />
        <StickyAction d={d} />
      </div>
    );
  } else if (err?.code === "not-found") {
    body = <Message title={<>There is no bike number <em>{id}</em> here.</>} actions={<><a className="btn btn-primary" href={href("bikes")}>See the bikes on the map</a><a className="btn btn-secondary" href={href("object/1")}>Open the demo bike</a></>}>Check the number on the recorder's label, or open the page from its QR code.</Message>;
  } else if (obj.isError) {
    body = (
      <Message tone="down" title={<>The blockchain is <em>not answering</em>.</>}
        actions={<><button type="button" className="btn btn-primary" onClick={() => obj.refetch()} disabled={obj.isFetching}>{obj.isFetching ? "Asking again…" : "Try again now"}</button><a className="btn btn-secondary" href={href("design")}>Why we don't show a copy</a></>}>
        This page shows only what the chain says, and we won't show a copy from our own server instead. It asks again every few seconds by itself.
      </Message>
    );
  } else {
    body = (
      <div className="listing" aria-busy="true" aria-label="Loading the bike from the blockchain">
        <div className="l-head"><i className="sk sk-s" /><i className="sk sk-title" /><div className="l-gallery"><i className="sk" /><i className="sk" /><i className="sk" /></div></div>
        <div className="l-body"><div className="l-col"><i className="sk sk-s" /><i className="sk sk-title" /><div className="sk-cards"><i className="sk" /><i className="sk" /></div></div><div className="l-book"><i className="sk sk-book" /></div></div>
      </div>
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
