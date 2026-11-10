/** Distance in metres between two points (haversine). */
export function metres(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371e3, r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const distanceText = (m: number) =>
  m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
/** About 80 m per minute on foot. */
export const walkText = (m: number) => `${Math.max(1, Math.round(m / 80))} min walk`;
