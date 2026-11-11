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

## Round 6 · Your rental, on every page

- **What:** while you have a bike, a slim bar under the header on every page: "Your rental · The demo bike ·
  22 min · worst 41.2 g" with the level, and one button (Open, or "See where it stands" while returning). Blue
  dot at rest, orange once the rental has a shock. Hidden on the renting pages, which already show all of it.
  The map also stops saying "the live bike is out on a rental" to the person who has it.
- **Why:** a renter who left the rental page (to look at the map, at the design page) lost sight of the deposit
  at risk and of the way back to Return. And the home page told Alice her own bike was rented by someone else.
- **Reference:** Uber's ride-in-progress Live Activity: glanceable, priority-based, one state per phase:
  https://www.uber.com/blog/live-activity-on-ios/
- **Shots:** [before](rounds/06-before.jpg) · [after](rounds/06-after.jpg) (1440 px, Alice renting)
- **Lines:** 5891

## Themes · Light, warm, for everyone (three options to choose from)

- **What:** three light themes on the same structure, switchable from the Demo menu ("Look"), or `?theme=paper|day|sticker`
  (the old dark one stays as "Night (old)" for comparison). A · Paper: ivory, Newsreader serif, editorial.
  B · Day: white with a warm sand neutral, Figtree, an everyday app. C · Sticker: warm stone, Bricolage Grotesque
  headings, and the brand blue used as a surface for the rule, like the sticker on the bike. One corner radius
  per theme (`--radius`), pills only for badges and chips. Blue fills keep dark text; text and links use a
  darker blue (`--blue-ink`, ≥ 4.5:1 on every background). Map tiles are OpenStreetMap, warmed by a CSS filter.
- **Also:** Home opens on a daylight photo with the rule in one sentence ("Not the owner, not us"), then the map
  with the owners' photos, three moments of a rental, and the owner's estimator. The bike page uses a photo, plain
  words ("knock", "deposit went back"), the rule in its own card, and keeps transactions and batch numbers behind
  "See the proof". Monospace only on proof surfaces.
- **Why:** Edoardo: the site read as technical and for nerds; "tutto scuro non va bene".
- **Reference:** the Bean There Coffee site from Nate Herk's video (warm tones, big real photos, few words).
- **Shots:** [Home A/B/C](rounds/temi-home.jpg) · [bike page A/B/C](rounds/temi-bike.jpg) (1440 and 375 px)
- **Open:** the bike page photo is still a blue-hour shot; a daylight photo of the demo bike would fit better.

## Round 7 · The rule, playable on Home

- **What:** A section on Home, "What if it gets dropped?", with the rule simulator on the live bike: drag how hard it was dropped and see what comes back. Reuses the simulator from the rental page.
- **Why:** The whole promise is that a public rule decides, so the visitor can try the rule in ten seconds, before reading anything or creating an account.
- **Reference:** Wise's fee calculator on its home page: https://wise.com
- **Shots:** [375 px](rounds/07-375.jpg)
- **Lines:** 6157

## Round 8 · The rule beside the bike

- **What:** On the bike page the rule card moves under the photo, in a right column that stays in view while you read the bike's story. The title, the sentence and the Rent button now sit next to the rule, all above the fold.
- **Why:** The rule is the product. It was below the fold on a laptop; now photo, rule and button are one glance.
- **Reference:** Airbnb's listing page, with its sticky booking card: https://www.airbnb.com
- **Shots:** [1440 px](rounds/08-1440.jpg)
- **Lines:** 6167

## Round 9 · One tap to accept the rule

- **What:** The rule page no longer asks to tick a box and then press a disabled button: one large button, "Accept the rule and continue", with the consent written under it.
- **Why:** Fewer steps before the deposit. The rule is already on screen above the button, so the consent is no less informed.
- **Reference:** Stripe Checkout: a single confirming action, the terms stated beside it: https://stripe.com/payments/checkout
- **Shots:** [1440 px](rounds/09-1440.jpg)
- **Lines:** 6163

## Round 10 · A step back: Home, read as a stranger

