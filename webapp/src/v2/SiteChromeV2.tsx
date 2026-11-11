import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFleet, getNetwork, getObject, listObjects } from "../data/api";
import { describeScenarios } from "../data/mock/scenarios";
import { mockActions, mockScenario } from "../data/mock/source";
import { objectName, shortHex, span, TIER_NAMES } from "../ui/format";
import { href, useRoute } from "../ui/router";
import { useViewer } from "../ui/viewer";

const LOGO = "./brand/sharify-logo-light-header.png";

/* "How it works" opens its own page, #/design ("How Sharify is designed"). */

/** Closes a popover on Escape and on a click outside it (`keep`: a selector that also counts as inside, e.g. its opener). */
function useDismiss(open: boolean, close: () => void, keep?: string) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { const t = e.target as Element; if (!box.current?.contains(t) && !(keep && t.closest?.(keep))) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", off); document.removeEventListener("keydown", esc); };
  }, [open, close, keep]);
  return box;
}

/** What the real bike is doing right now: free on the map, or out (same words and links as the old header). */
function useDemoStatus() {
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const real = fleet.data?.find((b) => b.live);
  return fleet.isSuccess
    ? (real ? { on: true, text: "The demo bike is free", to: real.objectId !== null ? `object/${real.objectId}` : "bikes" } : { on: false, text: "The demo bike is out on a ride", to: "object/1" })
    : null;
}

