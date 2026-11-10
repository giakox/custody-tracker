import { useEffect, useRef } from "react";
import L from "leaflet";
import { tileLayers } from "../ui/theme";
import "leaflet/dist/leaflet.css";
import type { Reading } from "../data/types";

/** The renter's own ride (their readings, shown only to them), with shocks above the light level in orange. */
export function RideMap({ readings, lightCg }: { readings: Reading[]; lightCg: number }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, maxZoom: 16, zoomSnap: 0.25, scrollWheelZoom: false });
    for (const t of tileLayers()) L.tileLayer(t.url, { maxZoom: 16, attribution: t.attribution }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.setView([45.4504, 9.1897], 15);
    map.current = m;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => { ro.disconnect(); m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const pts = readings.filter((r) => r.flags.gpsFix).map((r) => [r.lat, r.lon] as [number, number]);
    if (!pts.length) return;
    L.polyline(pts, { color: "#0297de", weight: 3, opacity: .85 }).addTo(g);
    for (const r of readings) {
      if (r.peakCg < lightCg || !r.flags.gpsFix) continue;
      L.circleMarker([r.lat, r.lon], { radius: 8, color: "#02070a", weight: 2, fillColor: "#fc734d", fillOpacity: 1 })
        .bindTooltip(`${(r.peakCg / 100).toFixed(1)} g`, { direction: "top" }).addTo(g);
    }
    const last = pts.at(-1)!;
    L.circleMarker(last, { radius: 6, color: "#02070a", weight: 2, fillColor: "#e6edf1", fillOpacity: 1 }).addTo(g);
    m.fitBounds(L.latLngBounds(pts), { padding: [28, 28], maxZoom: 16, animate: false });
  }, [readings, lightCg]);

  return <div ref={el} className="ride-map" role="img" aria-label="Map of your ride so far, shocks marked in orange" />;
}
