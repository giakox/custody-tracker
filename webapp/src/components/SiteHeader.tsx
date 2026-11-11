import { useEffect, useRef, useState } from "react";
import { shortHex } from "../ui/format";
import { href, useRoute } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { LiveRental } from "./LiveRental";
import { useQuery } from "@tanstack/react-query";
import { getFleet } from "../data/api";

/** A floating bar: the logo, the sections in the middle, one filled action on the right (Find a bike, or your
 *  wallet once it is connected) and one quiet one. On phones: the logo and a round menu button that opens a
 *  page of big words. Structure after Raycast's floating navbar and Linear's two-action header. */
export function SiteHeader() {
  const { account, connect, ready } = useViewer();
  const [open, setOpen] = useState(false);
  const [page] = useRoute();
  const at = (...p: string[]) => (p.includes(page ?? "") ? "page" : undefined);
  useEffect(() => { setOpen(false); }, [page]);
  useEffect(() => { document.documentElement.classList.toggle("menu-open", open); }, [open]);
  const toFinder = () => { if (page === "bikes") document.getElementById("bikes")?.scrollIntoView(); };
  // What the real bike is doing right now (the café's "Closed, opens tomorrow at 6am"): free on the map, or out.
  const fleet = useQuery({ queryKey: ["fleet"], queryFn: getFleet, refetchInterval: 10_000 });
  const real = fleet.data?.find((b) => b.live);
  const status = fleet.isSuccess ? (real ? { on: true, text: "The demo bike is free, outside Bocconi", to: real.objectId !== null ? `object/${real.objectId}` : "bikes" } : { on: false, text: "The demo bike is out on a ride", to: "object/1" }) : null;
  const find = <a className="btn btn-primary hdr-primary" href={href("bikes")} onClick={toFinder}>Find a bike</a>;
  return (
    <>
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <div className="hdr-left">
        <a className="wordmark" href={href("")} aria-label="Sharify, home">
        {/* 3× of the 28 px display height: the original is 1216 px wide and 157 KB. */}
        <img src="./brand/sharify-logo-light-header.png" alt="Sharify" width="111" height="30" />
      </a>
        {status && <a className={`hdr-status ${status.on ? "is-on" : ""}`} href={href(status.to)} title={status.text} aria-label={status.text}><i aria-hidden="true" /><span>{status.text}</span></a>}
      </div>
      <nav className={`site-nav ${open ? "open" : ""}`} aria-label="Main">
        <a className="nav-link nav-phone" href={href("bikes")} onClick={() => { setOpen(false); toFinder(); }} aria-current={at("bikes", "object")}>Find a bike</a>
        <a className="nav-link" href={href("add/1")} aria-current={at("add", "my-objects", "confirm-return")}>Rent out your bike</a>
        {account && <a className="nav-link nav-phone" href={href("my-rentals")} aria-current={at("my-rentals", "receipt")}>Your rentals</a>}
        {account && <a className="nav-link nav-phone" href={href("my-objects")} aria-current={at("my-objects", "confirm-return")}>Your bikes</a>}
        <a className="nav-link" href={href("design")} aria-current={at("design", "verify")}>How it works</a>
        {ready && !account && <button type="button" className="nav-link nav-phone" onClick={() => { setOpen(false); connect(); }}>Connect wallet</button>}
        {open && (
          <div className="menu-foot">
            <a className="menu-card" href={href("bikes")} onClick={() => { setOpen(false); toFinder(); }}>
              <img src="./img/day/friends-ride.jpg" alt="" />
              <span>See the bikes near Bocconi on the map</span>
            </a>
            <p>{account ? <>Test wallet {shortHex(account.address)}. </> : null}A course project on a test network: no real money moves.</p>
          </div>
        )}
      </nav>
      <div className="site-actions">
        {ready && (account
          ? <><AccountMenu address={account.address} at={at} />{find}</>
          : <><button type="button" className="hdr-secondary" onClick={connect}>Connect wallet</button>{find}</>)}
        <button type="button" className="menu-btn" aria-expanded={open} aria-label={open ? "Close the menu" : "Open the menu"} onClick={() => setOpen(!open)}><i aria-hidden="true" /><i aria-hidden="true" /></button>
      </div>
    </header>
    <LiveRental />
    </>
  );
}

/** Your wallet as a quiet chip with your own pages behind it (Airbnb's profile menu): the filled button stays
 *  "Find a bike", because an address is not something you do. */
function AccountMenu({ address, at }: { address: string; at: (...p: string[]) => "page" | undefined }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", off); document.removeEventListener("keydown", esc); };
  }, [open]);
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  return (
    <div className="acct-menu" ref={box}>
      <button type="button" className={`acct-chip ${at("my-rentals", "receipt", "my-objects", "confirm-return") ? "is-here" : ""}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)} title={address}>
        <i className="acct-face" aria-hidden="true" style={{ background: `conic-gradient(from ${hue}deg, hsl(${hue} 70% 55%), hsl(${(hue + 120) % 360} 70% 60%), hsl(${hue} 70% 55%))` }} />
        <span>{shortHex(address)}</span>
      </button>
      {open && (
        <div className="acct-pop" role="menu">
          <p className="acct-pop-k">Test wallet <span>{shortHex(address)}</span></p>
          <a role="menuitem" href={href("my-rentals")} aria-current={at("my-rentals", "receipt")}>Your rentals</a>
          <a role="menuitem" href={href("my-objects")} aria-current={at("my-objects", "confirm-return")}>Your bikes</a>
          <a role="menuitem" href={href("add/1")}>Rent out a bike</a>
        </div>
      )}
    </div>
  );
}