- **What:** Read the whole Home as a new visitor and as a professor, and took things out: nine "Sample fleet" chips (the list now says once that only the first bike is real), the repeated money note, and a dot-separated line in the bike record.
- **Why:** The list shouted "sample" nine times and buried the one real bike. A new visitor should see one real bike and a calm list.
- **Reference:** Airbnb's search results: one badge for what is special, nothing on the rest: https://www.airbnb.com
- **Shots:** [1440 px](rounds/10-1440.jpg)
- **Lines:** 6163

### Block 1 to 10 (summary)

- **Lines in `webapp/src`:** see each round's "Lines" (cap: 7392, +40% over commit 463f724 at 5280).
- **Strongest changes:** (1) the whole site in one light, warm theme with a plain voice, photos and relative times; (2) the rule made visible early: playable on Home (round 7) and beside the bike's photo (round 8).

## Round 11 · A face for the owners

- **What:** The owners section becomes a full-width warm band with a photo of a shop owner in his doorway on the left and the earnings estimator on the right, instead of a card at the bottom of the page.
- **Why:** The page ended on a form. People lend to people, so the end of the page is a person and one clear invitation.
- **Reference:** Etsy's "sell on Etsy" band: a seller's face, then the one action: https://www.etsy.com/sell
- **Shots:** [1440 px](rounds/11-1440.jpg)
- **Lines:** 6173

## Round 12 · Prices on the map

- **What:** Every pin on the map is now a price tag (, .5): you see what a bike costs without tapping it. The real bike is blue, a selected bike turns dark, an orange dot still means dropped this week. Also: sliders with a thin warm track and a blue handle instead of the browser default, and the rule simulator's header laid out in two columns.
- **Why:** A map of dots made you tap each bike to learn anything. Price on the pin is the first thing every renter wants.
- **Reference:** Airbnb's map: price tags as pins: https://www.airbnb.com
- **Shots:** [1440 px](rounds/12-1440.jpg)
- **Lines:** 6179

## Round 13 · "Check it yourself" inside the story

- **What:** Where the story says a bike was dropped, a plain link right in the sentence: "Check it yourself", straight to the check. Amounts in the story are readable size again.
- **Why:** The strongest proof of the product was two clicks away behind a toggle. It now sits next to the very sentence a doubting renter or owner would question, without any technical word.
- **Reference:** Carfax's report: the claim and "view the record" side by side: https://www.carfax.com
- **Shots:** [375 px](rounds/13-375.jpg)
- **Lines:** 6183

## Round 14 · Price on the bike page

- **What:** Under the Rent button on the bike page: "2 dollars an hour · 50 dollars deposit, back by the rule". The price was only visible after starting the rental.
- **Why:** A renter decides on price and deposit; both were hidden until the second page.
- **Reference:** Airbnb listing page: the price line sits right under the title and action: https://www.airbnb.com
- **Shots:** [1440 px](rounds/14-1440.jpg)
- **Lines:** 6186

## Round 15 · A step back: the rental path, read as a stranger

- **What:** Read the rule and deposit pages as a new renter and took out what said the same thing twice: the Deposit/Price table above the simulator (now one sentence about the price) and the repeated rule table beside the deposit button (now one line that links back to the rule).
- **Why:** The rule appeared three times in two pages. Said once, with the way to read it again, it stays credible and the page gets short.
- **Reference:** Apple Pay's checkout sheet: only what you are about to confirm: https://www.apple.com/apple-pay/
- **Shots:** [1440 px](rounds/15-1440.jpg)
- **Lines:** 6183

## Round 16 · A dead end becomes a way forward

- **What:** When a bike is out on a ride, its page no longer ends with "come back later": the main button is "See free bikes nearby", back to the map.
- **Why:** A visitor who lands on a rented bike (from a shared link or a QR) had nowhere to go. One button keeps them in the product.
- **Reference:** Booking.com's "no availability" page: it moves you to other places straight away: https://www.booking.com
- **Shots:** [375 px](rounds/16-375.jpg)
- **Lines:** 6184

## Round 17 · The slide diagram follows the site

