// Fig. 1: line drawing of the recorder, standing in for the photo of the printed case.
// The status LED is live: blue at rest, orange while the current rental holds a shock.
export function DeviceFigure({ alert, deviceId }: { alert: boolean; deviceId: string }) {
  // Oblique projection: front face + depth offset.
  const x = 43, y = 96, w = 300, h = 132, dx = 74, dy = -46;
  const P = (a: number, b: number) => `${a},${b}`;
  return (
    <svg className="device" viewBox="0 0 460 280" role="img" aria-label="Drawing of the recorder: a small sealed box with a status light">
      <g fill="none" stroke="var(--fog)" strokeWidth="1.25" strokeLinejoin="round">
        {/* top */}
        <path d={`M${P(x, y)} L${P(x + dx, y + dy)} L${P(x + w + dx, y + dy)} L${P(x + w, y)} Z`} fill="rgba(2,7,10,.42)" />
        {/* front */}
        <rect x={x} y={y} width={w} height={h} rx="3" fill="rgba(2,7,10,.5)" />
        {/* side */}
        <path d={`M${P(x + w, y)} L${P(x + w + dx, y + dy)} L${P(x + w + dx, y + dy + h)} L${P(x + w, y + h)} Z`} fill="rgba(2,7,10,.5)" />
        {/* lid seam */}
        <path d={`M${P(x, y + 22)} L${P(x + w, y + 22)} L${P(x + w + dx, y + dy + 22)}`} stroke="var(--dim)" />
        {/* screws on the top */}
        {[[0.1, 0.18], [0.9, 0.18], [0.1, 0.82], [0.9, 0.82]].map(([u, v], i) => (
          <ellipse key={i} cx={x + u * w + v * dx} cy={y + v * dy} rx="5" ry="3.2" stroke="var(--dim)" />
        ))}
        {/* USB-C port on the side */}
        <path d={`M${P(x + w + 22, y + 74)} l26,-16 a4,4 0 0 1 0,8 l-26,16 a4,4 0 0 1 0,-8 Z`} stroke="var(--dim)" />
        {/* label plate */}
        <rect x={x + 22} y={y + 44} width="132" height="58" rx="2" stroke="var(--dim)" />
      </g>
      <text x={x + 34} y={y + 66} className="device-text">Sharify recorder</text>
      <text x={x + 34} y={y + 86} className="device-text dim">{deviceId.slice(0, 10)}</text>
      <circle cx={x + w - 34} cy={y + 72} r="11" className={`led-halo ${alert ? "alert" : ""}`} />
      <circle cx={x + w - 34} cy={y + 72} r="4.5" className={`led ${alert ? "alert" : ""}`} />
    </svg>
  );
}
