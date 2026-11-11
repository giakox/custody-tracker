// The sample fleet around Bocconi (Milan). Illustration only: these bikes have no recorder and no
// on-chain history, and the UI labels them "Sample fleet". The one live bike comes from the contracts.
import type { FleetBike, Tier } from "../types";

export const BOCCONI = { lat: 45.4504, lon: 9.1897 };
const H = 3600_000, D = 24 * H;
const drop = (tier: Tier, peakCg: number, ago: number) => ({ tier, peakCg, at: Date.now() - ago });

const S = (key: string, label: string, kind: FleetBike["kind"], ownerName: string, dLat: number, dLon: number,
  price: string, deposit: string, rentals: number, drops: number, lastDrop: FleetBike["record"]["lastDrop"]): FleetBike => ({
  key, objectId: null, live: false, label, kind, ownerName, lat: BOCCONI.lat + dLat, lon: BOCCONI.lon + dLon,
  pricePerHour: price, deposit, record: { rentals, drops, lastDrop },
});

export const SAMPLE_FLEET: FleetBike[] = [
  S("s1", "Blue Graziella", "City bike", "Navigli Rentals", 0.0062, -0.0071, "1.5", "40", 41, 0, null),
  S("s2", "Porta Romana e-bike", "E-bike", "Porta Romana Bike Co.", 0.0081, 0.0094, "3", "80", 18, 1, drop(2, 3640, 2 * D)),
  S("s3", "Campus fixie", "City bike", "Student Bikes Bocconi", -0.0019, 0.0022, "1.5", "40", 63, 2, drop(1, 1180, 9 * D)),
  S("s10", "Sarfatti e-bike", "E-bike", "Student Bikes Bocconi", 0.0021, -0.0024, "2.5", "80", 24, 0, null),
  S("s4", "Cargo for errands", "Cargo bike", "Navigli Rentals", 0.0118, -0.0035, "3", "100", 9, 0, null),
  S("s5", "Darsena city bike", "City bike", "Navigli Rentals", 0.0098, -0.0129, "2", "50", 27, 1, drop(1, 940, 5 * H)),
  S("s6", "Ripamonti e-bike", "E-bike", "Porta Romana Bike Co.", -0.0105, 0.0071, "2.5", "80", 12, 0, null),
  S("s7", "Vigentina road bike", "Road bike", "Student Bikes Bocconi", -0.0058, 0.0124, "2.5", "60", 7, 1, drop(3, 9120, 21 * D)),
  S("s8", "Tibaldi city bike", "City bike", "Student Bikes Bocconi", -0.0071, -0.0052, "1.5", "40", 33, 0, null),
  S("s9", "Sarpi commuter", "City bike", "Porta Romana Bike Co.", 0.0151, 0.0018, "2", "50", 22, 0, null),
];

/** Where the live demo bike is parked when it's free: the owner's spot near the Bocconi entrance. */
export const DEMO_SPOT = { lat: BOCCONI.lat + 0.0009, lon: BOCCONI.lon - 0.0013 };