- **What:** The system diagram that Design offers for the slides is now light, in the site's type and colours, instead of white on black.
- **Why:** It was the last black surface left. The professors' slides now look like the site they demo.
- **Reference:** Stripe's architecture diagrams in docs: light, one blue accent: https://stripe.com/docs
- **Shots:** [diagram](rounds/17-slide.jpg)
- **Lines:** 6184

## Round 18 · The ride ends with a person

- **What:** When nothing was dropped, the outcome page shows a photo of a renter handing the bike back, smiling, and starts with "Thanks for riding." When a fee was kept, it keeps the bike photo: a smile there would be wrong.
- **Why:** The last screen is what people remember (peak-end rule). It was a table; now it is a moment.
- **Reference:** Airbnb's "hope you enjoyed your stay" screen: https://www.airbnb.com
- **Shots:** [1440 px](rounds/18-1440.jpg)
- **Lines:** 6186

## Round 19 · The real bike, one tap from the headline

- **What:** Under the two buttons on Home, a live line: "The demo bike is free now, 2 min walk from Bocconi", linking straight to the bike. It disappears when the bike is out on a ride.
- **Why:** The map is the main path but the one bike that can really be rented is also the demo path. One honest line, one tap.
- **Reference:** Lime's app: the nearest vehicle is offered before you browse the map: https://www.li.me
- **Shots:** [1440 px](rounds/19-1440.jpg)
- **Lines:** 6192

### Block 11 to 20 (summary)

- **Lines in `webapp/src`:** about 6,190 (cap 7,392; commit 463f724 had 5,280).
- **Strongest changes:** (1) prices on the map pins (round 12), the bike's cost visible at a glance; (2) "Check it yourself" placed inside the story sentence where a knock is mentioned (round 13), with the price and the way forward when a bike is out (rounds 14 and 16).
- **Steps back:** round 15 (the rental path said the rule three times) and round 20 (the map legend cut from three items to two).

## Round 20 · A step back: the map

- **What:** Read the map as a stranger. The price pins explain themselves, so the legend lost the "sample bikes" entry and is down to two: the real bike and the orange "dropped this week" dot.
- **Why:** A legend that explains what is already obvious is noise. The orange dot is the only thing that needed a word.
- **Reference:** Tufte's data-ink ratio: remove ink that explains nothing: https://en.wikipedia.org/wiki/Data-ink_ratio
- **Shots:** [1440 px](rounds/20-1440.jpg)
- **Lines:** 6192

## Round 21 · One tap to a test wallet

- **What:** In the sample version the wallet step is a single button, "Use a test wallet", with the test money already in it, instead of two wallet brands that both did the same thing. A line says the live version connects your own wallet.
- **Why:** The wallet page was the steepest step for anyone not in crypto, and two buttons were pretending to be a choice.
- **Reference:** Stripe's test mode: the whole flow with test money and no real card: https://stripe.com/docs/testing
- **Shots:** [1440 px](rounds/21-1440.jpg)
- **Lines:** 6198

## Round 22 · The owner's bikes as photo cards

- **What:** On My bikes each bike is a card with its photo, its name, whether it's available or out, the last knock and the number of rentals, instead of a grey row.
- **Why:** An owner's page should feel like looking at what they own. The rows had no picture and little weight.
- **Reference:** Airbnb's host listings page: a card with a photo per listing: https://www.airbnb.com/hosting
- **Shots:** [1440 px](rounds/22-1440.jpg)
- **Lines:** 6212

## Round 23 · Honest test wallet, and a title per page

- **What:** The test-wallet step now says plainly that it is a demo wallet with test money, not the user's own, and that in the live version it is their wallet and Sharify never holds money or keys. Also: each page sets its own browser tab title.
- **Why:** Round 21 sat next to the sentence "Sharify never holds your keys", which is false for a demo wallet. The thesis is that nobody controls it alone: the demo must not blur that.
- **Reference:** Stripe test mode docs: test is labelled as test everywhere: https://stripe.com/docs/testing
- **Shots:** none
- **Lines:** 6219

## Round 24 · Home as a story in four chapters

