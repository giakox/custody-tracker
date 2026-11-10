/** The look of the site, chosen in the Demo menu while Edoardo compares the options.
 *  Read from ?theme= first, then from this browser's last choice; paper is the default. */
export const THEMES = [
  { id: "paper", label: "A · Paper" },
  { id: "day", label: "B · Day" },
  { id: "sticker", label: "C · Sticker" },
  { id: "night", label: "Night (old)" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
const KEY = "sharify.theme";
const isTheme = (v: string | null): v is ThemeId => THEMES.some((t) => t.id === v);

export function currentTheme(): ThemeId {
  const q = new URLSearchParams(window.location.search).get("theme");
  if (isTheme(q)) return q;
  try { const s = localStorage.getItem(KEY); if (isTheme(s)) return s; } catch { /* storage blocked */ }
  return "paper";
}

export function applyTheme(t: ThemeId = currentTheme()) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch { /* storage blocked */ }
}

/** Base map tiles that match the theme: dark canvas at night, OpenStreetMap (warmed by CSS) by day. */
export function tileLayers(): { url: string; attribution: string; overlay?: string }[] {
  if (currentTheme() === "night") {
    const esri = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
    return [{ url: `${esri}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, overlay: `${esri}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors" }];
  }
  return [{ url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; OpenStreetMap contributors" }];
}
