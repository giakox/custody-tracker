import { href } from "../ui/router";
import { useViewer } from "../ui/viewer";

/** The close of every page (Linear's and Stripe's footers): where you can go, grouped by what you came to do,
 *  the honest note, and the name as a sign-off cut by the edge of the page. */
export function SiteFooter() {
  const { account } = useViewer();
  const groups = [
    { title: "Ride", links: [["Find a bike", "bikes"], ...(account ? [["Your rentals", "my-rentals"]] : [])] },
    { title: "Lend", links: [["Rent out your bike", "add/1"], ...(account ? [["Your bikes", "my-objects"]] : [])] },
    { title: "Check", links: [["The demo bike", "object/1"], ["Verify a reading", "verify/1"], ["How Sharify is designed", "design"]] },
  ];
  return (
    <footer className="site-end">
      <div className="site-end-inner">
        <div className="site-end-top">
          <p className="site-end-note">Sharify is a course project at Bocconi (30518). It runs on a test network: no real money moves, and only the demo bike is real.</p>
          <nav className="site-end-nav" aria-label="Site">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="site-end-h">{g.title}</p>
                <ul>{g.links.map(([label, to]) => <li key={to}><a href={href(to)}>{label}</a></li>)}</ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="site-end-name" aria-hidden="true">Sharify</p>
      </div>
    </footer>
  );
}
