/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCENARIO?: string;
  /** Where the published site lives (e.g. https://…/). Printed QR codes point there when it is set. */
  readonly VITE_PUBLIC_URL?: string;
}

/** The dev machine's address on the local network, set by vite.config.ts; null when there is none. */
declare const __LAN_HOST__: string | null;
