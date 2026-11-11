import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { TILES } from "../ui/tiles";
import "leaflet/dist/leaflet.css";
import type { FleetBike } from "../data/types";

export type LatLon = { lat: number; lon: number };

const pinHtml = (b: FleetBike, selected: boolean, hover: boolean) => {
  const drop = b.record.lastDrop && Date.now() - b.record.lastDrop.at < 7 * 24 * 3600_000;
  return `<span class="pin ${b.live ? "pin-live" : ""} ${selected ? "is-selected" : ""} ${hover ? "is-hover" : ""}">
    <span class="pin-price">$${b.pricePerHour}</span>${drop ? '<span class="pin-drop" title="Dropped in the last 7 days"></span>' : ""}
  </span>`;
};

/** Map of free bikes, each pin showing its hourly price (Airbnb's map). Leaflet is driven imperatively; React only passes data in. */
export function FleetMap({ bikes, center, me, selected, highlight = null, onSelect, padding }: {
  bikes: FleetBike[]; center: LatLon; me: (LatLon & { accuracy: number }) | null;
  selected: string | null; highlight?: string | null; onSelect: (key: string | null) => void;
  /** Space taken by controls over the map (top, bottom, left in px): no pin is framed under them. */
  padding: { top: number; bottom: number; left: number; sheet?: number };
}) {
  const fitted = useRef(false);
  const sig = useRef("");
  const userMoved = useRef(false);
  const fit = useRef<() => void>(() => {});
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const meLayer = useRef<L.LayerGroup | null>(null);
  const touchPinch = useRef(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    // On a touch screen one finger scrolls the page, not the map: the map sits in the middle of the Home
    // and would otherwise trap the scroll. Two fingers pinch and move it; one finger shows a hint.
    const touch = matchMedia("(pointer: coarse)").matches;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true, maxZoom: 16, zoomSnap: 0.25, dragging: !touch }).setView([center.lat, center.lon], 15);
    L.control.zoom({ position: "topright" }).addTo(m);
    L.tileLayer(TILES.url, { maxZoom: 16, attribution: TILES.attribution }).addTo(m);
    m.on("click", () => onSelect(null));
    meLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    // Leaflet measures its container once; keep it in sync with layout changes (panel, sheet, rotation).
    // Until the user pans, refit on every size change: the first fit can run before layout settles.
    m.on("dragstart zoomstart", (e) => { if (e.type === "dragstart" || touchPinch.current) userMoved.current = true; });
    let hintTimer = 0;
    const onTouchStart = (e: TouchEvent) => { touchPinch.current = e.touches.length > 1; if (touchPinch.current) setHint(false); };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      setHint(true); clearTimeout(hintTimer); hintTimer = window.setTimeout(() => setHint(false), 1400);
    };
    if (touch) { el.current.addEventListener("touchstart", onTouchStart, { passive: true }); el.current.addEventListener("touchmove", onTouchMove, { passive: true }); }
    const ro = new ResizeObserver(() => { m.invalidateSize(); if (!userMoved.current) fit.current(); });
    ro.observe(el.current);
    // StrictMode and hot reload remove and recreate the map: the new one must be framed again.
    const node = el.current;
    return () => { clearTimeout(hintTimer); node.removeEventListener("touchstart", onTouchStart); node.removeEventListener("touchmove", onTouchMove); ro.disconnect(); m.remove(); map.current = null; markers.current.clear(); fitted.current = false; userMoved.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const seen = new Set<string>();
    for (const b of bikes) {
      seen.add(b.key);
      const icon = L.divIcon({ className: "pin-wrap", html: pinHtml(b, b.key === selected, b.key === highlight), iconSize: [52, 30], iconAnchor: [26, 15] });
      const existing = markers.current.get(b.key);
      if (existing) { existing.setIcon(icon); existing.setZIndexOffset(b.key === selected || b.key === highlight ? 1000 : b.live ? 500 : 0); continue; }
      const mk = L.marker([b.lat, b.lon], { icon, keyboard: true, title: b.label, riseOnHover: true, zIndexOffset: b.live ? 500 : 0 })
        .on("click", (e) => { L.DomEvent.stopPropagation(e); onSelect(b.key); })
        .addTo(m);
      markers.current.set(b.key, mk);
    }
    for (const [k, mk] of markers.current) if (!seen.has(k)) { mk.remove(); markers.current.delete(k); }
    // Frame all bikes once, keeping every pin clear of the header, the buttons and the bottom strip.
    const pts = bikes.map((b) => [b.lat, b.lon] as [number, number]);
    fit.current = () => {
      // A container not laid out yet (0×0) would frame the whole region: wait for the resize refit.
      const size = m.getSize();
      if (size.x < 200 || size.y < 200) return;
      if (pts.length) m.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [padding.left + 28, padding.top + 28], paddingBottomRight: [28, padding.bottom + 28], maxZoom: 15, animate: false });
      if (m.getZoom() < 12) m.setZoom(13, { animate: false }); // never wider than a district // animated fits get cut short by the resize refit
    };
    if (!fitted.current && pts.length) { fitted.current = true; fit.current(); }
    // A filter changed which bikes are shown: frame the new set.
    const now = bikes.map((b) => b.key).join(",");
    if (fitted.current && sig.current && sig.current !== now) fit.current();
    sig.current = now;
  }, [bikes, selected, highlight, onSelect, padding.top, padding.bottom, padding.left]);

  // Recenter only when the user's own position arrives, not on first load (fitBounds frames the fleet).
  useEffect(() => { if (me) map.current?.setView([me.lat, me.lon], 15, { animate: true }); }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const g = meLayer.current;
    if (!g) return;
    g.clearLayers();
    if (!me) return;
    L.circle([me.lat, me.lon], { radius: me.accuracy, color: "#0297de", weight: 1, opacity: .5, fillColor: "#0297de", fillOpacity: .08, interactive: false }).addTo(g);
    L.marker([me.lat, me.lon], { icon: L.divIcon({ className: "pin-wrap", html: '<span class="me-dot" title="You are here"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(g);
  }, [me]);

  // Bring the chosen bike into the part of the map that stays visible: above the sheet on phones.
  useEffect(() => {
    const m = map.current;
    const b = bikes.find((x) => x.key === selected);
    if (!b || !m) return;
    const h = m.getSize().y;
    const visibleBottom = h * (1 - (padding.sheet ?? 0));
    const targetY = (padding.top + visibleBottom) / 2;
    const pt = m.project([b.lat, b.lon]).add([0, h / 2 - targetY]);
    m.panTo(m.unproject(pt), { animate: false });
  }, [selected, bikes, padding.top, padding.sheet]);

  // The selection class goes on a wrapper: React must not rewrite the classes Leaflet puts on its container.
  return (
    <div className={`fleet-map-wrap ${selected ? "has-selection" : ""}`}>
      <div ref={el} className="fleet-map" role="application" aria-label="Map of bikes free to rent" />
      <p className={`map-two-fingers ${hint ? "is-on" : ""}`} aria-hidden="true">Use two fingers to move the map</p>
    </div>
  );
}
