import { useEffect, useRef } from "react";
import L from "leaflet";
import { TILES } from "../ui/tiles";
import "leaflet/dist/leaflet.css";
import type { LatLon } from "./FleetMap";

/** One spot on a small map with a label pin: where the owner wants the bike back (round 111). */
export function SpotMap({ spot, label }: { spot: LatLon; label: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false }).setView([spot.lat, spot.lon], 17);
    L.tileLayer(TILES.url, { maxZoom: 18, attribution: TILES.attribution }).addTo(m);
    L.marker([spot.lat, spot.lon], { icon: L.divIcon({ className: "pin-wrap", html: `<span class="spot-pin"><i></i>${label}</span>`, iconSize: [0, 0] }), keyboard: false, interactive: false }).addTo(m);
    const ro = new ResizeObserver(() => m.invalidateSize()); ro.observe(el.current);
    return () => { ro.disconnect(); m.remove(); };
  }, [spot.lat, spot.lon, label]);
  return <div ref={el} className="spot-map" role="img" aria-label={`Map: ${label}`} />;
}
