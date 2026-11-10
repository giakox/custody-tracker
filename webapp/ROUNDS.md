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

## Round 3 · Try the rule before accepting it

- **What:** the rule page gets a simulator. Drag the worst shock of the rental (1 g to 200 g on a log scale, so
  8 / 30 / 80 g aren't squeezed at the start) or tap an example (riding, pothole, falls over, dropped on stone):
  the page shows what you'd get back and what would be withheld, and the matching row of the table lights up.
- **Why:** a table of thresholds in g asks the renter to imagine what 30 g feels like. Seeing "falls over →
  30 dUSD back" is the moment the rule becomes a promise you understand. The examples are labelled as
  indicative (docs/CALIBRATION.md), not measurements of this bike.
- **Reference:** interactive pricing sliders (HubSpot's CRM slider, Mailchimp's calculator) and the argument
  that black-box pricing creates suspicion, not trust:
  https://wua.cx/en/insights/how-price-transparency-builds-trust-and-drives-conversion ·
  https://hostadvice.com/blog/how-to-make-money-online/how-to-sell-online/pricing-page-design/
- **Shots:** [before](rounds/03-before.jpg) · [after](rounds/03-after.jpg) (1440 px)
- **Lines:** 5753

## Round 4 · The bike's record at a glance

- **What:** above the story of the bike, five counts: rentals, drops by level (with the meter), batches signed,
  missing batches, on record since. One line under it says what they are: counts of what the recorder signed,
  not a verdict on the bike.
- **Why:** to know whether a bike was treated well you had to read every chapter. A second-hand buyer or an
  insurer wants the answer first, then the detail. Missing batches are counted openly: completeness is the
  argument for the blockchain, so the gap belongs in the summary, not hidden in the story.
- **Reference:** the Carfax vehicle history report summary, a "snapshot of the records found", where the
  icons "don't indicate whether something is good or bad — they show what types of records exist":
  https://www.carfax.ca/whats-in-a-report · https://clutch.ca/blog/posts/how-to-read-a-carfax-report
- **Shots:** [before](rounds/04-before.jpg) · [after](rounds/04-after.jpg) (1440 px)
- **Lines:** 5796

## Round 5 · "What could your bike earn?"

- **What:** the owner's entry on Home becomes an estimator: two sliders (price per hour, hours rented a week)
  and the monthly figure, then "Rent out your bike". The note under it says it is the owner's own price times
  their own hours, that the rental price is paid outside today's contract, and that damage is settled by the rule.
- **Why:** the old box described the steps (recorder, rules, QR) before giving any reason to take them. An owner
  decides on the money first. The figure is only the owner's inputs multiplied: no market data we don't have.
- **Reference:** Airbnb's host earnings estimator ("What's My Place Worth"), which shows a monthly figure before
  any sign-up: https://houst.com/blog/airbnb-calculator ·
  https://airroi.com/resources/revenue-calculator/airbnb-income-calculator-guide
- **Shots:** [before](rounds/05-before.jpg) · [after](rounds/05-after.jpg) (375 px)
- **Lines:** 5825
