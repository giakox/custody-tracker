import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { networkInterfaces } from "node:os";

/** The Mac's address on the local network, so a printed QR opens on a phone (localhost only works on the Mac). */
const isPrivate = (a: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a);
const lanHost = Object.entries(networkInterfaces())
  .flatMap(([name, list]) => (list ?? []).map((i) => ({ name, ...i })))
  .filter((i) => i.family === "IPv4" && !i.internal && isPrivate(i.address))
  .sort((a, b) => Number(b.name.startsWith("en")) - Number(a.name.startsWith("en")))[0]?.address ?? null;

export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works from any sub-path (GitHub Pages, a local file server).
  base: "./",
  // host: true listens on the local network too, so phones on the same Wi-Fi can open the dev server.
  server: { port: 5173, host: true },
  define: { __LAN_HOST__: JSON.stringify(lanHost) },
});
