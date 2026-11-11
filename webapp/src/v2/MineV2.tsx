// Your rentals and a rental's receipt (v2). Queries, logic and words come unchanged from
// the old MyRentalsPages.tsx (removed in lotto 5, see git history); only the markup is new.
import { PrintBand } from "./print";
import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, getReadings, listObjects } from "../data/api";
import type { ObjectDetail, Rental } from "../data/types";
import { RideMap } from "../components/RideMap";
import { CASE_IMAGE } from "./caseImage";
import { day, g, hm, objectName, shortHex, span, TEST_MONEY, TIER_NAMES, txUrl, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { priceOf } from "./price";
import { Button, StatusPill } from "./ui";
import { Bill } from "./checkout";
import { ListRow, PageV2, RowList } from "./lists";

function useMine() {
  const { account, ready } = useViewer();
  const q = useQuery({
    queryKey: ["my-rentals", account?.address],
    enabled: !!account,
    refetchInterval: 4_000,
    queryFn: async () => {
      const objs = await Promise.all((await listObjects()).map((o) => getObject(o.id)));
      const me = account!.address.toLowerCase();
      return objs.flatMap((d) => d.rentals.filter((r) => r.renter.address.toLowerCase() === me).map((r) => ({ d, r })));
    },
  });
  return { account, ready, rows: q.data, loading: q.isPending };
}

const PHOTO = CASE_IMAGE?.src;

export function MyRentalsV2() {
  const { account, ready, rows, loading } = useMine();
  const { connect } = useViewer();
  if (ready && !account) {
    return (
      <PageV2>
        <p className="v2-eyebrow">Your rentals</p>
        <h1 className="v2-h2">Your rentals.</h1>
        <p className="v2-lead v2-muted v2-gap-16 v2-page-lead">Your rentals and receipts are tied to the wallet you rent with: Sharify keeps no account of its own.</p>
        <div className="v2-page-actions"><Button onClick={connect}>Connect wallet</Button><Button variant="secondary" href={href("bikes")}>Find a bike</Button></div>
      </PageV2>
    );
  }
  const active = rows?.filter((x) => x.r.status === "active") ?? [];
  const past = [...(rows?.filter((x) => x.r.settlement) ?? [])].reverse();
  const n = past.length;
  // As before: with nothing in progress, the most recent ride is the page's picture; the list holds the rest.
  const featured = past.length > 0 && !active.length;
  const earlier = featured ? past.slice(1) : past;
  return (
    <PageV2>
      <p className="v2-eyebrow">Your rentals</p>
      <h1 className="v2-h2">{active.length ? `You're riding ${objectName(active[0].d, false)}.` : n === 0 ? "No rentals yet." : n === 1 ? "One rental, settled." : `${n} rentals, all settled.`}</h1>
      {loading && <p className="v2-lead v2-muted v2-gap-16">Loading your rentals…</p>}

      {active.length > 0 && (
        <section className="v2-page-section" aria-label="In progress">
          <RowList>
            {active.map(({ d, r }) => {
              const waiting = d.pendingHandoff?.to.role === "owner";
              return (
                <ListRow key={`${d.id}-${r.period}`} img={PHOTO} href={href(`rent/${d.id}/${waiting ? "waiting" : "active"}`)}
                  title={objectName(d)} pill={<StatusPill tone="live">In progress</StatusPill>}
                  meta={<>{r.current && r.current.tier > 0 ? `a ${TIER_NAMES[r.current.tier]} knock so far` : "no knocks so far"} · {usd(r.collateral)} deposit{waiting ? ", waiting for the owner to confirm" : ""}</>}
                  right={<><span>{span(r.started.at, null)} so far</span><span className="v2-link-quiet">Open the rental</span></>} />
              );
            })}
          </RowList>
        </section>
      )}

      {rows && (
        <>
        {featured && <LastRide d={past[0].d} r={past[0].r} />}
        {(past.length === 0 || earlier.length > 0) && (
        <section className="v2-page-section" aria-labelledby="past-title">
          <h2 className="v2-h3" id="past-title">{featured ? "Earlier rentals" : "Past rentals"}</h2>
          {past.length === 0 ? (
            <div className="v2-gap-16">
              <p className="v2-body v2-muted">No finished rentals yet.</p>
              <div className="v2-page-actions"><Button href={href("bikes")}>Find a bike near you</Button></div>
            </div>
          ) : (
            <RowList>
              {earlier.map(({ d, r }) => {
                const s = r.settlement!;
                return (
                  <ListRow key={`${d.id}-${r.period}`} img={PHOTO} href={href(`receipt/${d.id}/${r.period}`)}
                    title={objectName(d)} pill={<StatusPill tone="quiet">{s.tier ? `${TIER_NAMES[s.tier]} knock` : "no knocks"}</StatusPill>}
                    meta={<>{when(r.started.at)}, for {span(r.started.at, s.anchor.at)}</>}
                    right={<><span className="v2-strong">{usd(s.refund)} back</span><span className="v2-link-quiet">Receipt</span></>} />
                );
              })}
            </RowList>
          )}
        </section>
        )}
        {featured && past[0].d.status === "available" && !past[0].d.pendingHandoff && (
          <p className="v2-body v2-gap-24"><a className="v2-textlink" href={href(`object/${past[0].d.id}`)}>Ride {objectName(past[0].d, false)} again</a> <span className="v2-muted">· {usd(past[0].d.terms.collateral)} deposit, the rule shown before you rent</span></p>
        )}
        </>
      )}
    </PageV2>
  );
}

/** Your most recent ride (logic from the old LastRide): its route, and where the deposit went. */
function LastRide({ d, r }: { d: ObjectDetail; r: Rental }) {
  const s = r.settlement!;
  const seqs = d.batches.filter((b) => b.period === r.period).map((b) => b.seq);
  const ride = useQuery({ queryKey: ["ride-done", d.id, seqs.join(",")], queryFn: async () => (await Promise.all(seqs.map((q) => getReadings(d.id, q)))).flat(), enabled: seqs.length > 0, retry: false });
  const kept = Number(s.fee);
  return (
    <section className="v2-page-section v2-last" aria-labelledby="last-title">
      <div className="v2-last-map">{ride.data?.length ? <RideMap readings={ride.data} lightCg={d.terms.lightCg} /> : PHOTO && <img src={PHOTO} alt="" />}</div>
      <div className="v2-last-body">
        <p className="v2-small v2-muted">Your last ride · {when(r.started.at)}</p>
        <h2 className="v2-h3 v2-gap-8" id="last-title">{objectName(d)}, {span(r.started.at, s.anchor.at)}</h2>
        <div className="v2-gap-24"><Bill rows={[
          { k: "Back to you", v: usd(s.refund), strong: true },
          ...(kept > 0 ? [{ k: `Kept for a ${TIER_NAMES[s.tier]} knock`, v: usd(s.fee) }] : []),
        ]} /></div>
        <div className="v2-page-actions">
          <Button href={href(`receipt/${d.id}/${r.period}`)}>Receipt</Button>
          {s.causeSeq !== null && <Button variant="secondary" href={href(`verify/${d.id}/${s.causeSeq}`)}>Check the knock</Button>}
        </div>
      </div>
    </section>
  );
}

export function ReceiptV2({ id, period }: { id: number; period: number }) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id) });
  // The proof is always open here, so it prints without a beforeprint hook.
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const d = q.data;
  const r = d?.rentals.find((x) => x.period === period);
  if (!d || !r) return <PageV2 narrow={640}><p className="v2-lead v2-muted">{q.isPending ? "Loading the receipt…" : "There is no such rental."}</p></PageV2>;
  const s = r.settlement;
  const price = priceOf(r, d);
  const cause = s?.causeSeq != null ? d.batches.find((b) => b.seq === s.causeSeq) : null;
  const returned = d.periods[r.period]?.end;
  const tx = (label: string, h: string | undefined) => {
    if (!h) return null;
    const url = txUrl(net.data?.explorer ?? null, h);
    return { k: label, v: url ? <a className="v2-textlink v2-mono" href={url} target="_blank" rel="noreferrer">{shortHex(h)}</a> : <span className="v2-mono">{shortHex(h)}</span> };
  };
  const refs = [tx("Deposit", r.started.tx), cause ? tx("Knock recorded", cause.anchor.tx) : null, returned ? tx("Return", returned.tx) : null, s ? tx("Deposit settled", s.anchor.tx) : null].filter(Boolean) as { k: string; v: React.ReactNode }[];
  return (
    <PageV2 narrow={640} className="v2-receipt-page">
      <p className="v2-print-hide"><a className="v2-link-quiet" href={href("my-rentals")}>← My rentals</a></p>
      <article className="v2-receipt">
        <PrintBand title="Rental receipt" />
        <p className="v2-small v2-muted v2-print-hide">Receipt</p>
        <h1 className="v2-h2">{objectName(d)}</h1>
        <p className="v2-body v2-muted">Lent by {d.ownerName ?? shortHex(d.owner.address)} · {day(r.started.at)}, {hm(r.started.at)}–{returned ? hm(returned.at) : "now"}</p>

        <div className="v2-receipt-block">
          <Bill rows={[
            { k: "Deposit", v: usd(r.collateral) },
            { k: "Hardest knock", v: s ? (s.tier ? TIER_NAMES[s.tier] : "none") : "rental in progress" },
            { k: "Kept for the knock", v: s ? (s.tier ? `${usd(s.fee)}, ${(Number(s.fee) / Number(r.collateral)) * 100}%` : "nothing") : "—" },
            { k: <>Rental price<span className="v2-receipt-sub">{price.mins} min, per started quarter hour at 2 dollars an hour, paid to the owner separately</span></>, v: usd(price.amount) },
          ]} />
          <div className="v2-receipt-total"><span>Deposit back to you</span><span>{s ? usd(s.refund) : "Not settled yet"}</span></div>
        </div>
        <p className="v2-body v2-muted">Nobody decided this by hand: the rule did. {TEST_MONEY}</p>

        <section className="v2-receipt-block" aria-labelledby="proof-title">
          <h2 className="v2-h3" id="proof-title">The proof</h2>
          <p className="v2-body v2-muted v2-gap-8">Each step below is a public transaction on Base Sepolia, a test blockchain. Amounts there are in dUSD, a test token where 1 dUSD stands for 1 dollar.{cause && <> The knock is in batch {cause.seq}, recorded at {hm(cause.anchor.at)} ({g(s?.peakCg ?? 0)}).</>}</p>
          <div className="v2-gap-16"><Bill rows={refs} /></div>
        </section>

        <div className="v2-page-actions v2-print-hide">
          <Button onClick={() => window.print()}>Print</Button>
          {cause && <Button variant="secondary" href={href(`verify/${id}/${cause.seq}`)}>Check that knock yourself</Button>}
        </div>
      </article>
    </PageV2>
  );
}
