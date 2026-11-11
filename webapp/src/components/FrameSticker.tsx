import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** The sticker on the demo bike's frame, as it is printed at the end of "Add your bike": a real QR code that opens
 *  the bike's rule. Point a phone at the screen and it works (round 104). */
export function FrameSticker({ id, label }: { id: number; label: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#/rent/${id}`;
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#17191b", light: "#ffffff" } }).then(setSvg).catch(() => setSvg(""));
  }, [id]);
  return (
    <figure className="frame-sticker">
      <div className="tube" aria-hidden="true" />
      <div className="sticker">
        <div className="sticker-qr" role="img" aria-label={`QR code that opens the rule of ${label}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="sticker-text"><b>{label}</b><span>Scan to rent</span></div>
      </div>
      <figcaption>The sticker on its frame. Point your phone at it: it opens this same rule.</figcaption>
    </figure>
  );
}