- **What:** The three small photo cards become four full-width chapters (find, unlock, ride, return), each a big real photo with a white card that rises over it. The photo drifts and the card rises as you scroll (CSS scroll-driven animation, off with reduced motion). The ride chapter lets the recorder photo step out of the frame, tilted, over the corner. One shadow scale (elev-1 to 3) is introduced.
- **Why:** Edoardo asked for a layered, designed page like the coffee site's evolution: big photos, stacked sections, scroll motion. The old section was a row of three thumbnails.
- **Reference:** Linear's changelog and Apple product pages: full-bleed chapters with cards and scroll-driven reveals: https://linear.app/changelog and https://www.apple.com/iphone/
- **Shots:** [375 px](rounds/24-375.jpg)
- **Lines:** 6244

## Round 25 · A translucent header over the photos

- **What:** The header is now sticky and frosted: the hero photo and the map slide under it. It starts almost clear on the photo and gains a soft shadow after 160 px of scroll (scroll-driven, off with reduced motion). The hero photo runs up behind it and the hero is taller.
- **Why:** Edoardo wanted layers that overlap. A flat white bar cut the photo off from the page; a frosted one makes the photo the page.
- **Reference:** Airbnb and Apple: sticky translucent headers that blur what is under them: https://www.apple.com
- **Shots:** [1440 px](rounds/25-1440.jpg)
- **Lines:** 6257

## Round 26 · An editorial type scale

- **What:** One scale for the whole site (display, h1, h2, lead) set tighter and heavier: titles at -0.04em with balanced line breaks, text wrapping to avoid orphans, tabular figures for amounts. The hero title is now 78 px in a narrower card, so the rider stays in view.
- **Why:** The titles were the same size as the body's neighbours. A big, tight headline is what makes a page feel designed, and the first version of the bigger hero hid the rider, so the card was narrowed.
- **Reference:** Stripe and Linear headlines: tight tracking, heavy weight, balanced lines: https://stripe.com https://linear.app
- **Shots:** [1440 px](rounds/26-1440.jpg)
- **Lines:** 6270

## Round 27 · Pressed, lifted, loading

- **What:** Buttons press in and rise on hover with the shared shadow scale; cards lift; map price pins grow and come to the front on hover; nav links draw an underline; a visible 3 px focus ring everywhere; the bike page loads as a skeleton of its own layout instead of a sentence about the chain.
- **Why:** The details that make a page feel alive and cared for, and an honest loading state that also keeps the layout from jumping.
- **Reference:** Stripe and Vercel: tactile buttons, restrained lift, skeleton loaders: https://vercel.com
- **Shots:** [1440 px](rounds/27-1440.jpg)
- **Lines:** 6298

## Round 28 · The owners' card steps out over the photo

- **What:** In the owners' band the earnings card now overlaps the shop photo by a column, floating above it with the soft top shadow; on a phone it rises over the bottom of the photo.
- **Why:** Edoardo asked for layers: things that overlap and leave their frames. The band was two boxes side by side.
- **Reference:** Squarespace and Webflow showcase sites: a card overlapping the hero photograph: https://www.squarespace.com
- **Shots:** [375 px](rounds/28-375.jpg)
- **Lines:** 6309

## Round 29 · The rule on a field of colour

- **What:** "What if it gets dropped?" now sits on a full-width pale-blue field, the simulator is a raised white card with the biggest numbers on the site (the knock and what comes back).
- **Why:** The rule is the product, so it gets the loudest moment on the page: a change of colour, a floating card and the numbers set large.
- **Reference:** Wise's calculator and Stripe's pricing sliders on tinted fields: https://wise.com https://stripe.com/pricing
- **Shots:** [1440 px](rounds/29-1440.jpg)
- **Lines:** 6316

### Block 21 to 30 (summary)

- **Lines in `webapp/src`:** about 6,320 (cap 7,392; commit 463f724 had 5,280).
- **Strongest changes:** (1) Home as a story in chapters with big photos, cards rising over them and scroll-driven drift (round 24), with the translucent header over the photos (round 25); (2) the rule on a field of colour with the largest numbers on the site (round 29), and the editorial type scale (round 26).
- **Direction change (round 24 on):** at least four rounds in five are visual design, as asked by Edoardo; the taste skill's bans on soft corners and shadows are not followed where they conflict with his pinned direction (one rounded radius, one shadow scale, a translucent header).

