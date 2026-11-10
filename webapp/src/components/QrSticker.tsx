// Illustration: the Sharify QR sticker on a bike's down tube. The pattern is decorative,
// not a scannable code (a real one is generated at the end of "Add an object").
const N = 21;
function modules(): boolean[][] {
  let r = 0x5a17;
  const rnd = () => { r ^= r << 7; r ^= r >>> 9; r ^= r << 8; return (r >>> 0) % 100 < 46; };
  const g = Array.from({ length: N }, () => Array.from({ length: N }, rnd));
  const finder = (x: number, y: number) => {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const X = x + i, Y = y + j;
      if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      const ring = Math.max(Math.abs(i - 3), Math.abs(j - 3));
      g[Y][X] = ring !== 2 && ring !== 4;
    }
  };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  return g;
}
const GRID = modules();

export function QrSticker() {
  const m = 100 / N; // module size: the code is 100 units wide
  return (
    <svg className="qr-sticker" viewBox="0 0 360 230" role="img" aria-label="The Sharify QR sticker on the bike's frame">
      <defs>
        <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2f3b" /><stop offset=".5" stopColor="#0d1820" /><stop offset="1" stopColor="#06101a" />
        </linearGradient>
      </defs>
      <g transform="rotate(-14 180 115)">
        <rect x="-40" y="62" width="440" height="108" rx="54" fill="url(#tube)" stroke="var(--line-strong)" />
        <g transform="translate(98 54)">
          <rect width="172" height="124" rx="6" fill="var(--ink)" />
          <g transform="translate(12 12)" fill="var(--midnight)">
            {GRID.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x * m} y={y * m} width={m} height={m} /> : null))}
          </g>
          <circle cx="132" cy="30" r="7" fill="var(--blue)" />
          <text x="118" y="64" className="qr-label">Scan</text>
          <text x="118" y="78" className="qr-label">to rent</text>
          <text x="118" y="106" className="qr-label dim">No. 1</text>
        </g>
      </g>
    </svg>
  );
}
