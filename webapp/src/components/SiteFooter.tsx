import { href } from "../ui/router";

/** The close of a page: the name comes back at full width, with the honest note and the two ways on. */
export function SiteFooter() {
  return (
    <footer className="site-end">
      <div className="site-end-inner">
        <p className="site-end-name" aria-hidden="true">Sharify</p>
        <div className="site-end-row">
          <p>Sharify is a course project at Bocconi (30518). It runs on a test network: no real money moves.</p>
          <nav aria-label="More"><a className="link" href={href("add/1")}>Rent out your bike</a><a className="link" href={href("design")}>How Sharify is designed</a></nav>
        </div>
      </div>
    </footer>
  );
}
