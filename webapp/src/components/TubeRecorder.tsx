// Illustration: a recorder clamped to a bike's down tube (Home, "Rent out your bike").
export function TubeRecorder() {
  return (
    <svg className="qr-sticker" viewBox="0 0 360 230" role="img" aria-label="A recorder clamped to the bike's frame">
      <defs>
        <linearGradient id="tube2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2f3b" /><stop offset=".5" stopColor="#0d1820" /><stop offset="1" stopColor="#06101a" />
        </linearGradient>
      </defs>
      <g transform="rotate(-14 180 115)">
        <rect x="-40" y="86" width="440" height="84" rx="42" fill="url(#tube2)" stroke="var(--line-strong)" />
        {/* straps around the tube, behind the box */}
        <rect x="112" y="84" width="14" height="88" rx="3" fill="none" stroke="var(--fog)" strokeWidth="1.5" />
        <rect x="236" y="84" width="14" height="88" rx="3" fill="none" stroke="var(--fog)" strokeWidth="1.5" />
        {/* the box, strapped against the tube */}
        <g fill="rgba(2,7,10,.85)" stroke="var(--fog)" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M96,104 L120,84 L284,84 L260,104 Z" />
          <rect x="96" y="104" width="164" height="48" rx="3" />
          <path d="M260,104 L284,84 L284,132 L260,152 Z" />
        </g>
        <rect x="108" y="114" width="70" height="26" rx="2" fill="none" stroke="var(--dim)" />
        <text x="116" y="131" className="tube-label">Sharify</text>
        <circle cx="240" cy="128" r="4" fill="var(--blue)" />
      </g>
    </svg>
  );
}
