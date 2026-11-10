import { useQuery } from "@tanstack/react-query";
import { getNetwork, getObject, listObjects } from "../data/api";
import type { ObjectDetail, Rental } from "../data/types";
import { SiteHeader } from "../components/SiteHeader";
import { DemoSwitcher } from "../components/DemoSwitcher";
import { TierMeter } from "../components/TierMeter";
import { day, g, hm, objectName, shortHex, span, TIER_NAMES, txUrl, usd } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import "./object-page.css";
import "./site.css";
import "./rent.css";

const PRICE_PER_HOUR = 2; // dUSD, not in today's contract

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
      {loading && <p className="lead">Reading your rentals from the chain…</p>}
      {active.map(({ d, r }) => {
        const waiting = d.pendingHandoff?.to.role === "owner";
        return (
          <section key={`${d.id}-${r.period}`} className="panel live-rental">
            <p className="kicker">In progress</p>
            <h2>{objectName(d)}</h2>
            <p className="mono meta">since {hm(r.started.at)} · {span(r.started.at, null)} · {usd(r.collateral)} locked{waiting ? " · waiting for the owner" : ""}</p>
            {r.current && r.current.tier > 0 && <p className="bb-line"><TierMeter tier={r.current.tier} /><span>worst shock so far <span className="shock">{g(r.current.peakCg ?? 0)}</span></span></p>}
            <div className="actions"><a className="btn btn-primary" href={href(`rent/${d.id}/${waiting ? "waiting" : "active"}`)}>Open</a></div>
          </section>
        );
      })}
      {rows && (
        <section className="history-list">
          <h2>Past</h2>
          {past.length === 0 && <p className="hint-line">No finished rentals yet. <a className="link" href={href("")}>Find a bike on the map</a></p>}
          <ol>
            {past.map(({ d, r }) => {
              const s = r.settlement!;
              return (
                <li key={`${d.id}-${r.period}`}>
                  <a className="past-row" href={href(`receipt/${d.id}/${r.period}`)}>
                    <span className="past-name">{objectName(d)}</span>
                    <span className="mono past-when">{day(r.started.at)}, {hm(r.started.at)}–{hm(s.anchor.at)}</span>
                    <span className="past-shock"><TierMeter tier={s.tier} showNone /><span className={`mono ${s.tier ? "shock" : ""}`}>{g(s.peakCg)}</span></span>
                    <span className="mono past-back">{s.refund} of {usd(r.collateral)} back</span>
                    <span className="mono link">Receipt</span>
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
  if (!d || !r) return <Page><p className="lead">{q.isPending ? "Reading the receipt from the chain…" : "There is no such rental."}</p></Page>;
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
      <p><a className="link mono back" href={href("my-rentals")}>My rentals</a></p>
      <article className="receipt">
        <header>
          <h1>Receipt</h1>
          <p className="mono meta">{objectName(d)} · from {d.ownerName ?? shortHex(d.owner.address)} · {day(r.started.at)}, {hm(r.started.at)}–{returned ? hm(returned.at) : "now"}</p>
        </header>
        <dl className="receipt-lines">
          <div><dt>Rental price</dt><dd className="mono">{usd(price.amount)}</dd><dd className="sub mono">{price.mins} min, billed per started 15 min at 2 dUSD/hour · paid outside the contract today</dd></div>
          <div><dt>Deposit</dt><dd className="mono">{usd(r.collateral)}</dd></div>
          <div><dt>Worst shock</dt><dd className={`mono ${s && s.tier ? "shock" : ""}`}>{s ? `${g(s.peakCg)} · ${TIER_NAMES[s.tier]}` : "rental in progress"}</dd>{cause && <dd className="sub mono">at {hm(cause.anchor.at)}, batch {cause.seq}</dd>}</div>
          <div><dt>Damage fee</dt><dd className="mono">{s ? (s.tier ? `${usd(s.fee)} (${(Number(s.fee) / Number(r.collateral)) * 100}% of the deposit)` : "none") : "—"}</dd></div>
          <div className="total"><dt>Deposit back to you</dt><dd className="mono">{s ? usd(s.refund) : "—"}</dd></div>
        </dl>
        <section>
          <h2>Transactions</h2>
          <ul className="tx-list">
            {tx("Deposit", r.started.tx)}
            {cause && tx("Shock recorded", cause.anchor.tx)}
            {returned && tx("Return", returned.tx)}
            {s && tx("Settlement", s.anchor.tx)}
          </ul>
        </section>
        <div className="actions">
          {cause && <a className="btn btn-secondary" href={href(`verify/${id}/${cause.seq}`)}>Verify the shock reading</a>}
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button>
        </div>
      </article>
    </Page>
  );
}
