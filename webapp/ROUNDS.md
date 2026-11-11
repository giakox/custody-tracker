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

### Block 41 to 50 (summary)

- **Lines in `webapp/src`:** about 6,490 (cap 7,392; commit 463f724 had 5,280).
- **Strongest changes:** (1) the Home story as full-screen chapters that stack like sheets (round 44) and a rule band whose colour follows the slider, with the biggest numbers on the site (round 46); (2) daylight photographs for every sample bike under one light grade (round 49), and the name set huge in the footer (round 41).
- **Steps back:** round 45 (the defects a fresh critique listed) and round 50 (all 15 routes at 375 px: none overflows; every animation checked against reduced motion).
- **Not done:** the hero video. The video tool downloads its model (about 20 files from the Hugging Face Hub) instead of using a local copy and moved at under 1 MB/s, so it was stopped; the hero keeps its scroll parallax. It needs the q4 weights placed under `~/.local/share/temposy-social/modelli/` or a decision to download them.

## Round 50 · A step back: every route on a phone

- **What:** Walked all 15 routes at 375 px: none overflows sideways. Checked that every animation added since round 24 is inside a no-preference media query or removed by the global reduced-motion rule.
- **Why:** Fifty rounds in, the risk is not an ugly page but a broken edge. This is the check that catches it.
- **Reference:** WCAG 2.1 reflow (1.4.10) and prefers-reduced-motion guidance: https://www.w3.org/WAI/WCAG21/Understanding/reflow.html
- **Shots:** none
- **Lines:** 6486

## Round 51 · The receipt is a slip you could tear off

- **What:** The receipt page is now a warm paper slip with a torn zigzag bottom edge, a heavy rule over the lines and the deposit back set in large type; printing flattens it.
- **Why:** The receipt is the one thing a renter or owner keeps. It should look like something you would keep.
- **Reference:** Stripe's receipts and Apple Store receipts: one big total, calm lines: https://stripe.com/docs/receipts
- **Shots:** [1440 px](rounds/51-1440.jpg)
- **Lines:** 6498

## Round 52 · The phone menu is a page of big words

- **What:** On a phone, Menu opens a full-height white page under the header with each destination set in large, tight type (41 px) that slides in one after the other.
- **Why:** A small dropdown is the most generic thing on a phone site; a page of big words is editorial and easy to hit with a thumb.
- **Reference:** Stripe's and Linear's mobile menus: full-screen, large type: https://linear.app
- **Shots:** none
- **Lines:** 6506

## Round 53 · The map in paper tones

- **What:** The base map is tinted warm (a sepia wash and a slight hue shift) with a soft inner vignette, so it sits in the same world as the sand surfaces and the photographs; price pins get a warm shadow instead of grey.
- **Why:** A cold grey-blue street map was the one thing on the page that did not belong to the palette.
- **Reference:** Aesop's store locator and Kinfolk's maps: a map tinted to the brand paper colour: https://aesop.com
- **Shots:** [1440 px](rounds/53-1440.jpg)
- **Lines:** 6511

## Round 54 · The story has a spine

- **What:** The bike's story now runs on a thin vertical line with a dot per event: hollow for ordinary lines, dashed for a missing piece of the diary, solid orange at the knock.
- **Why:** A list of lines reads as a log; a line with dots reads as a story, and the orange dot is the one thing the eye finds first.
- **Reference:** Linear's issue history and GitHub's timeline: a spine with markers: https://github.com
- **Shots:** [1440 px](rounds/54-1440.jpg)
- **Lines:** 6522

## Round 55 · A step back: one shadow scale

- **What:** Collected the nine different resting shadows on cards, panels and pins into the three on the scale (small, medium, large). Only focus rings, dots and glows keep their own.
- **Why:** Edoardo asked for a single, coherent shadow scale. A site where every card has its own shadow looks assembled; one with three looks designed.
- **Reference:** Material Design elevation and Apple HIG: a short, named elevation scale: https://m3.material.io/styles/elevation/overview
- **Shots:** none
- **Lines:** 6522

## Round 56 · How it works as three sand cards

- **What:** On the bike page the three steps are now three warm sand cards with large blue numerals; they lift on hover.
- **Why:** The end of the page was three columns of text between thin lines; now it closes the page with something to look at, in the same material as the rest.
- **Reference:** Stripe Press and Notion's marketing pages: big numerals over short sentences on soft cards: https://press.stripe.com
- **Shots:** [1440 px](rounds/56-1440.jpg)
- **Lines:** 6530

## Round 57 · The wallet step shows what it is for

- **What:** The wallet page is two columns: the plain explanation and the one button on the left, a tall photo of hands holding a phone next to a bike on the right (stacked above the text on a phone).
- **Why:** The step where a non-crypto visitor is most likely to leave was a paragraph and a box. A photo of the person doing it makes it an ordinary thing.
- **Reference:** Apple Pay setup pages: the device in a hand beside one clear action: https://www.apple.com/apple-pay/
- **Shots:** none
- **Lines:** 6540

## Round 58 · Returning shows where to leave it

- **What:** The return page pairs the three steps with a large photo of a bike parked at a rack, the same two-column composition as the wallet step.
- **Why:** The return is where a renter worries; the photo says what a normal, finished ride looks like.
- **Reference:** Airbnb's check-out instructions: the photo of the place beside the steps: https://www.airbnb.com
- **Shots:** none
- **Lines:** 6545

## Round 59 · Bars say what they are

- **What:** On Verify each second of the ride is a bar; hovering or focusing one now raises a small dark label with its knock strength and time.
- **Why:** A chart you cannot read is decoration. The proof page is the one place a user will poke at the data.
- **Reference:** Linear and Vercel charts: a plain dark tooltip on hover, no legend: https://vercel.com/analytics
- **Shots:** none
- **Lines:** 6551

### Block 51 to 60 (summary)

- **Lines in `webapp/src`:** about 6,550. Edoardo and the lead agreed that purely visual code (layers, scroll animations, micro-interactions, type) may take the cap from +40% to +60% over commit 463f724 (8,448); nothing here is a new feature, and it is still below the old cap of 7,392.
- **Strongest changes:** (1) the receipt as a tear-off slip (round 51) and the story's vertical spine with an orange dot at the knock (round 54); (2) the map in paper tones (round 53) and one shadow scale for the whole site (round 55).
- **Steps back:** round 55 (nine shadows reduced to three) and round 60 (phone length of the Home: the stacked chapters are 82% of the screen on a phone, about 440 px shorter).

## Round 60 · A step back: the Home on a phone

- **What:** Measured the Home at 375 px: 8.4 screens, 2,400 px of it the three chapters. On a phone they are now 82% of the screen tall each.
- **Why:** Stacked sheets feel generous on a laptop and endless on a phone.
- **Reference:** Apple's iPhone page on mobile: chapters shorter than the screen: https://www.apple.com/iphone/
- **Shots:** none
- **Lines:** 6551

## Round 61 · The browser bar and the link preview match the site

- **What:** The phone browser's top bar was still the old midnight black; it is white now. The page also has a description and a preview title and photo for when the link is shared.
- **Why:** The first pixels a phone user sees are the browser's own bar. It was a leftover of the dark theme.
- **Reference:** Apple's HIG on tint and theme colour for web: https://developer.apple.com/design/human-interface-guidelines/
- **Shots:** none
- **Lines:** 6551

## Round 62 · The hero photograph breathes

- **What:** The first photo now drifts very slowly (a 26-second swell and slide, back and forth) on top of the scroll parallax, standing in for the background video that could not be generated here. Uses the independent scale and translate properties so it never fights the parallax; off with reduced motion.
- **Why:** A still photograph at the top of a page is a poster; a barely moving one is a place. The video was blocked by a missing model, so the movement is made in CSS.
- **Reference:** Airbnb and Aesop heroes with slow Ken Burns drift: https://aesop.com
- **Shots:** none
- **Lines:** 6557

## Round 63 · Fields that feel like part of the page

- **What:** Text fields and selects are 48 px tall, sand-filled with the site's one radius, darken their border on hover and take a clear 3 px blue ring on focus; labels are bolder; checkboxes are blue and larger.
- **Why:** The Add-your-bike form was the one place with browser-default-looking controls.
- **Reference:** Stripe Elements and Linear forms: tall fields, one focus ring: https://stripe.com/docs/elements
- **Shots:** none
- **Lines:** 6565

## Structure · Find a bike, rebuilt like a search with a map

Edoardo, on the old section: the structure had not changed since round 1, a flat column glued to the left edge with 60 px thumbnails and the map filling the rest. Not a detail problem: the layout was wrong.

