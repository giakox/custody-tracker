import { useEffect, useState } from "react";

/** Minimal hash router: #/object/1, #/dev. Hash routes work on any static host. */
export function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [parts, setParts] = useState(read);
  useEffect(() => {
    const on = () => setParts(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return parts;
}

/** Links keep the query string (?scenario=…) and change only the hash. */
export const href = (path: string) => `${window.location.search}#/${path}`;
