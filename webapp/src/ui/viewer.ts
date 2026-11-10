import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connectWallet, getAccount } from "../data/api";
import type { ObjectDetail, Party } from "../data/types";

/** The connected account (null = visitor) and a connect action that refreshes everything. */
export function useViewer() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["account"], queryFn: getAccount, staleTime: Infinity });
  const connect = async () => { await connectWallet(); await qc.invalidateQueries(); };
  return { account: q.data ?? null, ready: !q.isPending, connect };
}

const same = (a: Party | null | undefined, b: Party | null | undefined) =>
  !!a && !!b && a.address.toLowerCase() === b.address.toLowerCase();

/** How the viewer relates to this object: drives the action at the top of the bike page. */
export function relation(d: ObjectDetail, me: Party | null) {
  return {
    isOwner: same(me, d.owner),
    isCustodian: same(me, d.custodian),
    isOfferedToMe: !!d.pendingHandoff && same(me, d.pendingHandoff.to) && d.pendingHandoff.to.role !== "owner",
    isReturning: !!d.pendingHandoff && d.pendingHandoff.to.role === "owner" && same(me, d.pendingHandoff.from),
  };
}
