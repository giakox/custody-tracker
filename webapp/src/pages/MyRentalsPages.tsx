import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, listObjects } from "../data/api";
import type { ObjectDetail, Rental } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { TierMeter } from "../components/TierMeter";
import { CASE_IMAGE } from "../components/ObjectImage";
import { day, g, hm, objectName, shortHex, span, TEST_MONEY, TIER_NAMES, txUrl, usd, when } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import "./object-page.css";
import "./site.css";
import "./rent.css";

const PRICE_PER_HOUR = 2; // test dollars, paid outside today's contract

/** Price of a rental, billed per started quarter hour (a sample pricing rule, not in today's contract). */
export function priceOf(r: Rental, d: ObjectDetail) {
  const end = d.periods[r.period]?.end?.at ?? Date.now();
  const mins = Math.max(1, Math.round((end - r.started.at) / 60_000));
  const quarters = Math.ceil(mins / 15);
  return { mins, quarters, amount: String((PRICE_PER_HOUR / 4) * quarters) };
}

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

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <SiteHeader />
      <main className="rent">{children}</main>
      <DemoSwitcher />
    </div>
  );
}

export function MyRentalsPage() {
  const { account, ready, rows, loading } = useMine();
  const { connect } = useViewer();
  if (ready && !account) {
    return (
      <Page>
        <h1>Your <em>rentals</em>.</h1>
        <p className="lead">Connect the wallet you rent with to see your rentals and receipts.</p>
        <div className="actions"><button type="button" className="btn btn-primary" onClick={connect}>Connect wallet</button></div>
      </Page>
    );
  }
  const active = rows?.filter((x) => x.r.status === "active") ?? [];
  const past = [...(rows?.filter((x) => x.r.settlement) ?? [])].reverse();
  return (
    <Page>
      <h1>Your <em>rentals</em>.</h1>
      {loading && <p className="lead">Loading your rentals…</p>}
      {active.map(({ d, r }) => {
        const waiting = d.pendingHandoff?.to.role === "owner";
        return (
          <section key={`${d.id}-${r.period}`} className={`now-card tier-glow-${r.current?.tier ?? 0}`}>
            {CASE_IMAGE && <img className="now-photo" src={CASE_IMAGE.src} alt="" />}
            <div className="now-body">
              <p className="live-kicker"><i className="pulse" aria-hidden="true" />In progress · {span(r.started.at, null)} so far</p>
              <h2>{objectName(d)}</h2>
              <p className="now-line">{r.current && r.current.tier > 0
                ? <><TierMeter tier={r.current.tier} /><span>a <span className="shock">{TIER_NAMES[r.current.tier]}</span> knock so far</span></>
                : <><TierMeter tier={0} showNone /><span>no knocks so far</span></>}
                <span className="now-dep">{usd(r.collateral)} deposit{waiting ? ", waiting for the owner to confirm" : ""}</span></p>
              <div className="actions"><a className="btn btn-primary" href={href(`rent/${d.id}/${waiting ? "waiting" : "active"}`)}>Open the rental</a></div>
            </div>
          </section>
        );
      })}
      {rows && (
        <section className="history-list" aria-labelledby="past-title">
          <h2 id="past-title">Past rentals</h2>
          {past.length === 0 && <p className="empty-line">No finished rentals yet. <a className="link" href={href("bikes")}>Find a bike near you</a></p>}
          <ol className="trips">
            {past.map(({ d, r }) => {
              const s = r.settlement!;
              return (
                <li key={`${d.id}-${r.period}`}>
                  <a className="trip-tile" href={href(`receipt/${d.id}/${r.period}`)}>
                    {CASE_IMAGE && <img className="trip-tile-photo" src={CASE_IMAGE.src} alt="" />}
                    <span className="trip-tile-body">
                      <span className="trip-tile-name">{objectName(d)}</span>
                      <span className="trip-tile-when">{when(r.started.at)}, for {span(r.started.at, s.anchor.at)}</span>
                      <span className="trip-tile-back">{usd(s.refund)} back</span>
                      <span className="trip-tile-knock"><TierMeter tier={s.tier} showNone /><span className={s.tier ? "shock" : ""}>{s.tier ? `${TIER_NAMES[s.tier]} knock` : "no knocks"}</span></span>
                    </span>
                    <span className="trip-tile-go">Receipt</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </Page>
  );
}

export function ReceiptPage({ id, period }: { id: number; period: number }) {
  const q = useQuery({ queryKey: ["object", id], queryFn: () => getObject(id) });
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const d = q.data;
  const r = d?.rentals.find((x) => x.period === period);
  if (!d || !r) return <Page><p className="lead">{q.isPending ? "Loading the receipt…" : "There is no such rental."}</p></Page>;
  const s = r.settlement;
  const price = priceOf(r, d);
  const cause = s?.causeSeq != null ? d.batches.find((b) => b.seq === s.causeSeq) : null;
  const returned = d.periods[r.period]?.end;
  const tx = (label: string, h: string | undefined) => {
    if (!h) return null;
    const url = txUrl(net.data?.explorer ?? null, h);
    return <li key={label}><span>{label}</span>{url ? <a className="mono" href={url} target="_blank" rel="noreferrer">{shortHex(h)}</a> : <span className="mono">{shortHex(h)}</span>}</li>;
  };
  return (
    <Page>
      <p><a className="link back" href={href("my-rentals")}>My rentals</a></p>
      <article className={`receipt slip tier-${s?.tier ?? 0}`}>
        <header className="slip-head">
          <p className="slip-kicker">Receipt · {objectName(d)}, lent by {d.ownerName ?? shortHex(d.owner.address)}</p>
          <p className="slip-sub">{day(r.started.at)}, {hm(r.started.at)}–{returned ? hm(returned.at) : "now"}</p>
          <h1 className="slip-amount"><span>Deposit back to you</span>{s ? usd(s.refund) : "Not settled yet"}</h1>
          {s && <div className="split" role="img" aria-label={`${usd(s.refund)} back, ${usd(s.fee)} kept, of a ${usd(r.collateral)} deposit`}>
            <i className="split-back" style={{ flexGrow: Number(s.refund) }} />
            {Number(s.fee) > 0 && <i className="split-kept" style={{ flexGrow: Number(s.fee) }} />}
          </div>}
          {s && <p className="split-legend"><span><i className="split-back" />{usd(s.refund)} back</span>{Number(s.fee) > 0 && <span><i className="split-kept" /><span>{usd(s.fee)} kept for the <span className="shock">{TIER_NAMES[s.tier]}</span> knock</span></span>}</p>}
        </header>
        <dl className="receipt-lines">
          <div><dt>Deposit</dt><dd className="mono">{usd(r.collateral)}</dd></div>
          <div><dt>Hardest knock</dt><dd className={s && s.tier ? "shock" : ""}>{s ? (s.tier ? TIER_NAMES[s.tier] : "none") : "rental in progress"}</dd></div>
          <div><dt>Kept for the knock</dt><dd className="mono">{s ? (s.tier ? `${usd(s.fee)}, ${(Number(s.fee) / Number(r.collateral)) * 100}%` : "nothing") : "—"}</dd></div>
          <div><dt>Rental price</dt><dd className="mono">{usd(price.amount)}</dd><dd className="sub">{price.mins} min, per started quarter hour at 2 dollars an hour, paid to the owner separately</dd></div>
        </dl>
        <p className="fine-print">Nobody decided this by hand: the rule did. {TEST_MONEY}</p>
        <details className="proof-details">
          <summary>See the proof</summary>
          <p className="fine-print">Each step below is a public transaction on Base Sepolia, a test blockchain. Amounts there are in dUSD, a test token where 1 dUSD stands for 1 dollar.{cause && <> The knock is in batch {cause.seq}, recorded at {hm(cause.anchor.at)} ({g(s?.peakCg ?? 0)}).</>}</p>
          <ul className="tx-list">
            {tx("Deposit", r.started.tx)}
            {cause && tx("Knock recorded", cause.anchor.tx)}
            {returned && tx("Return", returned.tx)}
            {s && tx("Deposit settled", s.anchor.tx)}
          </ul>
        </details>
        <div className="actions">
          {cause && <a className="btn btn-secondary" href={href(`verify/${id}/${cause.seq}`)}>Check that knock yourself</a>}
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button>
        </div>
      </article>
    </Page>
  );
}