- **Before:** [rounds/structure-before-1440.jpg](rounds/structure-before-1440.jpg).
- **Reference 1, Airbnb search with the map on (desktop):** [rounds/ref-airbnb-1440.jpg](rounds/ref-airbnb-1440.jpg). What we take: real page margins, no element on the edge; a title and small subtitle above the results; a row of filter chips; the results as large cards, two per row, photo first (4:3, rounded), then two short lines and the price; the map as a rounded panel with a margin all round, sticky while the cards scroll, with price pills and zoom buttons inside it.
- **Reference 2, Airbnb on a phone:** [rounds/ref-airbnb-390.jpg](rounds/ref-airbnb-390.jpg). What we take: the map is the full-screen layer, with a rounded white sheet over it that has a grab handle, a title and large photo cards; the search pill and filter chips float at the top.
- **Not used:** Turo (the closest product, peer-to-peer car rental) sits behind a bot check, so it could not be viewed.
- **After (desktop):** [rounds/structure-after-1440.jpg](rounds/structure-after-1440.jpg). The section has the page's margins and a grid: on the left, the title, the filter chips (All, City, E-bike, Cargo, Road, up to 2 dollars an hour) and the bikes as large cards two per row, photo first (4:3) with the Live or Sample badge on it, then name, distance and walk, the price in bold and the black-box line; the real bike has Rent on its photo. On the right, the map as a framed panel from the top of the section, sticky while the cards scroll, with price pins. Hovering a card lights its pin; choosing one opens a mini-card with the photo on the map.
- **After (phone):** [rounds/structure-after-390.jpg](rounds/structure-after-390.jpg) and [pulled up](rounds/structure-after-390-full.jpg). The map fills the screen, the chips float on top, the cards ride in a sheet as a carousel that snaps; the card in the middle lights its pin. Pulling the handle up turns the sheet into the full list.

## Structure · The header, floating

Edoardo: the header was flat, a thin full-width strip with a small logo, the "Sample data" pill beside it and small links in a corner.

- **Reference 1, Linear (linear.app):** what we take is the hierarchy of the right side: one quiet text action and one filled pill as the main action, and navigation set in a real weight with room around each item.
- **Reference 2, Airbnb (airbnb.com):** the logo on the left, the middle of the bar for what you came to do, round controls on the right, and a phone layout reduced to the logo and one round button.
- **Reference 3, Raycast (raycast.com, often featured on godly.website):** the bar floats: inset 16 px from the top and the sides, 76 px tall, 16 px radius, a light 5 px blur and a hairline border. We take the inset, the radius and the light blur; we use our own white, one shadow from the scale and our single radius.
- **What changed:** a floating bar aligned to the page's content width (12 px from the top), the logo at 30 px, the sections in the middle as rounded items with a dark pill for the page you are on, "Connect wallet" as the quiet action and "Find a bike" as the filled one (your wallet once connected, with My bikes beside it). It tightens and its shadow deepens over the first 140 px of scroll (off with reduced motion). The "Sample data" pill left the bar: the Demo button now reads "Demo · sample data". On a phone: the logo and a round dark menu button that turns into a cross and opens the page of big words.
- **"Find a bike" goes to the finder:** a new address, #/bikes, opens Home scrolled to the bikes.
- **Before and after, side by side:** [finder 1440](rounds/sbs-finder-1440.jpg), [Home top 1440](rounds/sbs-home-1440.jpg), [finder on a phone](rounds/sbs-finder-375.jpg), [header scrolled](rounds/sbs-header-scrolled-1440.jpg), [phone menu](rounds/after-menu-375.jpg).
- **Critique after the first pass, fixed before the commit:** "Near me" fell alone onto a second chip row at 1440 (chips 15 px padding, 8 px gap: one row now); the legend had lost its two dots when the old map CSS went; the other pins faded to 55% when one was selected, which put their price text under 4.5:1 (no fading now: the selected pin is dark and larger, that is enough); the phone menu was 362 px wide and centred, not full screen, because a fixed grid child kept `justify-self: center` (now stretched); the mini-card's "deposit 50 · 2 min walk" broke mid-phrase (now two lines).
- **Test, "is it another page at a glance?"** Yes. Edoardo, after seeing it: «OH ORA SIAMO SULLA STRADA GIUSTA».

## Round 64 · The bike page becomes a listing

- **Screen:** the bike page (weakest after the finder: a half-and-half hero, then a story column with an empty 300 px gutter on its left and a floating bar that repeated the button).
- **References:** Airbnb's room page ([side by side](rounds/64-ref-airbnb.jpg)) and Apple's iPhone buy page. Why ours looked cheaper: Airbnb gives the pictures the whole content width as one mosaic and puts every decision (price, dates, the button) in one card that stays beside you while you read; ours split the first screen in two, so the photo and the copy each had half and neither led. Apple keeps the price in reach all the way down in one quiet strip; ours brought a second bar up from the bottom that covered the story and said the same thing as the hero. Below the hero, ours wasted the left third of the page on a sticky title.
- **Three ideas:** (1) a listing: title, a mosaic of three pictures across the page, then the story on the left and a booking card on the right that stays in view (price, deposit, Rent, the rule). (2) The story as a horizontal ribbon of rentals, like a flight timeline. (3) A full-bleed photo hero with the title over it.
- **Discarded:** (2) the story is sentences, and sentences in a horizontal strip are unreadable on a phone. (3) the photo is busy (people, railings): white type over it fails contrast without a scrim, and a scrim hides the bike.
- **Chosen, (1):** [before and after, 1440](rounds/64-bike-1440.jpg), [phone](rounds/64-bike-375.jpg). The mosaic carries the bike, its recorder and the phone it is rented from, each with a caption saying what it is. The booking card holds the price in large type, the deposit, the one button and the rule table (meter, level, amount set right); it is sticky under the floating header and replaces the bottom bar on desktop. On a phone the pictures swipe and snap, the card follows the summary, and the bottom bar comes back once the card has scrolled away. The story and the proof take the left column at full width; the page now ends with the footer like the others.
- **Craft:** one radius for mosaic, card and photo crops; card on --elev-2; spacing only from 8/12/16/24/32/48/64; the pictures arrive once with a short clip-path reveal (off with reduced motion), and grow 3% on hover with a pointer.
- **Test, "is it another screen at a glance?"** Yes: the first screen is now a title over a picture mosaic, not a two-column hero; below, a card on the right instead of a gutter on the left.

## Round 65 · The bike's record: one headline, one card per rental

Edoardo, on the left column of the bike page: «l'occhio non sa dove guardare… sembrano tutte cose inutili e ugualmente importanti. Serve gerarchia, posizionamento e perfezione.»

**Hierarchy audit (before):**

| Block | Who needs it, when | If it vanished | Verdict |
|---|---|---|---|
| Summary sentence ("The last rental, Bob's, ended…") | renter deciding | the title already says "available"; the last rental is in the record | shown only while something is happening (rented, handed over) |
| State line (Available → Rented → Returned → Settled, with times) | nobody at rest: it replays the last rental | nothing lost | shown only while something is happening |
| "Its story" + "Newest first…" | — | — | heading becomes a small label; the note goes to the end |
| Four counters in a ruled box (Rentals, Drops, Holes, Since) | renter: "has it been treated well?" | the most useful fact on the page disappears | merged into one sentence, the primary: "2 rentals, dropped once. The hardest: a medium knock." |
| "Since" and "holes in the diary" | the careful renter | small loss | secondary, two pills under the headline |
| "With the owner" rows (27 min so far, for 10 min) | nobody | nothing | removed, unless something happened (a knock or a hole) while with the owner |
| Each rental: header + 4–6 timed steps with transaction hashes, all open | renter wants the outcome; a judge wants the steps | outcome lost | the outcome is the card's headline; steps sit behind "Every step"; hashes only in proof mode |
| "See the proof" + its sentence | professors, auditors | the proof | tertiary, last |

**Levels after:** primary = the record headline (38 px, 700). Secondary = the rental cards, each with its own outcome line (19 px, 600) and the two fact pills. Tertiary = when/for how long, the steps, the note, the proof button.