## Round 30 · A step back: the Home as a whole

- **What:** Read the whole Home top to bottom as a stranger. The first chapter ("Find a bike a few minutes away") repeated the map directly above it, so it went. The story now starts where the map ends: unlock, ride, return.
- **Why:** Every section after a map should add something new. Three chapters keep the rhythm and cut a screen of scrolling.
- **Reference:** Apple's product pages: each chapter introduces one new idea, none repeats the one before: https://www.apple.com/iphone/
- **Shots:** none
- **Lines:** 6314

## Round 31 · The rule card overlaps the bike's photo

- **What:** On the bike page the rule card now rises over the bottom of the photo, floating on the large soft shadow, with the photo itself lifted on the middle one. Same on a phone.
- **Why:** Depth, as asked: the rule is the product and now literally sits on top of the bike.
- **Reference:** Apple's iPhone buy page: the product photo with a floating spec card overlapping it: https://www.apple.com/shop/buy-iphone
- **Shots:** [1440 px](rounds/31-1440.jpg)
- **Lines:** 6320

## Round 32 · Pages arrive

- **What:** Every page rises in softly on load (the first blocks one after the other, 60 ms apart); on Home the hero card's title, sentence, buttons and live line enter in sequence; on the bike page the title block does the same. Off with reduced motion.
- **Why:** A page that pops in feels like a prototype; one that arrives feels finished. It also stands in for the page transitions Edoardo asked for.
- **Reference:** Stripe.com and Linear.app: staggered entrances of the first screen: https://stripe.com https://linear.app
- **Shots:** [1440 px](rounds/32-1440.jpg)
- **Lines:** 6332

## Round 33 · Verify, dressed as the proof moment

- **What:** The answer card is a raised field of pale blue with a large stamped check that lands with a small bounce, a big headline and the soft shadow; the chart bars are tall pills with a ringed pick.
- **Why:** Verify is the moment a doubting professor or renter trusts the system. It should feel like an event, not a form.
- **Reference:** Stripe's payment-success states: one large mark, one big sentence, a small stamp motion: https://stripe.com
- **Shots:** [1440 px](rounds/33-1440.jpg)
- **Lines:** 6349

## Round 34 · A photograph for the technical page

- **What:** "How Sharify is designed" opens with a wide photo of the recorder in a hand, with a caption card on it, before the three plain sentences and the technical scheme.
- **Why:** The technical page was all text. The whole project is one small object; the professors should see it first.
- **Reference:** Teenage Engineering and Oura product pages: the object in a hand, large, before any specification: https://www.oura.com
- **Shots:** [1440 px](rounds/34-1440.jpg)
- **Lines:** 6359

## Round 35 · A step back: the length of the Home

- **What:** Measured the Home: about 6,100 px, of which the three chapters took 2,400. Each chapter is now 74% of the screen tall instead of 86%, which takes about 350 px out without losing a photo or a sentence.
- **Why:** A story is stronger when it is shorter than the reader's patience. Rhythm: hero, map, chapters, rule, owners, each about one screen and a half at most.
- **Reference:** Apple's iPhone page pacing: chapters that fit a screen and a bit, never more: https://www.apple.com/iphone/
- **Shots:** none
- **Lines:** 6359

## Round 36 · Two speeds in the hero

- **What:** As you scroll away from the first screen, the photo sinks and swells slowly while the white card moves up faster, so they separate like layers (scroll-driven, off with reduced motion).
- **Why:** Parallax is the cheapest convincing depth. It makes the hero feel like a scene rather than a picture with a box on it.
- **Reference:** Airbnb's and Apple's hero parallax: photo and text layer moving at different rates: https://www.apple.com/macbook-air/
- **Shots:** [1440 px](rounds/36-1440.jpg)
- **Lines:** 6370

## Round 37 · The selected bike opens on its photo

