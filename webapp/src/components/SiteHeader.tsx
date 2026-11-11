import { useEffect, useState } from "react";
import { shortHex } from "../ui/format";
import { href, useRoute } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { LiveRental } from "./LiveRental";

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
  const find = <a className="btn btn-primary hdr-primary" href={href("bikes")} onClick={toFinder}>Find a bike</a>;
  return (
    <>
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <a className="wordmark" href={href("")} aria-label="Sharify, home">
        {/* 3× of the 28 px display height: the original is 1216 px wide and 157 KB. */}
        <img src="./brand/sharify-logo-light-header.png" alt="Sharify" width="111" height="30" />
      </a>
      <nav className={`site-nav ${open ? "open" : ""}`} aria-label="Main">
        <a className="nav-link nav-phone" href={href("bikes")} onClick={() => { setOpen(false); toFinder(); }} aria-current={at("bikes", "object")}>Find a bike</a>
        <a className="nav-link" href={href("add/1")} aria-current={at("add", "my-objects", "confirm-return")}>Rent out your bike</a>
        {account && <a className="nav-link" href={href("my-rentals")} aria-current={at("my-rentals", "receipt")}>My rentals</a>}
        <a className="nav-link" href={href("design")} aria-current={at("design", "verify")}>How it works</a>
        {ready && !account && <button type="button" className="nav-link nav-phone" onClick={() => { setOpen(false); connect(); }}>Connect wallet</button>}
      </nav>
      <div className="site-actions">
        {ready && (account
          ? <><a className="hdr-secondary" href={href("my-objects")}>My bikes</a><span className="btn btn-primary hdr-primary acct" title={account.address}><i aria-hidden="true" />{shortHex(account.address)}</span></>
          : <><button type="button" className="hdr-secondary" onClick={connect}>Connect wallet</button>{find}</>)}
        <button type="button" className="menu-btn" aria-expanded={open} aria-label={open ? "Close the menu" : "Open the menu"} onClick={() => setOpen(!open)}><i aria-hidden="true" /><i aria-hidden="true" /></button>
      </div>
    </header>
    <LiveRental />
    </>
  );
}
