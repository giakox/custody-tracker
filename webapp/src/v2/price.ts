// Moved from src/pages/MyRentalsPages.tsx (lotto 5), unchanged.
import type { ObjectDetail, Rental } from "../data/types";

const PRICE_PER_HOUR = 2; // test dollars, paid outside today's contract

/** Price of a rental, billed per started quarter hour (a sample pricing rule, not in today's contract). */
export function priceOf(r: Rental, d: ObjectDetail) {
  const end = d.periods[r.period]?.end?.at ?? Date.now();
  const mins = Math.max(1, Math.round((end - r.started.at) / 60_000));
  const quarters = Math.ceil(mins / 15);
  return { mins, quarters, amount: String((PRICE_PER_HOUR / 4) * quarters) };
}
