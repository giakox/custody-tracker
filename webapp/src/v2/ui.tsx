import { useEffect, type ReactNode, type RefObject } from "react";
import "./tokens.css";
import "./components.css";
import "./map.css";

/** v2 building blocks. Every v2 page composes these instead of styling its own copies. */

type ButtonProps = {
  /** primary: blue fill. secondary: outline. link: text only. */
  variant?: "primary" | "secondary" | "link";
  /** Outline and link turn white on a photo or on the dark band. */
  onDark?: boolean;
  size?: "md" | "sm";
  full?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  target?: string;
  rel?: string;
};

export function Button({ variant = "primary", onDark = false, size = "md", full = false, href, onClick, type = "button", disabled, className = "", children, ...rest }: ButtonProps) {
  const cls = `v2-btn v2-btn-${variant} v2-btn-${size}${onDark ? " is-on-dark" : ""}${full ? " is-full" : ""} ${className}`.trim();
  if (href && !disabled) return <a className={cls} href={href} onClick={onClick} {...rest}>{children}</a>;
  return <button className={cls} type={type} onClick={onClick} disabled={disabled} {...rest}>{children}</button>;
}

/** Small label in the accent colour over a heading. */
export function SectionHead({ eyebrow, title, id, as = "h2", lead, children }: {
  eyebrow?: string; title: ReactNode; id?: string; as?: "h1" | "h2"; lead?: ReactNode; children?: ReactNode;
}) {
  const H = as;
  return (
    <div className="v2-section-head">
      <div className="v2-section-head-text">
        {eyebrow && <p className="v2-eyebrow">{eyebrow}</p>}
        <H className="v2-h2" id={id}>{title}</H>
        {lead && <p className="v2-lead v2-muted v2-gap-16">{lead}</p>}
      </div>
      {children && <div className="v2-section-head-side">{children}</div>}
    </div>
  );
}

/** Photo (4:3, radius 16) with an optional pill on it, and the text underneath. */
export function PhotoCard({ img, alt = "", badge, href, onClick, children, className = "", selected = false }: {
  img: string; alt?: string; badge?: ReactNode; href?: string; onClick?: () => void; children: ReactNode; className?: string; selected?: boolean;
}) {
  const inner = (
    <>
      <span className="v2-card-photo">
        <img src={img} alt={alt} loading="lazy" width="1216" height="832" />
        {badge && <span className="v2-card-badge">{badge}</span>}
      </span>
      {onClick && !href ? <span className="v2-card-body">{children}</span> : <div className="v2-card-body">{children}</div>}
    </>
  );
  const cls = `v2-card${selected ? " is-selected" : ""} ${className}`.trim();
  if (href) return <a className={cls} href={href}>{inner}</a>;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

/** Pill for a state: "live" is the one blue thing (with its dot), the others are quiet. */
export function StatusPill({ tone = "neutral", children }: { tone?: "live" | "neutral" | "onPhoto" | "quiet"; children: ReactNode }) {
  return <span className={`v2-pill v2-pill-${tone}`}>{tone === "live" && <i className="v2-pill-dot" aria-hidden="true" />}{children}</span>;
}

/** A toggle pill for filters (aria-pressed carries the state). */
export function FilterPill({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="v2-filter" aria-pressed={pressed} onClick={onClick}>{children}</button>;
}

export function TextField({ label, hint, id, value, onChange, placeholder, type = "text", inputMode, autoComplete }: {
  label: string; hint?: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoComplete?: string;
}) {
  return (
    <div className="v2-field">
      <label className="v2-field-label" htmlFor={id}>{label}</label>
      <input className="v2-field-input" id={id} type={type} value={value} placeholder={placeholder} inputMode={inputMode} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} />
      {hint && <p className="v2-field-hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

/** Sections fade and slide 16 px in, once. Off with reduced motion or without IntersectionObserver. */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("v2-motion");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    el.querySelectorAll(".v2-reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
}

/** A bar fixed to the bottom of the screen (phones): the page keeps room for it, its real height + 24 px,
 *  measured, so a bar that wraps to more lines never covers the last line of the page. */
export function useBarSpace(bar: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = bar.current;
    const root = el?.closest<HTMLElement>(".v2");
    if (!el || !root || typeof ResizeObserver === "undefined") return;
    const set = () => {
      const fixed = getComputedStyle(el).position === "fixed";
      root.style.setProperty("--v2-bar-space", fixed ? `${Math.ceil(el.getBoundingClientRect().height) + 24}px` : "0px");
    };
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener("resize", set);
    set();
    return () => { ro.disconnect(); window.removeEventListener("resize", set); root.style.removeProperty("--v2-bar-space"); };
  });
}

/** Smooth unless the reader asked for less motion. */
export const scrollBehavior = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
