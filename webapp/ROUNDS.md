# Visual evolution, 10 rounds

Base commit `6d463a0`: 5584 lines in `webapp/src`. Cap: +15% = 6421 lines.
Shots are 420 px JPEGs (a PNG of the map is ~10× larger). Prompt for every round:
"Look at the site first. Then innovate… Make one bold change… You must ship a change every time."

## Round 1 · The nearest bike you can rent, one tap from the map

- **What:** the bottom strip "10 bikes nearby" becomes a card with the nearest rentable bike: distance and
  walking time, price, deposit, the Live badge, a **Rent** button and "10 nearby" for the list. On desktop it
  floats over the map. When the live bike is out, the card says so.
- **Why:** on the home page renting took three steps (find the pin, tap it, read the sheet, tap Rent). The map
  is the entry point: the one real action should be visible without looking for it. Only the live bike can be
  rented, so the "nearest" is the live bike, never a sample one.
- **Reference:** Lime's "Find Available Scooter" button, which shows the closest vehicle with walking distance
  immediately: https://www.li.me/blog/lime-latest-app-tech-find-available-scooter-feature
- **Shots:** [before](rounds/01-before.jpg) · [after](rounds/01-after.jpg) (375 px)
- **Lines:** 5617

## Round 2 · The bike page keeps its action in reach

- **What:** once the top block scrolls away, a bar slides up from the bottom with the bike, a one-line status
  for this viewer ("Available · 50 dUSD deposit", "Out with you · worst 41.2 g, medium", "Being returned") and
  the page's one action in short form (Rent, Return, Confirm, Manage). It is not focusable while hidden.
- **Why:** the bike page is long (story, ledger, how it works, sources). A renter who scrolled to check the
  history had to scroll all the way back up to rent or return.
- **Reference:** Airbnb's mobile listing keeps "Request to Book" pinned to the bottom
  (https://mobilemarketingmagazine.com/?p=91435); Booking.com reports a sticky mobile CTA among its best
  experiments (AB Tasty case study, https://www.abtasty.com/wp-content/uploads/2026/04/AB-Tasty-x-Booking.com-Case-Study.pdf).
- **Shots:** [before](rounds/02-before.jpg) · [after](rounds/02-after.jpg) (375 px, scrolled into the history)
- **Lines:** 5669