/** Your wallet as a quiet chip with your own pages behind it. */
function AccountMenu({ address, onDark }: { address: string; onDark: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useDismiss(open, () => setOpen(false));
  return (
    <div className="v2-acct" ref={box}>
      <button type="button" className={`v2-btn v2-btn-secondary v2-btn-sm${onDark ? " is-on-dark" : ""}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)} title={address}>
        {shortHex(address)}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="v2-pop" role="menu">
          <p className="v2-small v2-muted v2-pop-k">Test wallet {shortHex(address)}</p>
          <a role="menuitem" className="v2-pop-item" href={href("my-rentals")}>Your rentals</a>
          <a role="menuitem" className="v2-pop-item" href={href("my-objects")}>Your bikes</a>
          <a role="menuitem" className="v2-pop-item" href={href("add/1")}>Rent out a bike</a>
        </div>
      )}
    </div>
  );
}

/** The renter's rental, visible on every page but the renting path (logic from the old LiveRental). */
function LiveRentalBar() {
  const { account } = useViewer();
  const [page] = useRoute();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
  const q = useQuery({
    queryKey: ["my-live", account?.address],
    enabled: !!account,
    refetchInterval: 4_000,
    queryFn: async () => {
      const me = account!.address.toLowerCase();
      const all = await Promise.all((await listObjects()).filter((o) => o.custodian.address.toLowerCase() === me && o.activeRental).map((o) => getObject(o.id)));
      return all[0] ?? null;
    },
  });
  const d = q.data;
  if (!d || !d.activeRental || page === "rent") return null; // the rent pages already show all of it
  const r = d.activeRental;
  const c = r.current;
  const returning = d.pendingHandoff?.to.role === "owner";
  return (
    <div className="v2-live" role="status">
      <div className="v2-container v2-live-row">
        {/* Each piece stays whole, the "·" travels with the piece after it: a line never starts with a dot. */}
        <p><i className="v2-live-dot" aria-hidden="true" />{returning ? "You're returning" : "You're riding"} {objectName(d, false)}<span className="v2-nowrap"> · {span(r.started.at, null)}</span>{c && <span className="v2-nowrap"> · {c.tier ? `a ${TIER_NAMES[c.tier]} knock` : "no knocks so far"}</span>}</p>
        <a className="v2-live-link" href={href(`rent/${d.id}/${returning ? "waiting" : "active"}`)}>{returning ? "See where it stands" : "Open the ride"}</a>
      </div>
    </div>
  );
}

const VIEWERS = [
  { id: "none", label: "Visitor" },
  { id: "alice", label: "Alice (renter)" },
  { id: "bob", label: "Bob (renter)" },
  { id: "owner", label: "Owner" },
];
const STATES = ["default", "rented", "rented-clean", "handoff", "return-pending", "strong", "late-batch", "relayer-offline"];

/** Demo-only control for the presentation (logic from the old DemoSwitcher): who is looking and what state the
 *  bike is in. It reloads the page with ?scenario= and ?as=. Shown only on sample data. */
function DemoPanel({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const isMock = !!useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity }).data?.isMock;
  const [done, setDone] = useState<string | null>(null);
  const box = useDismiss(open, () => setOpen(false), ".v2-demo-head");
  const qc = useQueryClient();
  if (!isMock) return null;
  const params = new URLSearchParams(window.location.search);
  const as = params.get("as") ?? (mockScenario.account ?? "none");
  const descr = Object.fromEntries(describeScenarios().map((s) => [s.name, s.description]));
  const apply = (key: "scenario" | "as", value: string) => {
    params.set(key, value);
    window.location.search = params.toString();
  };
  return (
    <div className="v2-demo" ref={box}>
      {open && (
        <div className="v2-demo-panel" role="dialog" aria-label="Demo controls">
          {/* Phones: a sheet from the bottom, with a handle and a close button. */}
          <div className="v2-demo-sheet-head">
            <span className="v2-demo-handle" aria-hidden="true" />
            <p className="v2-body v2-strong">Demo</p>
            <button type="button" className="v2-demo-close" aria-label="Close the demo controls" onClick={() => setOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <p className="v2-small v2-muted">View as</p>
          <div className="v2-demo-pills" role="group" aria-label="View as">
            {VIEWERS.map((v) => <button key={v.id} type="button" className="v2-filter" aria-pressed={as === v.id} onClick={() => apply("as", v.id)}>{v.label}</button>)}
          </div>
          <p className="v2-small v2-muted v2-gap-16">Bike</p>
          <div className="v2-demo-pills" role="group" aria-label="Bike state">
            {STATES.map((s) => <button key={s} type="button" className="v2-filter" aria-pressed={mockScenario.name === s} title={descr[s]} onClick={() => apply("scenario", s)}>{s}</button>)}
          </div>
          <p className="v2-body v2-muted v2-gap-8">{descr[mockScenario.name]}</p>
          <div className="v2-demo-acts">
            <button type="button" className="v2-btn v2-btn-secondary v2-btn-sm" onClick={() => { mockActions.drop(1); qc.invalidateQueries(); setDone("Dropped: the next batch carries a 41.2 g knock."); }}>Drop the demo bike (41.2 g)</button>
            <button type="button" className="v2-btn v2-btn-secondary v2-btn-sm" onClick={() => { mockActions.setUpWallet(); setOpen(false); qc.invalidateQueries(); }}>Wallet already set up (2 signatures)</button>
          </div>
          <p className="v2-small v2-muted">{done ?? "Only counts while the bike is rented: the next batch carries the shock."}</p>
        </div>
      )}
      <button type="button" className="v2-demo-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Demo"}</button>
    </div>
  );
}

/** overlay: transparent over the Home photo, white text and logo. solid: white bar, black logo, for every other page.
 *  Account controls on the right; on phones everything sits behind a menu button. The live-rental bar and the
 *  demo panel come with the header, so every page has them. */
export function SiteHeaderV2({ variant = "solid", current }: { variant?: "overlay" | "solid"; current?: "bikes" | "add" }) {
  const { account, connect, ready } = useViewer();
  const status = useDemoStatus();
  const [menu, setMenu] = useState(false);
  const [page] = useRoute();
  useEffect(() => { setMenu(false); }, [page]);
  const menuBox = useDismiss(menu, () => setMenu(false));
  const onDark = variant === "overlay";
  const isMock = !!useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity }).data?.isMock;
  const [demo, setDemo] = useState(false);
  return (
    <>
      <header className={`v2-header v2-header-${variant}`}>
        <div className="v2-container v2-header-row">
          <div className="v2-header-left">
            <a className="v2-logo" href={href("")} aria-label="Sharify, home">
              <img src={LOGO} alt="Sharify" width="111" height="30" />
            </a>
            {status && (
              <a className={`v2-status${status.on ? " is-on" : ""}`} href={href(status.to)} title={status.text}>
                <i aria-hidden="true" />{status.text}
              </a>
            )}
          </div>
          <nav className="v2-nav" aria-label="Main">
            <a className="v2-nav-link v2-nav-secondary" href={href("design")}>How it works</a>
            <a className="v2-nav-link v2-nav-secondary" href={href("add")} aria-current={current === "add" ? "page" : undefined}>Rent out your bike</a>
            <a className="v2-nav-link v2-nav-strong v2-nav-secondary" href={href("bikes")} aria-current={current === "bikes" ? "page" : undefined}>Find a bike</a>
            {ready && (account
              ? <span className="v2-nav-secondary"><AccountMenu address={account.address} onDark={onDark} /></span>
              : <span className="v2-nav-secondary"><button type="button" className={`v2-btn v2-btn-secondary v2-btn-sm${onDark ? " is-on-dark" : ""}`} onClick={() => { void connect(); }}>Connect wallet</button></span>)}
            {/* Phones: the demo controls open from the header, never from a pill over the content. */}
            {isMock && <button type="button" className="v2-demo-head" aria-expanded={demo} onClick={() => { setMenu(false); setDemo(!demo); }}>Demo</button>}
            <div className="v2-menu" ref={menuBox}>
              <button type="button" className="v2-menu-btn" aria-expanded={menu} aria-label={menu ? "Close the menu" : "Open the menu"} onClick={() => setMenu(!menu)}>
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">{menu
                  ? <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}</svg>
              </button>
              {menu && (
                <div className="v2-pop v2-pop-menu" role="menu">
                  <a role="menuitem" className="v2-pop-item" href={href("bikes")}>Find a bike</a>
                  <a role="menuitem" className="v2-pop-item" href={href("add")}>Rent out your bike</a>
                  <a role="menuitem" className="v2-pop-item" href={href("design")} onClick={() => setMenu(false)}>How it works</a>
                  {account && <a role="menuitem" className="v2-pop-item" href={href("my-rentals")}>Your rentals</a>}
                  {account && <a role="menuitem" className="v2-pop-item" href={href("my-objects")}>Your bikes</a>}
                  {status && <a role="menuitem" className="v2-pop-item" href={href(status.to)}><span className={`v2-status v2-status-inline${status.on ? " is-on" : ""}`}><i aria-hidden="true" />{status.text}</span></a>}
                  {ready && !account && <div className="v2-pop-foot"><button type="button" className="v2-btn v2-btn-primary v2-btn-md is-full" onClick={() => { setMenu(false); void connect(); }}>Connect wallet</button></div>}
                  {account && <p className="v2-small v2-muted v2-pop-k">Test wallet {shortHex(account.address)}</p>}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <LiveRentalBar />
      <DemoPanel open={demo} setOpen={setDemo} />
    </>
  );
}

export function SiteFooterV2() {
  return (
    <footer className="v2-footer v2-band v2-band-dark">
      <div className="v2-container">
        <div className="v2-footer-grid">
          <a className="v2-logo" href={href("")} aria-label="Sharify, home">
            <img src={LOGO} alt="Sharify" width="111" height="30" />
          </a>
          <nav className="v2-footer-col" aria-label="Ride">
            <p className="v2-footer-title">Ride</p>
            <a href={href("bikes")}>Find a bike</a>
            <a href={href("design")}>How it works</a>
            <a href={href("my-rentals")}>Your rentals</a>
          </nav>
          <nav className="v2-footer-col" aria-label="Own">
            <p className="v2-footer-title">Own</p>
            <a href={href("add")}>Rent out your bike</a>
            <a href={href("my-objects")}>Your bikes</a>
          </nav>
          <nav className="v2-footer-col" aria-label="Check">
            <p className="v2-footer-title">Check</p>
            <a href={href("object/1")}>The demo bike</a>
            <a href={href("verify/1")}>Verify a reading</a>
            <a href={href("design")}>How Sharify is designed</a>
          </nav>
        </div>
        <p className="v2-small v2-footer-note">
          Built at Bocconi · Demo on Base Sepolia ·{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Knowledge_that_matters.jpg" target="_blank" rel="noopener noreferrer">Photo: Rob Oo, CC BY 4.0</a>
        </p>
      </div>
    </footer>
  );
}
