import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type VT = { startViewTransition?: (cb: () => void) => unknown };

/** Minimal hash router: #/object/1, #/dev. Hash routes work on any static host.
 *  With `animate`, a change of page cross-fades (View Transitions API, off with reduced motion). */
export function useRoute(animate = false): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [parts, setParts] = useState(read);
  const prev = useRef(parts[0]);
  useEffect(() => {
    const on = () => {
      const next = read();
      const doc = document as unknown as VT;
      const pageChanged = next[0] !== prev.current;
      prev.current = next[0];
      if (animate && pageChanged && doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        doc.startViewTransition(() => flushSync(() => setParts(next)));
      } else setParts(next);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return parts;
}

/** Links keep the query string (?scenario=…) and change only the hash. */
export const href = (path: string) => `${window.location.search}#/${path}`;