- **What:** Tapping a bike on the map opens a panel whose photo runs edge to edge at the top, then a big name, big figures for price and deposit, and the two buttons; the close button floats on the photo.
- **Why:** The panel was a form with a thumbnail. A bike you might ride should arrive as a picture first.
- **Reference:** Airbnb's map card: the listing photo first, price second: https://www.airbnb.com
- **Shots:** [1440 px](rounds/37-1440.jpg)
- **Lines:** 6379

## Round 38 · Progress as a segmented bar

- **What:** The five rental steps (and the six owner steps) are now a row of rounded segments that fill in blue as you go, with the current step named under its segment; on a phone only the current label shows.
- **Why:** The grey pills with numbers looked like a form wizard. A bar says "how far" at a glance and is quieter.
- **Reference:** Stripe Checkout and Typeform: a thin segmented progress, one label: https://stripe.com/payments/checkout
- **Shots:** [1440 px](rounds/38-1440.jpg)
- **Lines:** 6390

## Round 39 · A floating action bar, and a bug fixed

- **What:** The bar that follows you down a bike page is now a frosted floating card with the large shadow instead of a full-width strip. Also fixed a regression from round 24: the Home chapters shared a class name with the bike page's story, which stretched every story entry to a screen tall; the Home ones are now named differently. Page entrances no longer keep an animation in effect once finished.
- **Why:** Found by measuring the bike page after the chapters shipped. The cost of reusing a short word like "chapter" in a flat stylesheet.
- **Reference:** Apple's bag bar and Airbnb's reserve bar: a floating translucent card pinned to the bottom: https://www.apple.com
- **Shots:** [1440 px](rounds/39-1440.jpg)
- **Lines:** 6397

### Block 31 to 40 (summary)

- **Lines in `webapp/src`:** about 6,360 (cap 7,392; commit 463f724 had 5,280).
- **Strongest changes:** (1) depth on the bike page (the rule card over the photo, round 31) and the owners' card over the shop photo (round 28), with the soft shadow scale; (2) Verify dressed as the proof moment (round 33) and the floating action bar (round 39).
- **Found and fixed:** the Home chapters shared a class name with the bike page's story and stretched it (round 39). All 14 routes were then checked for sideways overflow and broken images: none.
- **Steps back:** round 35 (Home length) and round 40 (36 unused CSS rules removed).

## Round 40 · A step back: what is no longer used

- **What:** Listed every CSS rule whose class no longer appears in the code (old home hero, entries, stats, next-page, phone-only helpers) and removed the 36 single-line ones. Then walked all 14 routes at 1440 px: no sideways overflow, no broken image.
- **Why:** Every redesign leaves orphans. Cutting them keeps the sheet honest and the line budget for what matters.
- **Reference:** Chrome DevTools' CSS coverage tool (unused rules): https://developer.chrome.com/docs/devtools/coverage
- **Shots:** none
- **Lines:** 6361

## Round 41 · The name comes back at full width

- **What:** The footer of Home and of the design page is now a warm band with the name set huge in the brand blue, the honest test-network sentence and the two ways on underneath, instead of a grey line of small type.
- **Why:** A page should end on its name, like a book's last page. It is also the most memorable pixel after the hero.
- **Reference:** Linear.app and Resend.com footers: the wordmark scaled to the full container width: https://resend.com
- **Shots:** [1440 px](rounds/41-1440.jpg)
- **Lines:** 6389

## Round 42 · Scanning, then found

- **What:** Pairing the recorder: the scan frame sweeps a blue line top to bottom while it reads, then the corners tighten and the frame turns pale blue with "Found" in bold.
- **Why:** The step that connects the real object to the app deserves a moment of feedback you can see.
- **Reference:** Apple Pay and bank apps' card scanners: a sweeping line then a lock-on: https://www.apple.com/apple-pay/
- **Shots:** [1440 px](rounds/42-1440.jpg)
- **Lines:** 6400

## Round 43 · Contrast pass, measured

