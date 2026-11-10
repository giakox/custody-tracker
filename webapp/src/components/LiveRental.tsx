import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getObject, listObjects } from "../data/api";
import { g, objectName, span } from "../ui/format";
import { href, useRoute } from "../ui/router";
import { useViewer } from "../ui/viewer";
import { TierMeter } from "./TierMeter";

/** The renter's rental, visible on every page (Uber's Live Activity): glanceable, one action, by phase. */
export function LiveRental() {
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
    <div className={`live-rental-bar ${c && c.tier > 0 ? "has-shock" : ""}`} role="status">
      <div className="lrb-inner">
        <span className="lrb-dot" aria-hidden="true" />
        <span className="lrb-text">
          <b>{returning ? "Returning" : "Your rental"}</b> · {objectName(d)} · {span(r.started.at, null)}
          {c && c.peakCg !== null && <span className="lrb-peak mono"> · worst {c.tier ? <span className="shock">{g(c.peakCg)}</span> : g(c.peakCg)} {c.tier > 0 && <TierMeter tier={c.tier} />}</span>}
        </span>
        <a className="btn btn-primary btn-sm" href={href(`rent/${d.id}/${returning ? "waiting" : "active"}`)}>{returning ? "See where it stands" : "Open"}</a>
      </div>
    </div>
  );
}
