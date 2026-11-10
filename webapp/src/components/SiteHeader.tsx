import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNetwork } from "../data/api";
import { shortHex } from "../ui/format";
import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { LiveRental } from "./LiveRental";

/** Logo, the main sections, and the wallet. On phones the sections fold into a menu. */
export function SiteHeader() {
  const net = useQuery({ queryKey: ["network"], queryFn: getNetwork, staleTime: Infinity });
  const { account, connect, ready } = useViewer();
  const [open, setOpen] = useState(false);
  return (
    <>
    <header className="site-header">
      <a className="wordmark" href={href("")}>
        {/* 3× of the 28 px display height: the original is 1216 px wide and 157 KB. */}
        <img src="./brand/sharify-logo-dark-header.png" alt="Sharify" width="104" height="28" />
      </a>
      {net.data?.isMock && <span className="sample mono" title="Sample data: not read from the blockchain">Sample<span className="wide-only"> data</span></span>}
      <nav className={`site-nav ${open ? "open" : ""}`} aria-label="Main">
        <a className="nav-link" href={href("add/1")}>Rent out your bike</a>
        {account && <a className="nav-link" href={href("my-rentals")}>My rentals</a>}
        {account && <a className="nav-link" href={href("my-objects")}>My objects</a>}
        <a className="nav-link" href={href("design")}>How it works</a>
      </nav>
      <div className="site-wallet">
        {ready && (account
          ? <span className="acct mono" title={account.address}><i aria-hidden="true" />{shortHex(account.address)}</span>
          : <button type="button" className="btn btn-primary btn-sm" onClick={connect}>Connect<span className="wide-only"> wallet</span></button>)}
        <button type="button" className="menu-btn mono" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </div>
    </header>
    <LiveRental />
    </>
  );
}