- **What:** Ran a script over Home, bike page, rule, design and verify that computes the contrast of every piece of visible text against its real background. One finding (the 10 px tick labels on the rule slider, measured against their 1 px tick line, a false alarm in size but too small anyway): now 12 px. Every other text is at 4.5:1 or better.
- **Why:** A design that looks refined and fails contrast is not refined. The rule is the contract of this site: min 4.5:1.
- **Reference:** WebAIM contrast checker, the WCAG 2.1 method: https://webaim.org/resources/contrastchecker/
- **Shots:** none
- **Lines:** 6401

## Round 44 · The chapters stack like sheets

- **What:** Each chapter of the Home story is now a full screen that pins to the top while the next one slides up over it, with rounded top edges and a soft shadow above, like turning pages. The card reveal only plays as the chapter arrives, so it never stays half-faded while pinned. Static (no stacking) with reduced motion.
- **Why:** The first critique of the Home said it was one layer of cards on photos. Sticky stacking is the cheapest true layering: it makes scroll the way you move through the story.
- **Reference:** Apple's AirPods Pro and Aesop's story pages: full-screen panels that stack as you scroll: https://www.apple.com/airpods-pro/
- **Shots:** [375 px](rounds/44-375.jpg)
- **Lines:** 6411

## Round 45 · A step back: the defects the critique saw

- **What:** Fixed what a fresh critique of the Home and bike page listed: the secondary buttons' border is now visible (3:1), slider and step labels are 13 px, the rule table fills its card, the rule band's heading aligns to the top of its card, and the bike page's text column uses one spacing scale (12 / 20 / 28 / 14 / 40).
- **Why:** A layered page only looks expensive if every edge is square to the grid. These were the small things that said "prototype".
- **Reference:** Refactoring UI, spacing scale and hierarchy chapters: https://www.refactoringui.com
- **Shots:** [1440 px](rounds/45-1440.jpg)
- **Lines:** 6426

## Round 46 · The slider drives the whole band

- **What:** On Home, dragging the knock in "What if it gets dropped?" now changes the whole full-width band: pale blue while nothing is kept, pale orange from a light knock and deeper at a strong one. The numbers are the biggest type on the site, stacked so they never touch.
- **Why:** Orange only ever meant a knock. Letting the whole field carry that meaning makes the rule felt, not just read.
- **Reference:** Apple's colour-changing product configurators: the stage recolours with your choice: https://www.apple.com/shop/buy-iphone
- **Shots:** [1440 px](rounds/46-1440.jpg)
- **Lines:** 6439

## Round 47 · A live rental says it is live

- **What:** On the ride page a pulsing dot (blue, orange once there has been a knock) opens the line "Your rental · 22 min so far" in a larger, bolder size, so the page reads as something happening now.
- **Why:** The most anxious page of the product (money is held) should feel alive and under watch.
- **Reference:** Uber and Lyft ride-in-progress screens, Apple Live Activities: a pulsing live marker: https://www.uber.com/blog/live-activity-on-ios/
- **Shots:** [1440 px](rounds/47-1440.jpg)
- **Lines:** 6448

## Round 48 · The owner sees the listing while typing

- **What:** On the "Your bike" and "Your rules" steps of adding a bike, a card on the right shows how renters will see it (photo, name, type and spot, price and deposit) and updates as you type; on a phone it sits above the form.
- **Why:** Adding a bike is the owner's one act of faith. Seeing the finished listing grow makes it concrete and shows why each field matters.
- **Reference:** Airbnb's host onboarding: a live preview card of your listing: https://www.airbnb.com/host/homes
- **Shots:** [1440 px](rounds/48-1440.jpg)
- **Lines:** 6483

## Round 49 · Daylight bikes, one grade

- **What:** The nine sample bikes are now photographed in the same warm afternoon light as the rest of the site (generated locally, checked one by one; two were redone because the frames showed invented lettering), and every photograph on the site gets the same light grade (slightly warmer, a touch more contrast).
- **Why:** The critique said the set did not look like one shoot: a warm hero, cool blue-hour bikes. One light, one grade.
- **Reference:** Kinfolk and Aesop: a single colour grade across all photography: https://aesop.com
- **Shots:** [1440 px](rounds/49-1440.jpg)
- **Lines:** 6486
