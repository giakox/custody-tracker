// The owner confirms a return (v2). Logic, queries, the source call and words are copied unchanged from
// ConfirmReturnPage in the old OwnerPages.tsx (removed in lotto 5, see git history); only the markup is new.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmReturn, getNetwork, getObject } from "../data/api";
import { DataError, type TxStep } from "../data/types";
import { SpotMap } from "../components/SpotMap";
import { DEMO_SPOT } from "../data/mock/fleet";
import { nameOf, objectName, span, TEST_MONEY, TIER_NAMES, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { priceOf } from "./price";
import { Button } from "./ui";
import { knockRows } from "./rule";
import { BikeLine, Bill, Checkout, ErrorLine, Spinner, StepList } from "./checkout";

export function ConfirmV2({ id }: { id: number }) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id), refetchInterval: 4_000 });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const qc = useQueryClient();
  const [steps, setSteps] = useState<TxStep[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const d = q.data;
  // the rental being returned stays in view after it settles
  const [period, setPeriod] = useState<number | null>(null);
  useEffect(() => { if (d?.activeRental && period === null) setPeriod(d.activeRental.period); }, [d, period]);
  if (!d) return <Checkout title="Loading the bike…"><div className="v2-co-wait"><Spinner size={40} /></div></Checkout>;
  const r = d.rentals.find((x) => x.period === (period ?? d.activeRental?.period));
  if (!r || (!d.pendingHandoff && state === "idle" && !r.settlement)) {
    return <Checkout title="Nothing to confirm." lead={`Nobody is returning ${objectName(d, false)} right now.`} action={<Button full variant="secondary" href={href("my-objects")}>My bikes</Button>} />;
  }
  const run = async () => {
    setState("running"); setError(null);
    try { await confirmReturn(id, setSteps); setState("done"); }
    catch (e) { setState("error"); setError(e instanceof DataError ? e.message : String(e)); }
    await qc.invalidateQueries();
  };
  const s = r.settlement;
  const c = r.current;
  const peak = s ? s.peakCg : c?.peakCg ?? null;
  const tier = s ? s.tier : c?.tier ?? 0;
  const fee = s ? s.fee : c?.wouldWithhold ?? "0";
  const price = priceOf(r, d);
  const deposit = Number(r.collateral);
  const toOwner = tier ? Number(fee) : 0;
  const back = deposit - toOwner;
  const rows = knockRows(d.terms);
  return (
    <Checkout
      title={s ? (s.tier ? `Done: ${usd(s.fee)} to you, ${usd(s.refund)} back to ${nameOf(r.renter)}.` : `Done: all ${usd(s.refund)} back to ${nameOf(r.renter)}.`)
        : `Do you have ${objectName(d, false)} back?`}
      lead={!s ? `${nameOf(r.renter)} says it's back, ${d.pendingHandoff ? when(d.pendingHandoff.anchor.at) : ""}. Go and look, then confirm.` : undefined}
      action={state === "done" || s
        ? <Button full href={href("my-objects")}>Back to My bikes</Button>
        : <Button full onClick={run} disabled={state === "running"}>{state === "running" ? <><Spinner size={18} />Working…</> : state === "error" ? "Try again" : "Confirm it's back"}</Button>}
      note={<><a className="v2-textlink" href={href("my-objects")}>My bikes</a>. The rental price is paid to you separately. {TEST_MONEY}</>}>
      <BikeLine d={d} sub={<>with {nameOf(r.renter)}, {span(r.started.at, d.periods[r.period]?.end?.at ?? d.pendingHandoff?.anchor.at ?? null)}</>} />
      {!s && (
        <figure>
          <div className="v2-co-pair">
            <img src="./img/day/bocconi-park.jpg" alt="The rack outside Bocconi, people walking past" />
            <div className="v2-co-map"><SpotMap spot={DEMO_SPOT} label="Left here" /></div>
          </div>
          <figcaption className="v2-gap-16"><p className="v2-body v2-strong">The rack outside Bocconi</p><p className="v2-body v2-muted">Where you asked for it back. Confirm only when it's really there, with you.</p></figcaption>
        </figure>
      )}
      <section aria-labelledby="split-title">
        <h2 className="v2-co-sub" id="split-title">{s ? "The deposit was settled" : "When you confirm, the deposit splits like this"}</h2>
        <Bill rows={[
          { k: `Back to ${nameOf(r.renter)}`, v: usd(String(back)), strong: true },
          { k: toOwner > 0 ? `To you, for a ${TIER_NAMES[tier]} knock` : "To you", v: usd(String(toOwner)) },
          { k: "Hardest knock", v: peak === null || !tier ? "none" : TIER_NAMES[tier] },
          { k: "Deposit", v: usd(r.collateral) },
          { k: "Rental price", v: usd(price.amount) },
        ]} />
      </section>
      <details className="v2-co-fold v2-co-fold-always">
        <summary>The rule you set</summary>
        <p className="v2-body v2-muted v2-gap-16">You don't decide the fee: the hardest knock of the ride does.</p>
        <ul className="v2-knocks has-current v2-gap-16">
          {rows.map((k, i) => (
            <li className={`v2-knock${i === tier ? " is-current" : ""}`} key={k.name}>
              <p className="v2-knock-num">{k.num}<span className="v2-knock-unit">g</span></p>
              <div><p className="v2-knock-name">{k.name}</p><p className="v2-knock-sum">{k.sum}</p></div>
            </li>
          ))}
        </ul>
      </details>
      {steps.length > 0 && <StepList steps={steps} deposit={usd(d.terms.collateral)} explorer={net.data?.explorer ?? null} viewer="owner" />}
      {error && <ErrorLine>{error}</ErrorLine>}
    </Checkout>
  );
}
