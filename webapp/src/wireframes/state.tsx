// Prototype state for the wireframes: who is looking and what state the bike is in.
// Kept in sessionStorage so a reload keeps your place; everything works without it.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "visitor" | "renter" | "owner";
export type BikeState = "free" | "rented" | "return-requested" | "returned-shock";

type Proto = {
  role: Role; setRole: (r: Role) => void;
  bike: BikeState; setBike: (b: BikeState) => void;
  shock: boolean; setShock: (s: boolean) => void; // a 41.2 g drop during the current rental
};

const Ctx = createContext<Proto | null>(null);
const KEY = "sharify-wireframes";

function load(): Partial<Proto> {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export function ProtoProvider({ children }: { children: ReactNode }) {
  const saved = load();
  const [role, setRole] = useState<Role>(saved.role ?? "visitor");
  const [bike, setBike] = useState<BikeState>(saved.bike ?? "free");
  const [shock, setShock] = useState<boolean>(saved.shock ?? false);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ role, bike, shock })); } catch { /* private mode */ }
  }, [role, bike, shock]);
  return <Ctx.Provider value={{ role, setRole, bike, setBike, shock, setShock }}>{children}</Ctx.Provider>;
}

export function useProto(): Proto {
  const c = useContext(Ctx);
  if (!c) throw new Error("ProtoProvider missing");
  return c;
}

/** Link inside the wireframes; keeps the query string. */
export const wf = (path = "") => `${window.location.search}#/wireframes/${path}`;
export const go = (path: string) => { window.location.hash = `#/wireframes/${path}`; window.scrollTo(0, 0); };

export const ROLE_LABEL: Record<Role, string> = { visitor: "Visitor", renter: "Bob (renter)", owner: "Owner" };
export const BIKE_LABEL: Record<BikeState, string> = {
  free: "Free", rented: "Rented by Bob", "return-requested": "Return requested", "returned-shock": "Returned with a shock",
};
