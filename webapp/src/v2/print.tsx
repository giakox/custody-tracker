// Printed documents: they never show on screen, only on paper (or in "Save as PDF").
// The QR poster replaces the whole page when printed; the receipt keeps its page and gains a header band.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import "./print.css";

const LOGO = "./brand/sharify-logo-light-header.png";

/* The QR poster is drawn, not laid out: one A4 image at 300 dpi (1 mm = 300 / 25.4 px), wrapped in a one-page
   A4 PDF (595.28 x 841.89 pt). Browsers print a PDF as it is: no page margins, no scaling, no second page. */
const DPI = 300;
const MM = DPI / 25.4;
const W = Math.round(210 * MM);   // 2480
const H = Math.round(297 * MM);   // 3508
const BLUE = "#0297de";
const pt = (v: number) => (v * DPI) / 72; // type sizes in points

const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });

function pill(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2;
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function wrap(c: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" "); const lines: string[] = []; let line = "";
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}

async function drawPoster({ url, name, spot, price, deposit }: { url: string; name: string; spot: string; price: string; deposit: string }) {
  await Promise.all([document.fonts.load(`500 ${pt(34)}px Poppins`), document.fonts.load(`400 ${pt(13)}px Poppins`)]).catch(() => {});
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  const F = (w: 400 | 500, size: number) => `${w} ${pt(size)}px Poppins, system-ui, sans-serif`;
  c.fillStyle = BLUE; c.fillRect(0, 0, W, H);
  c.fillStyle = "#fff"; c.strokeStyle = "#fff"; c.textBaseline = "alphabetic";
  const side = 18 * MM;

  // Top: logo (white) on the left, "Rent this bike" pill on the right, both centred on y = 26 mm.
  const logo = await loadImg(LOGO).catch(() => null);
  if (logo) {
    const lh = 10 * MM, lw = (logo.width / logo.height) * lh;
    const off = document.createElement("canvas"); off.width = Math.ceil(lw); off.height = Math.ceil(lh);
    const o = off.getContext("2d")!; o.drawImage(logo, 0, 0, lw, lh); o.globalCompositeOperation = "source-in"; o.fillStyle = "#fff"; o.fillRect(0, 0, lw, lh);
    c.drawImage(off, side, 26 * MM - lh / 2);
  }
  c.font = F(500, 14); const tag = "Rent this bike"; const tw = c.measureText(tag).width;
  const ph = 13 * MM, pw = tw + 14 * MM; const px = W - side - pw, py = 26 * MM - ph / 2;
  pill(c, px, py, pw, ph); c.lineWidth = 0.6 * MM; c.stroke();
  c.textAlign = "center"; c.fillText(tag, px + pw / 2, py + ph / 2 + pt(14) * 0.35);

  // Middle: a white 120 mm square with the QR (100 mm), top at 52 mm; the line under it.
  const box = 120 * MM, bx = (W - box) / 2, by = 52 * MM;
  c.fillStyle = "#fff"; rounded(c, bx, by, box, box, 9 * MM); c.fill();
  const qrCv = document.createElement("canvas");
  await QRCode.toCanvas(qrCv, url, { margin: 0, width: Math.round(100 * MM), color: { dark: "#0a0a0a", light: "#ffffff" } });
  c.drawImage(qrCv, bx + 10 * MM, by + 10 * MM, 100 * MM, 100 * MM);
  c.fillStyle = "#fff"; c.font = F(400, 14); c.globalAlpha = 0.9;
  c.fillText("Scan with your phone camera", W / 2, by + box + 13 * MM); c.globalAlpha = 1;

  // The bike: name, where it is, price pill. Name baseline at 222 mm.
  c.font = F(500, 40); c.fillText(name, W / 2, 222 * MM, W - 2 * side);
  let y = 222 * MM;
  if (spot) { c.font = F(400, 17); c.globalAlpha = 0.9; c.fillText(spot, W / 2, y + 12 * MM, W - 2 * side); c.globalAlpha = 1; y += 12 * MM; }
  c.font = F(500, 14); const priceText = `${price} dollars an hour · ${deposit} dollars deposit`;
  const prw = c.measureText(priceText).width + 16 * MM, prh = 13 * MM, prx = (W - prw) / 2, pry = y + 8 * MM;
  c.fillStyle = "rgba(255,255,255,0.18)"; pill(c, prx, pry, prw, prh); c.fill();
  c.fillStyle = "#fff"; c.fillText(priceText, W / 2, pry + prh / 2 + pt(14) * 0.35);

  // Foot, 18 mm from the bottom: how it works on the left, the brand on the right.
  c.font = F(400, 10.5); c.textAlign = "left"; c.globalAlpha = 0.9;
  const footY = H - 18 * MM; const lines = wrap(c, "A small box under the frame records every knock. The deposit comes back by the rule, not by anyone's word.", 95 * MM);
  lines.forEach((l, i) => c.fillText(l, side, footY - (lines.length - 1 - i) * pt(10.5) * 1.45));
  c.textAlign = "right"; c.fillText("Sharify · built at Bocconi · demo on Base Sepolia", W - side, footY); c.globalAlpha = 1;
  return cv;
}

/** A one-page A4 PDF holding one full-bleed JPEG. Written by hand: catalog, pages, page, image, content, xref. */
async function a4Pdf(cv: HTMLCanvasElement): Promise<Blob> {
  const jpeg = new Uint8Array(await (await new Promise<Blob>((ok) => cv.toBlob((b) => ok(b!), "image/jpeg", 0.95))).arrayBuffer());
  const enc = new TextEncoder();
  const parts: Uint8Array[] = []; const offsets: number[] = []; let len = 0;
  const push = (x: string | Uint8Array) => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n: number, body: string | (string | Uint8Array)[]) => { offsets[n] = len; push(`${n} 0 obj\n`); (Array.isArray(body) ? body : [body]).forEach(push); push("\nendobj\n"); };
  const PW = 595.28, PH = 841.89;
  const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, [`<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, "\nendstream"]);
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = len;
  push(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offsets[n]).padStart(10, "0")} 00000 n \n`).join("")}`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

/** The poster as a ready A4 PDF (a blob URL), rebuilt when the bike changes; null until it's drawn. */
export function usePosterPdf(props: { url: string | null; name: string; spot: string; price: string; deposit: string }) {
  const [pdf, setPdf] = useState<string | null>(null);
  const { url, name, spot, price, deposit } = props;
  useEffect(() => {
    let made: string | null = null; let live = true;
    if (url) drawPoster({ url, name, spot, price, deposit }).then(a4Pdf).then((blob) => { made = URL.createObjectURL(blob); if (live) setPdf(made); else URL.revokeObjectURL(made); }).catch(() => setPdf(null));
    return () => { live = false; if (made) URL.revokeObjectURL(made); };
  }, [url, name, spot, price, deposit]);
  return pdf;
}

/** The band at the top of a printed document (receipt): logo and what the paper is. */
export function PrintBand({ title }: { title: string }) {
  return (
    <div className="v2-print-band" aria-hidden="true">
      <img src={LOGO} alt="" />
      <span>{title}</span>
    </div>
  );
}
