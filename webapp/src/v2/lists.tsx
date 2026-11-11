import type { ReactNode } from "react";
import { SiteFooterV2, SiteHeaderV2 } from "./SiteChromeV2";
import "./tokens.css";
import "./components.css";
import "./pages.css";

/** A plain page: header, one container, footer. For lists and documents. */
export function PageV2({ children, narrow, className = "" }: { children: ReactNode; narrow?: 640 | 720; className?: string }) {
  return (
    <div className={`v2 ${className}`.trim()}>
      <SiteHeaderV2 variant="solid" />
      <main className={`v2-page${narrow ? ` v2-page-${narrow}` : ""}`}>{children}</main>
      <SiteFooterV2 />
    </div>
  );
}

/** One row of a list: photo 96×96, name, a status pill, a line under; dates and amounts on the right. */
export function ListRow({ img, title, pill, meta, right, href }: {
  img?: string; title: ReactNode; pill?: ReactNode; meta?: ReactNode; right?: ReactNode; href?: string;
}) {
  const inner = (
    <>
      {img ? <img className="v2-row-photo" src={img} alt="" width="96" height="96" /> : <span className="v2-row-photo" aria-hidden="true" />}
      <span className="v2-row-main">
        <span className="v2-row-title">{title}{pill}</span>
        {meta && <span className="v2-row-meta">{meta}</span>}
      </span>
      {right && <span className="v2-row-right">{right}</span>}
    </>
  );
  return <li className="v2-row">{href ? <a className="v2-row-hit" href={href}>{inner}</a> : <div className="v2-row-hit">{inner}</div>}</li>;
}

export const RowList = ({ children, label }: { children: ReactNode; label?: string }) => <ol className="v2-rows" aria-label={label}>{children}</ol>;
