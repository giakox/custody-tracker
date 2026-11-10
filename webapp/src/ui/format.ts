import type { Party } from "../data/types";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const shortHex = (h: string, head = 4, tail = 4) => `${h.slice(0, head + 2)}…${h.slice(-tail)}`;

/** "Alice", "Owner", or a short address for parties the relayer does not know. */
export const nameOf = (p: Party) => (p.label ? cap(p.label) : shortHex(p.address));
/** Inside a sentence: "the owner", "Alice". */
export const inSentence = (p: Party) => (p.role === "owner" ? "the owner" : nameOf(p));
export const possessive = (p: Party) => (p.role === "owner" ? "the owner's" : `${nameOf(p)}'s`);

/** "The demo bike" at the start of a sentence, "the demo bike" inside one, "Object 3" when unnamed. */
export const objectName = (o: { id: number; label: string | null }, start = true) => {
  const n = o.label ?? `Object ${o.id}`;
  return start ? n : n.replace(/^The /, "the ");
};

export const g = (cg: number) => `${(cg / 100).toFixed(1)}\u00a0g`; // never split "41.2" from "g"
export const usd = (s: string) => `${s} dUSD`;

const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const secFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
export const hm = (ms: number) => timeFmt.format(ms);
export const hms = (ms: number) => secFmt.format(ms);
export const day = (ms: number) => dayFmt.format(ms);

export function ago(ms: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
}

export function span(fromMs: number, toMs: number | null) {
  const mins = Math.round(((toMs ?? Date.now()) - fromMs) / 60_000);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export const TIER_NAMES = ["none", "light", "medium", "strong"] as const;
export const txUrl = (explorer: string | null, tx: string) => (explorer ? `${explorer}/tx/${tx}` : null);
export const addressUrl = (explorer: string | null, a: string) => (explorer ? `${explorer}/address/${a}` : null);