**Squint test:** [before and after, blurred](rounds/65-squint.jpg). Before, the eye found no anchor: the counters box, the state line and the step rows were the same grey weight. After, it lands on the dark headline, drops to the two cards (the medium knock's orange meter pulls to the second), and leaves the note last.

**References:** Airbnb's room page puts the whole verdict in one line under the title ("★ 4.64 · 28 reviews") and the reviews below as cards, avatar first; Linear's changelog keeps the details of each release behind a row you open. Why ours looked cheaper: we showed everything at once, every row at the same size, and boxed and ruled every group.

**Three ideas:** (1) a headline verdict, then one card per rental, outcome first, steps behind a tap. (2) One continuous vertical timeline of every event with a bigger axis. (3) A table of rentals (date, who, length, hardest knock, deposit back).
**Discarded:** (2) is the old page with a thicker line: still every event at the same level. (3) a table is rows divided by lines, cramped on a phone, and it still has no primary.

**Chosen, (1):** [before and after, 1440](rounds/65-record-1440.jpg), [phone](rounds/65-record-375.jpg), [a card opened, with focus ring](rounds/65-steps-open.jpg).

**Dividing without lines:** the ruled counters box, the lines between chapters and between rule rows are gone. Rentals are sand cards on --elev-1 with 16 px between them (more space between cards than inside them). The booking card is split by surface, not by a rule: white for price and button, sand for the rule; the rule's rows separate by padding, the "no drops" row sits on white. The only line left is the axis of the steps, which is content.

**States:** "Every step" is a pill with a chevron that turns, hover sand, pressed 97%, a visible focus ring; the steps fade in when opened (off with reduced motion). A rental in progress gets a blue ring.

**Test, "is it another screen at a glance?"** Yes: a big sentence and two cards where there were four boxed counters, a state line and two pages of identical rows.

## Round 66 · Renting: every step beside the same card

**Hierarchy audit (Rule step, before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Back link + 5-step progress | renter, all along | lost in the flow | kept, tertiary |
| H1 "The rule you accept." | renter | — | primary of the step |
| Lead (deposit, knock decides) | renter | the rule unexplained | secondary, shorter, ends with "Try it:" |
| "Test money" line under the lead | everyone | — | moved to the card, said once |
| "Rental price: 2 dollars an hour…" line | renter | the price disappears | moved to the card |
| The simulator (knock, money back, slider, table) | renter, to understand | the rule is abstract | secondary, the body of the step, on sand, no frame |
| Two bullet notes | the careful renter | small loss | tertiary |
| "Accept the rule and continue" + hint | renter, to decide | no way forward | the decision, in the card |

Wallet and Deposit each had a different layout (a half-page photo; a grey summary box with ruled lines), and the Deposit page said "confirm 0 times" to someone with no wallet.

**Levels after:** in the step column the H1 is primary and the step's own content (simulator, wallet choice, signatures) secondary. On the right a card that never changes shape: the bike, who lends it, the money, the step's action. **Squint test:** before, the Rule page was one grey column: H1, then a framed box, then the button at the bottom out of view. After, two masses: the H1 and simulator on the left, the white card with the blue button on the right; the button is in the first screen.

**References:** Stripe Checkout (what you pay on one side, the form on the other, the same summary at every step) and Airbnb's "Confirm and pay" (the listing card with photo, title and price stays on the right while the steps change on the left). Why ours looked cheaper: each step had its own composition, the money was repeated in different places, the action was below the fold.

**Three ideas:** (1) a checkout frame: the step on the left, a sticky "your rental" card on the right that holds the bike, the money and the step's action. (2) One question per screen, full screen, Typeform-style. (3) A vertical rail of the five steps on the left, the content on the right.
**Discarded:** (2) hides the bike and the money just when you commit them, and wastes the width on a desktop. (3) repeats the progress bar and eats the width a phone does not have.

**Chosen, (1):** [Rule, 1440](rounds/66-rule-1440.jpg), [Rule on a phone](rounds/66-rule-375.jpg), [Wallet, with focus on the option](rounds/66-wallet-1440.jpg). The card is white above (bike and the step's big figure, "You leave 50 dollars" on Deposit) and sand below (deposit, price, the test-money sentence), split by surface, not by a line. On a phone the card follows the step, so the button sits right after the simulator. The Deposit step now asks for a wallet first instead of counting zero signatures.

**Without lines:** the signatures are a stepper of sand tiles (the one being signed gets a blue ring, the done ones lift onto white); the rule table everywhere lost its ruled rows (rows separate by padding, the highlighted one by its tint); the wallet option is a white tile with a ring, not a bordered box.

**States:** wallet option hover lifts and rings in blue, pressed 98.5%, focus ring offset 3 px; the step's blocks enter in sequence, the card after them (off with reduced motion).

**Test, "another screen at a glance?"** Yes: a single grey column became a two-pane checkout, the same on all three steps.

## Round 67 · The ride is a live map; return, wait and outcome join the checkout frame

**Hierarchy audit (Ride step, before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| "Your rental · 22 min so far" with a pulse | renter, during the ride | no sense of "live" | kept, tertiary, on the status card |
| H1 "A medium knock so far: 20 dollars would be kept." (96 px, three lines) | renter | the point of the page | primary, set at 40 px so it sits on the map |
| Facts: Deposit / Hardest knock / Last update, in ruled cells | renter | deposit and knock are already in the H1 | merged into one line under the H1 with the meter |
| The rule table | renter who wonders "what if it gets worse" | they'd have to remember the rule | secondary, below the map, titled "The rule you accepted" |
| "Return the bike" | renter at the end | no way out | in the status card, full width |
| The map of the ride (440 px, right half, under the progress bar) | renter | the ride is invisible | the stage: full content width, 62 vh |

Return used a layout whose CSS was deleted in round 66 (the photo spilled over the page); Waiting and Outcome had their own compositions, and Outcome's three buttons were in a row under a table.

**Levels after:** the map is the stage, the status card on it is primary (H1, meter, one button), the rule below secondary. **Squint test:** before, the eye went to the 96 px H1 and then bounced between a map and a ruled table of the same weight. After, one picture (the map) with one white card on it; the blue button is the only colour in the card.

**References:** Lime's ride screen (the map is the screen, the trip status is a card over it, one big "End ride") and Flighty's live flight (the route on a map, the status in a panel laid over it). Why ours looked cheaper: the map was a thumbnail beside a text page, as if the ride were an attachment.

**Three ideas:** (1) the map as the whole stage with a status card over it. (2) A big live counter (time and money at stake) as the hero, the map below. (3) A split with the map pinned on the right and the status scrolling on the left.
**Discarded:** (2) a ticking counter for a deposit reads like a meter running, which is not how the rule works (only the hardest knock counts). (3) is what we had, with better spacing.

**Chosen, (1):** [Ride, 1440](rounds/67-ride-1440.jpg), [Ride on a phone](rounds/67-ride-375.jpg), [Return](rounds/67-return-1440.jpg), [Waiting](rounds/67-waiting-1440.jpg). The map keeps the route clear of the card (fitted with a 500 px left margin on a desktop). On a phone the map comes first and the card follows. Return, Waiting and Outcome now use round 66's frame with the trip card: Return's three steps are numbered tiles (the order is the content) and its two buttons are in the card; Outcome's card says "Back to you: 50 dollars" in large type with the receipt under it.

**Without lines:** the ride's ruled fact cells are gone; the Waiting panel is a sand tile; the return steps are tiles.

**Motion and depth:** the status card is a frosted panel on --elev-3 over the map (the map is on --elev-2); the pulse keeps beating only with motion allowed.

**Test, "another screen at a glance?"** Yes: a text page with a map thumbnail became a map with a card on it.

## Round 68 · The receipt leads with the money back; My rentals as trip tiles

**Hierarchy audit (Receipt, before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| "Receipt" at 72 px | — | the page still is one | demoted to a kicker with the bike and the owner |
| Bike, owner, date, times (11 px) | renter, later | small loss | tertiary, under the kicker |
| Rental price + its explanation (first line) | renter | the price | last of the summary lines |
| Deposit, hardest knock, kept | renter | the why | secondary, grouped on sand |
| "Deposit back to you: 30 dollars" (at the bottom) | renter, the one thing they came for | the receipt is pointless | primary: 72 px at the top |
| Note, proof, check, print | the careful renter, a judge | the proof | tertiary, at the end |

**My rentals, before:** a 120 px H1, the word "Past", and one ruled row with a 60 px thumbnail; the rental in progress was a bordered panel.

**Levels after:** Receipt: the amount back is primary, the split bar right under it (blue back, orange kept, proportional) is secondary and says the whole story without reading; the summary lines are tertiary on sand. My rentals: a ride in progress is a large card with its photo and one button (primary), past rentals are photo tiles with the amount back on the right (secondary).

**Squint test:** Receipt before: the eye went to "Receipt" and then wandered down a column of dashed rows; the 30 dollars were below the fold on a phone. After: the 30 dollars, then the blue and orange bar, then the sand block. My rentals before: a heading over nothing. After: the photo card, then the tiles.

**References:** Stripe's receipts (the amount in large type at the top, the summary in a quiet block below, the details at the end) and Airbnb Trips (each past trip a photo with the place and the dates under it, the upcoming one as a big card). Why ours looked cheaper: a list of equally weighted rows with dashed rules, and a title instead of a result.

**Three ideas:** (1) amount first, with a proportional bar of what came back and what was kept; trips as photo tiles. (2) The receipt as a torn paper slip with a stamp. (3) The receipt as a small timeline of the rental (deposit, knock, return, settled).
**Discarded:** (2) we had the torn edge already: decoration, not hierarchy. (3) repeats the bike page's record and pushes the amount down again.

**Chosen, (1):** [Receipt, 1440](rounds/68-receipt-1440.jpg), [Receipt on a phone](rounds/68-receipt-375.jpg), [My rentals with a ride in progress](rounds/68-rentals-1440.jpg), [My rentals on a phone](rounds/68-rentals-375.jpg). The bar grows from the left once on load (off with reduced motion). The top live bar hides on My rentals, where the in-progress card already says it.

**Without lines:** the 2 px ink rule, the dashed rows and the torn-edge mask are gone; the slip is white on top and sand below. The past-rentals list lost its ruled rows: tiles separate by a 24 px gap.

**States:** tiles lift 3 px with a shadow on hover, press at 99%, and show a focus ring offset 4 px.

**Test, "another screen at a glance?"** Yes, both: the receipt is a big number with a coloured bar; My rentals is a photo card and tiles.

## Round 69 · My bikes says what needs you first

**Hierarchy audit (before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| H1 "Your bikes." + "Add your bike" button on the right | owner | the page is still "your bikes" | the H1 now says what needs the owner ("One return to confirm." / "Nothing needs you right now."); "Your bikes" becomes a small label |
| Return to confirm (sand panel) | owner, when someone hands back | the deposit waits forever | primary when present: a white card with the photo and one button |
| Three equal KPIs in ruled cells (income, kept, bikes: 1) | owner, now and then | "Bikes: 1" repeats the grid | income and kept merged into one total ("Earned with Sharify: 21 dollars") with the two parts under it; the bike count goes, the "out with a renter" count becomes a sentence |
| "Your bikes" heading again | — | — | removed (it repeated the H1) |
| Bike card with a border, status as a word under the name | owner | can't reach the bike | tiles: photo first, the status as a pill on the photo (dark when busy) |
| "Add your bike" (button in the corner) | owner with a second bike | small loss | the last tile of the grid, where the next bike will go |

**Levels after:** primary = the H1 sentence and, when present, the return card. Secondary = the bike tiles and the earnings card. Tertiary = counts, notes, test money. **Squint test:** before, the eye split between the H1, the blue button in the corner and three same-size numbers. After, the sentence, then the return card with its blue button, then the tiles on the left and the white earnings card on the right.

**References:** Airbnb Hosting's "Today" (what needs you first, then your listings as photo tiles with a status pill on the photo) and Stripe's dashboard home (one large number, its parts small under it, in a card). Why ours looked cheaper: three numbers of the same size told the owner nothing first; the page title repeated the section title.

**Three ideas:** (1) a host "Today": the H1 is the to-do, then tiles and one earnings card. (2) One wide row per bike with its own earnings and status. (3) An account statement: a table of every rental and fee.
**Discarded:** (2) one row per bike is a ruled list again and hides the photo. (3) a statement belongs on a receipt page, not on the owner's home.

**Chosen, (1):** [My bikes, 1440, focus on the add tile](rounds/69-bikes-1440.jpg), [with a return to confirm](rounds/69-return-1440.jpg), [phone](rounds/69-bikes-375.jpg). On a phone the earnings card comes first, then the tiles.

**Without lines:** the ruled KPI strip is gone; the earnings card is white on top, sand below; tiles separate by space.

**States:** tiles lift on hover, press at 99%, focus ring offset 4 px; the add tile darkens its sand on hover.

**Test, "another screen at a glance?"** Yes: a title, a button and a row of numbers became a sentence, a card to act on, photo tiles and one total.

## Round 70 · A step back: three moments instead of three screens

**Hierarchy audit (Home below the finder, and the end of the bike page):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Home: three chapters, each a full-screen photo with a card rising over it, stacked like sheets (2,700 px) | first-time visitor | they wouldn't know how a rental goes | kept, cut to one band of three photo cards (about 800 px) |
| Bike page: "How it works", three sand cards of text with big numerals | renter on the bike page | same story as Home, in other words | merged: the same band, titled "How renting works", with the link to "How Sharify is designed" |
| Scroll-driven drift, rise and float on the chapters | — | nothing lost | replaced by one staggered entrance per card (off with reduced motion) |

**Levels after:** the band's title is secondary to the finder above it; each card is photo, then a 24 px title, then one sentence. **Squint test:** before, three screens of photo in a row: the eye stopped on each, the page felt endless. After, one row of three portraits read left to right like a comic strip.

**References:** Apple's product pages put "how it works" in a row of three captioned pictures that you read in one look; Airbnb's "How it works" for hosts does the same with three numbered images. Why ours looked cheaper here: it spent three full screens on three sentences.

**Three ideas (what to remove or merge):** (1) merge the Home chapters and the bike page's text steps into one three-card band used on both pages. (2) Remove the "What if it gets dropped?" simulator from Home, since the Rule step has it. (3) Show six bikes in the finder and hide the rest behind "Show all 10".
**Discarded:** (2) the simulator is Home's one interactive thing and the clearest proof of the rule for someone who isn't renting yet. (3) ten bikes are already a short list; hiding four adds a click and saves little.

**Chosen, (1):** [Home band, 1440](rounds/70-moments-1440.jpg), [phone, swipe](rounds/70-moments-375.jpg), [the same band on the bike page](rounds/70-bike-1440.jpg), [Home length before and after](rounds/70-home-length.jpg). Home went from 8,656 px to 6,655 px at 1440. One component instead of two; about 50 lines of CSS deleted (the stacked-sheet chapters, their three scroll animations, two generations of "How it works" styles with ruled cells).

**Test, "another screen at a glance?"** Yes for that part of the Home: three screens of photos became one row.

### Block 61 to 70 (summary)

- **Lines in `webapp/src`:** about 6,990, under the cap of 13,517 (+60% over 463f724).
- **New rules this block:** a written hierarchy audit before every idea; no grey lines to divide zones; nothing is final (the rotation starts again when every screen has had a round); care of motion, scroll, shadows and selection states every round.
- **Strongest changes:** (1) the bike page as a listing with a booking card (64) and its record as one headline and rental cards (65); (2) the rent flow as a checkout with one card that never changes (66) and the ride as a live map with a status card on it (67).
- **Lines removed as dividers:** the record counters, chapter rows, rule table rows, signature rows, receipt rows, owner KPIs, the past-rentals list: all now separate by space, surface or tint.
- **Step back:** round 70 (Home 2,000 px shorter, two "how it works" merged into one).

## Round 71 · Verify as one sheet: the second you picked, then the answer in place

**Hierarchy audit (before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Back link in monospace | — | — | normal type, like every other back link |
| H1 + a two-line lead | professor, curious renter | the purpose | kept; lead shortened to what you do and why |
| Batch line (batch, readings, anchored, custodian) | the careful | context | tertiary kicker on the card |
| Nine tall tombstone bars, the picked one ringed | everyone: "which second?" | can't pick | secondary: a quieter strip, the picked bar dark (orange if a knock), tooltips on hover and focus |
| Four facts in ruled monospace cells (when, peak, where, reading n of 9) | everyone | can't tell what's being checked | merged into one line: "Second 9 of 9 · 41.2 g · at 03:02:12, near…", with the peak at 60 px |
| "Is this reading on the chain?" panel with its own 56 px H2 | — | the H2 competed with the H1 | removed: the button says what it does |
| Result: 88 px ringed check, "Verified on-" / "chain" broken over two lines at 96 px | everyone | the answer | primary: in the same place as the button, check 64 px, title 44 px on one line |

**Levels after:** the result (or the button before it) is primary; the picked peak secondary; the strip, the batch line and the proof tertiary. **Squint test:** before, three things shouted at once (H1, the tombstones, the panel's H2). After, a white half with one big number and a sand half with one blue button; after the check, the sand turns blue with the check mark.

**References:** Apple Pay's sheet (what you're about to confirm on top, one action, the answer replaces the action in place) and Stripe's payment success page (a large check, one line of result, the details below in a quiet block). Why ours looked cheaper: a page of parts of equal weight; the result arrived in a different box from the action.

**Three ideas:** (1) one card: the reading on the white half, the action on the sand half that becomes the answer. (2) A two-step wizard (pick, then check) on separate screens. (3) The bars full width as a seismograph across the page, the result as a banner under it.
**Discarded:** (2) splits a five-second action into two pages. (3) a banner under a full-width chart pushes the answer below the fold on a laptop.

**Chosen, (1):** [before and after](rounds/71-verify-1440.jpg), [after the check](rounds/71-verified-1440.jpg), [phone, after the check](rounds/71-verify-375.jpg). The proof values sit on sand, label and value per row, no ruled lines.

**Motion and states:** bars press to 96%, hover and focus show a tooltip with the value and time and a focus ring; the check pops in with a slight overshoot and the sentence follows (off with reduced motion); the sand panel fades to blue on success.

**Test, "another screen at a glance?"** Yes: two columns of parts became one card with an answer in it.

## Round 72 · "How Sharify is designed" reads like a document, with contents that follow you

**Hierarchy audit (before, 6,440 px):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| H1 + lead | professors | the purpose | kept |
| Photo of the recorder, 21:9 | everyone | the object is abstract | kept, inside "In one minute" |
| In one minute (3 points) | everyone, first | the gist is lost | secondary, first section |
| The scheme: 7 stages, stage box + cheat box, ruled rows, mono labels | professors, the core | the design is unexplained | primary: paired cards, white "what happens" beside sand "could cheat / why it fails" |
| Limits we state ourselves (9) | professors, the honest part | trust drops | kept open, in "Questions and limits" |
| Design choices (2), Why not a database (4), Objections (3) | the professor who asks | small loss each | merged with the limits into one section of questions you open |
| Do we need a blockchain? (ruled table) + verdict | professors | the "why blockchain" proof | secondary: five answer tiles, Yes in blue, No in black, the verdict large |
| The numbers (4, at the very end) | professors | concreteness | moved up to second, as one sand band |

Every section had the same layout (title left, content right) and the same weight; nothing told the eye what mattered.

**Levels after:** primary = the scheme; secondary = in one minute, the numbers, the test's verdict; tertiary = the folded questions. **Squint test:** before, a long even grey column with seven identical boxes. After, a dark marker in the contents shows where you are, the scheme reads as seven white-and-sand pairs, the end is a stack of closed rows.

**References:** Stripe's documentation (contents on the left that track the section you're reading, one column of text) and the Linear Method pages (one reading column, generous headings, details folded). Why ours looked cheaper: no way to see the shape of the document, and everything open at once at the same size.

**Three ideas:** (1) a reading layout with sticky contents and scroll-spy, the numbers up, the minor sections folded. (2) One full screen per section, like slides, for projecting. (3) Tabs: Scheme / Test / Questions.
**Discarded:** (2) slides fight the browser's scroll and hide how long the document is. (3) tabs hide the scheme behind a click, and a projector audience can't see which tab is which.

**Chosen, (1):** [the length, before and after](rounds/72-design-length.jpg), [the scheme with the contents](rounds/72-design-scheme.jpg), [questions, one with focus](rounds/72-design-questions.jpg), [phone](rounds/72-design-375.jpg). 6,440 px became 5,520 px with nothing deleted. On a phone the contents become a row of pills under the lead.

**Without lines:** ruled tables, ruled stages, ruled lists and the column header line are gone; groups separate by surface (white, sand) and space.

**States:** contents items: hover sand, current dark pill, focus ring; folded rows: hover darker sand, chevron turns, the content fades in (off with reduced motion); clicking a contents item scrolls smoothly (instantly with reduced motion).

**Test, "another screen at a glance?"** Yes: a long even column became a document with a map of itself.

## Round 73 · The footer: where you can go, grouped by what you came to do

**Hierarchy audit (before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| A white band with only "Demo · sample data" in it (Home, 190 px) | the presenter | the switcher is also floating at the corner on every other page | removed: Home uses the corner switcher like the rest |
| The wordmark at 320 px, its "y" running into the links | — | brand moment | kept, smaller share: it is the last thing, cut by the page's bottom edge |
| The honest note | everyone | the demo looks like a real service | secondary, first thing in the footer |
| Two links (Rent out your bike, How Sharify is designed) | someone at the end of a page | no way on | secondary: three groups, Ride / Lend / Check, with Verify and the demo bike added and your own pages when connected |
| Footer only on Home, the bike page and Design | — | — | now on My rentals, receipts, the owner's pages and Verify too (the rent steps keep their checkout focus) |

**Levels after:** note and link groups are the footer's content (secondary to the page); the wordmark is a quiet sign-off. **Squint test:** before, a white void, then a giant blue word with small text crashing into it. After, one darker sand step under the page, three columns of links, the blue word cut by the edge.

**References:** Linear's footer (columns of links under short group names, the small print on the left) and Stripe's (grouped by what you came to do). Why ours looked cheaper: the footer was a logo with two links; the demo control sat alone in a white band.

**Three ideas:** (1) a grouped sitemap with the note, the wordmark as a cropped sign-off. (2) A last call to action ("Find a bike near you") as the footer. (3) Remove the footer and end each page on its content.
**Discarded:** (2) Home already ends with the owners' call to action; another one is a sales page. (3) pages like the receipt and Verify had no way on but the header.

**Chosen, (1):** [Home, 1440, focus on a link](rounds/73-footer-1440.jpg), [phone](rounds/73-footer-375.jpg). The footer is one step darker than the sand above it (--raise), so the two sands don't merge.

**Test, "another screen at a glance?"** Yes: a giant logo with two links became a footer you can navigate.

## Round 74 · Adding a bike: every step beside the listing it builds

**Hierarchy audit (before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Steps 1–3 in a narrow centred column, steps 4–5 suddenly wide with a preview | owner | — | one frame for all five: the step on the left, the preview on the right from the first step |
| The preview (photo, name, type, price, deposit) | owner: "what will renters see?" | they'd publish blind | secondary, always in view; now also lists what's done and what's missing (recorder paired, name and spot) with ticks |
| Choice tiles "Yes, I have one" / "No, not yet" with borders, the second dashed | owner | can't start | white tile with a ring on hover for the live choice; the unavailable one is flat sand, not a dashed box |
| The knock levels as a ruled table | owner | can't set the rule | rows as sand strips, no ruled lines |
| The footer under each step | — | a setup flow doesn't need the sitemap | removed inside the flow |

**Levels after:** the step's question (H1) is primary, its one control secondary, the preview card the steady secondary on the right; notes tertiary. **Squint test:** before, the first three steps looked like a different site from the last two. After, the same two masses on every step, and the preview's ticks turn blue as you go.

**References:** Airbnb's host onboarding (a question on the left, the listing taking shape on the right) and Stripe's account setup (a checklist of what's done and what's left beside each step). Why ours looked cheaper: the layout changed under the owner's feet halfway through, and nothing showed progress except a thin bar.

**Three ideas:** (1) one frame with the live preview and a done/missing checklist on every step. (2) All steps on one long page with sections that unlock in order. (3) A modal wizard over My bikes.
**Discarded:** (2) the mount step needs the owner to go to the bike and come back; one long page loses their place. (3) a modal on a phone is a full screen anyway, and it hides the page they'd return to.

**Chosen, (1):** [step 1, focus on the choice](rounds/74-add-1-1440.jpg), [step 2](rounds/74-add-2-1440.jpg), [step 5, the rules](rounds/74-add-5-1440.jpg), [step 1 on a phone](rounds/74-add-1-375.jpg). On a phone the preview follows the step, so the question and its choices come first.

**States:** the live choice lifts and rings blue on hover, presses to 98.5%, focus ring offset 3 px; checklist ticks fill blue when done.

**Test, "another screen at a glance?"** Yes for steps 1–3 (a centred column became a two-pane builder); steps 4–5 keep their frame with the new checklist and borderless rows.

## Round 75 · A step back: calmer titles on the screens you work in, and the leftovers of ten rebuilds removed

**Hierarchy audit (the app screens: rent steps, My rentals, receipt, My bikes, Add, Verify):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| The page title at 80 px (same as the marketing pages) | user in the middle of a task | they'd still know where they are from the header and the progress | kept, at 52 px: on a working screen the content (the card, the map, the form) is the primary, the title is a label |
| CSS for components rebuilt in rounds 64–74 (old bike hero, rule card, ride hero, past-rows, owner rows, KPI strip, record box, old footer, top bar) | nobody: no component uses those classes any more | nothing | removed |

**Levels after:** on working screens the card or the tool is primary, the title secondary. Marketing pages (Home, the bike's listing, Design) keep the big type: there the words are the content. **Squint test:** before, "Your rentals." outweighed the card with the ride in progress; after, the eye lands on the photo card.

**References:** Airbnb's Trips and Stripe's Dashboard: page titles on working screens are half the size of the marketing headlines; the size goes to the data.

**Three ideas (what to remove):** (1) one smaller title size for working screens, plus a sweep of dead CSS. (2) Remove the floating "Demo · sample data" pill from pages with a footer and put the switch in the footer. (3) Remove the "live rental" strip under the header, since My rentals and the ride page say it.
**Discarded:** (2) the presenter needs the switch on any screen without scrolling to the bottom. (3) the strip is the only thing that tells a renter on another page that their ride is still running.

**Chosen, (1):** [My rentals](rounds/75-rentals.jpg), [the Rule step](rounds/75-rule.jpg), [My bikes](rounds/75-bikes.jpg). About 120 lines of CSS deleted across six files (selectors for classes no component renders); no screen changed except the titles. Overflow checked at 375 px on six pages: none.

**Test, "another screen at a glance?"** No, and it shouldn't be: a step back takes away. What changes at a glance is which thing you look at first.

## Round 76 · Confirming a return shows the split before you press

**Hierarchy audit (before):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| A 4:3 photo of a hand-back at the top (360 px) | — | mood | removed: it pushed the question and the button below the fold; the bike's own photo is in the card |
| H1 "Do you have the demo bike back?" | owner | — | primary |
| Lead: who, when, "you don't decide the fee" | owner | the trust argument | kept |
| Four facts in ruled cells (rental, hardest knock, to you, price) | owner | the numbers | split: the money becomes a bar ("45 back to Alice", "5 to you") on sand, secondary; the rest goes into the card |
| The rule table | owner who wonders why | the reason for the fee | tertiary, the current level tinted |
| "Confirm it's back" at the bottom of the column | owner | can't confirm | in the card on the right, in the first screen |

**Levels after:** the question and the button are primary, the split bar secondary, the rule tertiary. **Squint test:** before, a big photo, then a title, the button out of sight. After, the title on the left, the blue button in the white card on the right, the blue and orange bar between.

**References:** the renter's own steps (round 66, after Stripe Checkout and Airbnb's "Confirm and pay"), and the receipt's split bar (round 68): the owner now sees the same picture of the money the renter will see on the receipt. Why ours looked cheaper: the owner's most important click was below a decorative photo.

**Three ideas:** (1) the checkout frame with the split bar previewing the outcome. (2) A dialog over My bikes with yes and no. (3) Two big buttons, "Yes, it's here" and "Not yet".
**Discarded:** (2) the owner may arrive from a notification link, with no My bikes page behind. (3) "Not yet" does nothing on-chain; a button that does nothing is noise.

**Chosen, (1):** [before and after, 1440, focus on the button](rounds/76-confirm-1440.jpg), [phone](rounds/76-confirm-375.jpg). Also for every rule table on a phone: one row per level, the amount set right, instead of the amount wrapping onto two lines.

**Test, "another screen at a glance?"** Yes: a photo page with a form under it became a decision with its consequence drawn.

## Round 77 · The header again: your wallet is a chip, "Find a bike" stays the one blue button

**Hierarchy audit (header, connected):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| The wallet address as the filled blue button | — | the address is not an action; the blue said "press me" on something that did nothing | a quiet chip with a colour face from the address; it opens your pages |
| "Find a bike" | renter | the main action disappeared once connected | back as the only filled button, connected or not |
| "My rentals" in the centre nav, "My bikes" as a text link | the connected user | — | moved into the chip's menu ("Your rentals", "Your bikes", "Rent out a bike"), so the centre is the same for everyone |
| Active section as a black pill | — | it was the darkest thing in the bar, darker than the action | a sand pill: you see where you are without it shouting |
| Phone menu: big words over ruled lines, half the screen empty | phone user | — | no lines; a photo card to the map and the test-network note fill the bottom |

**Levels after:** "Find a bike" primary; the chip and the sections secondary. **Squint test:** before, two dark shapes (the black pill, the blue address) competed; after, one blue button at the end of a quiet bar.

**References:** Airbnb's profile menu (a round face plus menu, never a primary button), Linear's header (one filled action; the account lives in a menu). Why ours looked cheaper: our loudest element was a hex string.

**Three ideas:** (1) the wallet as a chip with a menu; "Find a bike" stays primary; quieter active state; a fuller phone menu. (2) A header that turns into the step bar during renting. (3) A header that hides when you scroll down.
**Discarded:** (2) the rent steps already have their progress right under the header; two progress bars. (3) the header carries the live-rental strip and the main action; hiding it hides both.

**Chosen, (1):** [header connected, with the menu open](rounds/77-header-1440.jpg), [phone menu, before and after](rounds/77-menu-375.jpg). The chip menu closes on Escape or a click outside, marks the page you're on, and opens with a short drop (off with reduced motion).

**Test, "another screen at a glance?"** For the bar, yes when connected: the blue moved from your address to the action.

## Round 78 · The Home's first screen: one action, and the real bike as a card

**Hierarchy audit (first screen of the Home):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| H1 "Borrow a bike from someone nearby." | first-time visitor | the promise | primary |
| Sub: "If it gets dropped, a public rule decides…" | visitor | the difference from any rental | secondary |
| "Find a bike near you" (blue) | renter | the way in | the action, the only filled one on the first screen |
| "Rent out your bike" (outline) beside it | owners, a minority | they'd use the header or the owners' band below | removed from the hero; it is in the header and has its own band on the Home |
| "Find a bike" in the header at the same time | — | a second blue button saying the same | hidden on the Home's first screen; it fades in as the hero scrolls away (380–560 px) |
| "The demo bike is free now, 2 min walk" as a line of text with a dot | renter | the proof the map is real | a card: photo, "Free now, 2 min walk", name, price, a chevron; it opens the bike |

**Levels after:** H1 primary, then the blue button, then the bike card. **Squint test:** before, two buttons of equal width and a blue header button pulled the eye three ways; after, one blue button and, under it, a photo of a real bike.

**References:** Lime's app home (the nearest vehicle as a card with distance and price, one big action) and Airbnb's home (the header's main action stays out of the way while the page's own search is in view). Why ours looked cheaper: the most concrete thing we have (a real bike two minutes away) was a line of small text.

**Three ideas:** (1) one action plus the nearest real bike as a card; the header's button arrives on scroll. (2) A search pill in the hero (where, when, budget) like Airbnb's. (3) Full-bleed photo with the title set over it.
**Discarded:** (2) we have one place and ten bikes: a search form would promise choices we don't have. (3) white type over this photo needs a dark scrim that kills the warm light that sells it.

**Chosen, (1):** [1440, focus on the bike card](rounds/78-hero-1440.jpg), [the header's button half-way in, mid-scroll](rounds/78-hero-scroll-frame.jpg), [phone](rounds/78-hero-375.jpg). The fade is scroll-driven and only with motion allowed; with reduced motion, or on browsers without scroll timelines, the header button simply stays. On a phone the card drops "from Bocconi" and the deposit so it stays on three lines.

**States:** the bike card darkens and lifts on hover, its chevron moves 3 px, presses to 99%, focus ring offset 3 px.

**Test, "another screen at a glance?"** Yes: two equal buttons and a text line became one button and a bike.

## Round 79 · The finder again: the one real bike leads, the samples follow under their own name

**Hierarchy audit (the finder's list):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Ten cards of the same size, the real one first | renter | — | the real bike is the only one you can rent: it gets the full width, a larger name and a full-size Rent button |
| "Live · on-chain" vs "Sample fleet" badges on each photo | everyone | honesty | kept; plus one sentence where the samples start: "Sample fleet. How the map will look with more owners. These bikes have no recorder and can't be rented." |
| Record line under each card: "Dropped once in 2 rentals, last a medium knock 1 h ago" (two lines) | renter | the record | shortened to "Dropped once in 2 rentals, last 1 h ago"; the meter shows the level, the word stays for screen readers |
| Sample names at 19 px like the real one | — | — | 16 px |

**Levels after:** the real bike primary, the nine samples secondary, the map the steady companion. **Squint test:** before, a uniform wall of ten photos; after, one wide card with a blue button, then a sentence, then a smaller grid.

**References:** Airbnb's search puts a featured stay ("Guest favourite") at a larger size in the same grid; Apple's store lists the product you can buy now first and the rest under a heading. Why ours looked cheaper: a demo where only one item works, presented as if all ten were equal.

**Three ideas:** (1) the real bike full width, the samples under their own sentence. (2) Hide the samples by default behind "Show the sample fleet". (3) Grey out the samples.
**Discarded:** (2) the map would look empty and the finder would stop showing what it's for. (3) grey photos look broken, not "sample".

**Chosen, (1):** [before and after, 1440, focus on Rent](rounds/79-finder-1440.jpg), [1024](rounds/79-finder-1024.jpg). From 1024 px up; on a phone the carousel keeps one size per card (the real one is first).

**Test, "another screen at a glance?"** Yes for the list: a uniform grid became one bike and a sample grid.

## Round 80 · A step back: the owners' band says what an owner does, not what they might earn

**Hierarchy audit (the owners' band on the Home):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| H1 "Your bike sits still most of the week." + one sentence | owners | the invitation | kept, primary |
| "What could your bike earn?": two sliders and "≈ 87 dollars a month", in a bordered sand card inside the white card | owners | nothing true is lost: the 10 hours a week was our guess, and a monthly figure reads as a promise | removed |
| (missing) what an owner actually has to do | owners deciding | — | added: three numbered steps (fix the recorder, set price and rule, confirm returns), the order is the content |
| "Rent out your bike" | owners | the way in | kept, now directly under the steps |

Also removed: the estimator's styles in map.css, which matched the earnings card on My bikes by class name and gave it uneven gaps (a cause of the white stripes fixed by hand in round 69).

**Levels after:** title, then the three steps, then the button. **Squint test:** before, the eye went to "≈ 87 dollars", the biggest number on the Home; after, to the title and down the three dark numerals to the button.

**References:** Airbnb's "Airbnb it" page leads with an estimate but backs it with real nearby data; we have none, so we follow Stripe's onboarding pages instead: what you'll do, in three steps, then one button.

**Three ideas (what to remove):** (1) the estimator, replaced by the three steps. (2) The whole owners' band (owners have the header link). (3) The photo of the shop owner.
**Discarded:** (2) the Home would never tell a visitor that they can lend their own bike, which is half of the product. (3) it's the only picture of an owner on the site.

**Chosen, (1):** [1440](rounds/80-owners-1440.jpg), [phone](rounds/80-owners-375.jpg). No card inside a card any more.

**Test, "another screen at a glance?"** Not meant to be; what you see first is no longer a number we made up.

### Block 71 to 80 (summary)

- **Lines in `webapp/src`:** about 7,080, under the cap of 13,517.
- **Strongest changes:** (1) Verify as one sheet whose action turns into the answer (71) and the Design page as a document with contents that follow you (72); (2) the owner's side as a "Today" dashboard (69, in the last block) carried through to Confirm a return with the split drawn before the click (76), and the Add flow beside a preview that ticks as you go (74).
- **Second passes (nothing is final):** the header (77: the wallet is a chip, the blue goes back to the action), the Home's first screen (78: one action, the real bike as a card), the finder (79: the real bike leads, the samples under their own name).
- **Steps back:** round 75 (calmer titles on working screens, about 120 lines of dead CSS removed) and round 80 (the earnings estimate removed, stray styles that leaked into My bikes removed).
- **Next in the rotation:** the try-the-rule section on the Home, the bike page's booking card on a phone, the phone map's crowded pins, empty and error states.

## Round 81 · The phone map gets the room: compact cards when the sheet is low

**Hierarchy audit (finder on a phone, sheet low):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Title + chips over the map | renter | can't filter | kept |
| The map: about 226 px tall between the chips and the sheet; ten price pins stacked on each other | renter: "where are they?" | the point of a map | primary: now about 420 px; the fit keeps the pins clear of the chips and the sheet |
| The sheet at 372 px with a big photo card (photo, name, distance, price, record) | renter browsing | — | low sheet = compact cards (square photo, name, distance, price, Rent); the record line waits for the pulled-up sheet |
| Pulled-up sheet | renter comparing | — | unchanged: full cards with the record |

**Levels after:** with the sheet low, the map leads and the card names the selected bike; pulled up, the cards lead. **Squint test:** before, a blob of overlapping white pills; after, ten separate prices with the blue one in the middle.

**References:** Airbnb on a phone with the map open (small horizontal cards along the bottom, the map is the screen) and Lime (one compact vehicle card over a big map). Why ours looked cheaper: the bottom half of the screen repeated what the pins should have said, and the pins couldn't say it.

**Three ideas:** (1) compact cards in the low sheet. (2) Cluster overlapping pins into "+3" bubbles. (3) Fit the map to the five nearest bikes only.
**Discarded:** (2) ten bikes don't need clustering once the map has room; clusters add a tap. (3) hides half the fleet from a first look.

**Chosen, (1):** [before and after, sheet low](rounds/81-map-375.jpg), [sheet pulled up](rounds/81-map-375-full.jpg). The selected compact card gets an ink ring. (In these headless shots the map tiles are blank: OpenStreetMap throttled our many screenshot requests; the tiles load in the browser.)

**Test, "another screen at a glance?"** Yes on a phone: a stack of pins over a big card became a map with a slim row of cards.

## Round 82 · The rule in everyday words first, the money as the answer

**Hierarchy audit (the simulator, on the Home and on the Rule step):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| "26.7 g" at 96 px in orange | — | a renter doesn't think in g | demoted to one line under the slider: "Hardest knock 26.7 g, a light knock" |
| "45 dollars" at 68 px | renter: "what do I get back?" | the point | primary, in its own sand block, with the split bar under it (blue back, orange kept), the same bar as the receipt and Confirm a return |
| The slider with g labels above and example chips hanging under it, "riding" spilling out of the card | renter | — | the examples become the first control, a row of chips above the slider ("What happened on the ride?"); the pressed one is dark; the slider stays for fine control with plain ticks |
| The rule table | renter who wants the whole rule | the rule | tertiary, below |

**Levels after:** what happened (chips) → what you get back (big number + bar) → the full rule. **Squint test:** before, two giant numbers fought (orange g, black dollars); after, the eye reads the chips, then one black number with a coloured bar.

**References:** Wise's fee calculator (pick what you're sending, the answer in one large figure with the breakdown under it) and Apple's trade-in estimator (choose the condition in words, see the value). Why ours looked cheaper: it led with a physics unit.

**Three ideas:** (1) everyday examples first, money as the answer with the split bar. (2) Four illustrated scenes (a pothole, a fall…) as cards. (3) Keep the layout, only shrink the g.
**Discarded:** (2) four drawings in one family would be new illustration work for one widget, and photos of falls don't exist honestly. (3) a smaller g still leads with the wrong thing.

**Chosen, (1):** [Home, "falls over" pressed and focused](rounds/82-rule-home-1440.jpg), [Home on a phone](rounds/82-rule-home-375.jpg), [the same simulator on the Rule step](rounds/82-rule-step-1440.jpg). On the Home the title column stays in view while you play. The bar's parts slide when the amount changes (instantly with reduced motion).

**Test, "another screen at a glance?"** Yes: a giant orange number became a row of choices and a bar of money.

## Round 83 · Empty, loading and error states with a way on

**Hierarchy audit (states):**

| State | Before | Verdict |
|---|---|---|
| Loading the bike | a two-column skeleton shaped like the bike page before round 64 | a skeleton in the listing's shape: kicker, title, the three-picture mosaic, the record and the booking card |
| Chain not answering | a centred 80 px title and a sentence, no action, no sign that it keeps trying | a card: a pulsing orange dot (it keeps asking), the title, what still holds, "Try again now" and "Why we don't show a copy" |
| No such bike | the same centred text, "object 99" | "There is no bike number 99 here.", with "See the bikes on the map" and "Open the demo bike" |
| Verify with the relayer offline | a grey note in a bordered box, then an empty page | a card: what's missing, what still comes from the chain, "Try again" and "Back to the bike" |

**Levels:** in every state the title says what happened (primary), one sentence says what still works (secondary), and there is always a blue way on. **Squint test:** before, a lonely heading in white space; after, one card with a coloured dot and a blue button.

**References:** Stripe's error pages and Linear's empty states: one card, one sentence of cause, one primary way out, never a dead end. Why ours looked cheaper: the states were afterthoughts with no action, and the skeleton promised a layout the page no longer had.

**Three ideas:** (1) one state card for every failure, with actions, and a skeleton in the real shape. (2) A full-page illustration per state. (3) Toasts over the last good page.
**Discarded:** (2) illustrations in one family would be a new asset set for four rare screens. (3) showing a stale copy is exactly what this product refuses to do.

**Chosen, (1):** [the four states, before and after](rounds/83-states.jpg): chain down, no such bike, relayer offline on Verify, loading. "Try again" refetches at once; the dot's pulse stops with reduced motion.

**Test, "another screen at a glance?"** Yes: a heading in the void became a card you can act on.

## Round 84 · The bike page on a phone: price and button first, the rule folds

**Hierarchy audit (bike page, 375 px):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Title + swipeable pictures | renter | — | kept |
| Booking card: price, deposit, Rent | renter | — | primary |
| The rule table inside the booking card (5 rows) between Rent and the record | renter who wants the detail | the Rule step shows it in full before any money moves | folded under "If it's dropped, this rule decides…" on phones; open on desktops |
| The record (headline, pills, rental cards) | renter | — | secondary; now reached one screen sooner |
| Bottom bar: "The demo bike / Available · deposit 50 dollars" in mono | renter scrolling | — | price first, like the card: "2 dollars an hour / 50 dollars deposit, back by the rule" |
| "See the proof" beside a three-line sentence | — | — | stacked on phones |

**Levels after:** price and Rent primary, the record secondary, the rule and the proof tertiary. **Squint test:** before, the first screen and a half was the card and its table; after, the card ends at its button and the record's headline arrives right after.

**References:** Airbnb's room page on a phone (the price bar at the bottom says the price, not the status; house rules fold into a row you open) and Apple's buy pages (the details fold, the price stays). Why ours looked cheaper: the phone got the desktop's full card, rule and all.

**Three ideas:** (1) fold the rule on phones and make the bar say the price. (2) Move the whole booking card into the bottom bar as a sheet. (3) Put the record before the booking card on phones.
**Discarded:** (2) a sheet that opens over the page hides the record a renter wants to check. (3) the record first buries the button; the bottom bar alone is too small to be the first action.

**Chosen, (1):** [phone before](rounds/84-bike-phone-before.jpg), [phone after](rounds/84-bike-phone-after.jpg) (three scroll positions each). The fold has a turning chevron and a focus ring; on desktops it is open and not clickable.

**Test, "another screen at a glance?"** Partly: the first screen is the same; the second is now the record instead of a table.

## Round 85 · A step back: no text under 13 px, fewer sizes

**Hierarchy audit (type across the site):** 22 different font sizes were in use. Ten of them sat below 13 px (10, 11 and 12 px: 39 places: transaction labels, tags, step numbers, tick labels, the "paid separately" chips, receipt sub-lines). Tertiary text should be quieter by colour and weight, not by being unreadable; at 11 px on a projector or a phone in the sun it simply disappears. Neighbouring sizes (21 and 22, 30 and 32, 34 and 36) were differences nobody can see but that make the scale look accidental.

**Levels after:** 13 px is the floor for everything (tertiary is 13 px in --fog); the scale is now 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 22 · 24 · 26 · 28 · 32 · 36 · 40 · 44, plus the fluid headings. **Squint test:** not the point of a step back; what changes is that the small print on the receipt, the proof rows and the signatures can be read.

**References:** Apple's Human Interface Guidelines put the smallest text style at 11 pt on a phone only for captions and recommend larger for body; Stripe's dashboard never goes below 13 px for content. Why ours looked cheaper: tiny grey labels read as fine print you're not meant to read.

**Three ideas (what to remove):** (1) every size below 13 px, plus the near-duplicate sizes. (2) Collapse the scale to six steps. (3) Remove the monospace face from the values that remain in it (dates, hashes).
**Discarded:** (2) would touch every component at once and change line breaks site-wide in one go; this round removes only what is clearly wrong. (3) hashes and contract addresses are the one place where a fixed-width face helps reading.

**Chosen, (1):** 48 declarations changed in eight files; overflow checked at 375 px on eight pages (none). [The receipt's proof, where most of the smallest text was](rounds/85-smallest-text.jpg).

**Test, "another screen at a glance?"** No: a step back. You can read the small print now.

## Round 86 · The deposit's button sits under the amount it pays

**Hierarchy audit (Deposit step, a motion round):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| "You leave 50 dollars" in the card | renter | — | primary, with the action now right under it |
| "Leave 50 dollars" under the four signature tiles, on the left | renter | — | moved into the card (as on the Rule and Return steps: every step's action is in the card) |
| "Working…" on a pale disabled button while signing | renter, during the 10 seconds it takes | no sign of what to do | "Confirm in your wallet…" with a spinner, on a ringed light-blue button, while the tile being signed glows blue on the left |
| Success: the same tiles all ticked and a small "Go to your rental" | renter | — | the card turns into the moment: a check pops in, "Unlocked · 50 dollars held by the rule", one big "Go to your rental"; each tile's dot pops as its signature lands |

**Levels after:** the card's amount and button primary throughout; the tiles are the live log (secondary). **Squint test:** before, the eye split between the amount on the right and the button on the left; after, both are in one white card.

**Frames:** [idle, signing (mid-flow), done, before](rounds/86-deposit-before.jpg) and [after](rounds/86-deposit-after.jpg); [phone](rounds/86-deposit-375.jpg).

**References:** Stripe Checkout (the Pay button sits under the total, and becomes a spinner, then a check, in place) and Apple Pay (the sheet shows "Confirm with side button" while it waits, then "Done"). Why ours looked cheaper: the total and the button lived in two different places and the waiting state said "Working…".

**Three ideas:** (1) the action in the card under the amount, a waiting state that says what to do, a success card. (2) A full-screen "Unlocked" celebration. (3) Collapse the four signatures into one progress bar.
**Discarded:** (2) the next thing the renter needs is the ride page; a celebration screen is one more tap. (3) each signature is a real prompt in the wallet: the renter needs to see which one they're on.

**Test, "another screen at a glance?"** For the moment of paying, yes: the button moved to the money, and success has its own card.

## Round 87 · One behaviour for each kind of state: selection, links, secondary buttons, "you are here"

**Hierarchy audit (interaction states across the site):** keyboard focus already shows a ring on every interactive element on the Home (checked by tabbing through 40 of them; the only miss is the header's button while it is hidden on the first screen). What was inconsistent:

| State | Before | After |
|---|---|---|
| Text selection | the browser's default blue | the brand blue at 22% under the ink, readable on white and sand |
| "You are here" | dark pill in the Design contents, sand pill in the header, sand with an ink edge in the account menu | sand with an ink edge everywhere |
| Secondary buttons | a grey border that turned blue on hover with blue text (looked like a link) | a hairline that turns ink on hover over sand; the text stays ink |
| Text links | no underline until hover, then a hard one | the underline fades in at 4 px offset |
| Disabled buttons | dimmed but still lifting on hover | flat, no lift, no press |

**References:** Linear (one selected-state treatment reused across sidebar, menus and tabs) and Stripe (secondary buttons are neutral, links are the only blue text). Why ours looked cheaper: four ways to say "selected" and blue text that might or might not be clickable.

**Three ideas:** (1) one treatment per state, applied site-wide. (2) A visible "keyboard mode" with large focus rings. (3) Remove secondary buttons in favour of links.
**Discarded:** (2) the rings are already visible and sized; louder ones would fight the one primary per screen. (3) "Back to your rental" and "Print" are actions, not navigation; links would mislead.

**Chosen, (1):** [selection](rounds/87-selection.jpg), [the Design contents with the new "you are here"](rounds/87-selection-toc.jpg), [secondary button on Return](rounds/87-secondary.jpg).

**Test, "another screen at a glance?"** No: a care round. The difference shows when you interact.

## Round 88 · Moving between pages: the new page starts at its top and arrives with a cross-fade

**Hierarchy audit (what happens between two pages):**

| Moment | Before | After |
|---|---|---|
| Clicking a footer link at the bottom of the Home | the next page opened at the same scroll position: "How Sharify is designed" appeared at y = 4,681, its end | every new page starts at its top (the finder link still scrolls to the finder) |
| The swap | an instant cut: header, page and all | the page cross-fades (out 180 ms, in 320 ms with a 10 px rise); the header is its own layer and stays still |
| Reduced motion | — | no animation at all, an instant swap |

**References:** Apple's and Linear's sites (page changes under a header that doesn't move; short, decelerating fades), and the browser's own View Transitions API. Why ours looked cheaper: a jump cut, and sometimes the wrong part of the next page.

**Three ideas:** (1) scroll to the top on a page change and cross-fade the content under a still header. (2) Shared-element transitions (the bike's photo flies from the card to the listing). (3) A progress bar at the top while the next page's data loads.
**Discarded:** (2) the finder card and the listing crop the photo differently; a flying photo that changes its crop looks broken, and it needs per-element names on every card. (3) the mock answers in under half a second; a bar would flash.

**Chosen, (1):** [a frame mid-transition and the settled page](rounds/88-transition.jpg). Within the same page (steps of the rent flow that only change the hash's second part) there is no fade, only the scroll to the top.

**Test, "another screen at a glance?"** No: a motion round. The difference is that nothing jumps.

## Round 89 · Empty and signed-out screens invite instead of apologise

**Hierarchy audit:**

| Screen | Before | After |
|---|---|---|
| My bikes with no bikes | H1 "Nothing needs you right now." over a bordered box "Rent out your first bike": the title contradicted the page | H1 "Your first bike, in three steps."; a card with the shop-owner photo and the three steps (recorder, price and rule, confirm returns) beside one button |
| My rentals without a wallet | a title, one sentence, one button, then white | the same photo card: why a wallet ("Sharify keeps no account of its own"), "Connect wallet" and, for someone with no rentals yet, "Find a bike" |
| My bikes without a wallet | the same thin text | the same card, "Connect wallet" and "Add a bike" |

**Levels after:** the title says what to do; the card's button does it; the photo says who it's for. **Squint test:** before, a heading and a button lost in white; after, one wide card, half photo, half action.

**References:** Airbnb's empty "Trips" ("No trips booked… yet", a photo and one button to start searching) and Linear's empty states (one sentence of why, one action). Why ours looked cheaper: empty screens read like errors.

**Three ideas:** (1) one invitation card (photo + why + action) for every empty or signed-out screen. (2) Redirect signed-out users to the wallet step. (3) Show the demo's sample data to signed-out visitors.
**Discarded:** (2) a link to "My rentals" that silently jumps elsewhere is disorienting. (3) showing someone else's rentals as if they were yours is false.

**Chosen, (1):** [My bikes, empty](rounds/89-owner-empty.jpg), [My rentals, signed out](rounds/89-rentals-signed-out.jpg), [My bikes, signed out](rounds/89-bikes-signed-out.jpg). The receipt keeps its centred column.

**Test, "another screen at a glance?"** Yes: text on white became a card with a photo and a way in.

## Round 90 · A step back: the Home's simulator gives the answer, not the whole contract

**Hierarchy audit (the Home's "What if it gets dropped?"):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| Chips, slider, the knock line | visitor | can't play | kept |
| "You'd get back 45 dollars" with the split bar | visitor | the answer | kept, primary |
| The full rule table (four levels, thresholds, amounts) | a renter about to accept the rule | they see it on the Rule step, before any money moves, and on the bike's booking card | removed from the Home; the sentence beside the simulator now says "You'll see the whole rule before you rent." |

**Levels after:** on the Home the simulator is a toy with one answer; the contract lives where you accept it. **Squint test:** before, the card ended in a grey table that looked like fine print; now it ends on the money.

**Three ideas (what to remove):** (1) the table from the Home's simulator. (2) The whole simulator from the Home (it's on the Rule step). (3) The "How renting works" band from the bike page (it's on the Home).
**Discarded:** (2) the simulator is the Home's one thing you can play with, and the clearest proof of the rule for someone not yet renting. (3) a renter can arrive on the bike page from a QR sticker without ever seeing the Home.

**Chosen, (1):** [1440, before and after](rounds/90-try-rule-1440.jpg), [phone](rounds/90-try-rule-375.jpg). The section is 136 px shorter on a phone; the Home is 4,827 px at 375 (it was 4,964).

**Test, "another screen at a glance?"** No: a step back.

### Block 81 to 90 (summary)

- **Lines in `webapp/src`:** about 7,220, under the cap of 13,517.
- **Strongest changes:** (1) the rule simulator rebuilt around everyday words and the money (82) and the deposit's button moved under the amount it pays, with a success state in the card (86); (2) the phone map given room with compact cards (81) and the bike page on a phone with the rule folded (84).
- **States and motion:** error, loading and empty states with a way on (83, 89); one behaviour per state site-wide (87); page changes that start at the top and cross-fade under a still header (88), which also fixed a real bug (new pages opened at the previous scroll position).
- **Steps back:** round 85 (nothing under 13 px; near-duplicate sizes merged) and round 90 (the Home's simulator without the contract table).
- **The same picture of money everywhere:** the blue-and-orange split bar now appears on the receipt, on Confirm a return, and in the simulator on the Home and the Rule step.

## Round 91 · The end of a rental is a trip summary: where the money went, and where you rode

**Hierarchy audit (Outcome step):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| H1 "30 dollars back, 20 dollars kept." beside a card saying "Back to you 30 dollars" | renter | the card says it | the H1 thanks and says who decided ("Thanks for riding. The rule settled it."); the amount stays in the card |
| The rule table (with a knock) | renter who wonders why | they accepted it before the ride; the lead says which level | replaced by the split bar (blue back, orange kept), the same picture as the receipt |
| A photo of a hand-back (no knock) | — | mood | replaced by the map of the ride you just did; the photo stays only if the readings are unavailable |
| The map of your ride, with the knock where it happened | renter: "where did it happen?" | the most concrete proof we have | added, under the bar |

**Levels after:** the card's "Back to you" primary; the bar secondary; the map the story. **Squint test:** before, a title and a grey table; after, a coloured bar over a map with one orange dot.

**References:** Flighty after landing (the route on a map, the numbers that mattered above it) and Strava's activity summary (the map is the record of what you did). Why ours looked cheaper: the last screen of a rental told the renter what they'd already read in the card.

**Three ideas:** (1) the outcome as a trip summary: bar plus map of the ride. (2) A shareable "ride card" image. (3) Only the receipt (skip the outcome page).
**Discarded:** (2) a sharing feature is new functionality, not design. (3) the receipt is a document; the outcome is the moment the rule acts, and the map belongs there.

**Chosen, (1):** [with a knock](rounds/91-outcome-knock.jpg), [no knocks](rounds/91-outcome-clean.jpg), [phone](rounds/91-outcome-375.jpg). The route is shown only to the renter, as on the ride page.

**Test, "another screen at a glance?"** Yes: a table became a map.

## Rotation register

Nothing is final: when every screen has had a round, the rotation starts again from the first, with the same protocol. This table says which round last touched each screen.

| Screen | Last round |
|---|---|
| Home: hero | 78 |
| Home: "how it works" band (and bike page) | 70 |
| Home: owners band | 80 |
| Home: try the rule (and Rule step) | 82 |
| Home: find a bike (grid + map) | 81 |
| Header | 77 |
| Page transitions | 88 |
| Footer | 73 |
| Bike page | 84 |
| Rent flow: Rule, Wallet, Deposit | 86 |
| Rent flow: Ride, Return, Waiting | 67 |
| Rent flow: Outcome | 91 |
| Receipt and My rentals | 68 |
| Owner (My bikes) | 69 |
| Owner: Confirm a return | 76 |
| Add a bike | 74 |
| Verify | 71 |
| Empty, loading and error states | 89 |
| Design | 72 |
