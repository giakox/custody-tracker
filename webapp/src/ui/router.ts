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

/** The photo you click on the way to a bike's page becomes that page's main photo (a shared-element view transition).
 *  Only the clicked photo is named, just before the change, so two elements never share the name. */
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="#/object/"]');
    if (!a) return;
    const img = a.querySelector("img") ?? a.closest(".mini")?.querySelector("img");
    if (!(img instanceof HTMLElement)) return;
    img.style.setProperty("view-transition-name", "bike-photo");
    setTimeout(() => img.style.removeProperty("view-transition-name"), 1000);
  }, true);
}

