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

## Round 92 · The wallet step says what the wallet will ask next

**Hierarchy audit (Wallet step):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| A four-line lead (what a wallet is, the demo wallet, the live version, keys) | first-timer | — | one sentence: the deposit leaves from your wallet and comes back to it; Sharify never holds your money or keys |
| The demo wallet option | everyone | can't go on | primary; it says "Connecting…" while it works |
| "In the live version you connect your own wallet." under the option | — | — | moved into the option's own line |
| A 16:9 stock photo of a phone | — | mood only | removed |
| (missing) what happens after you connect | first-timer, nervous about money | they meet three wallet prompts unprepared | added: "What your wallet will ask next": take the bike, allow deposits (once per wallet), leave 50 dollars; and that nothing moves until you confirm |

**Levels after:** the option primary, the preview secondary. **Squint test:** before, a long paragraph and a big photo; after, one choice and a short list of what comes next.

**References:** Stripe's Link and Apple Pay set-up screens (one choice, then a short list of what you'll be asked to approve). Why ours looked cheaper: the photo was filler and the real worry (what will I be asked to sign?) went unanswered.

**Three ideas:** (1) one sentence, the option, and a preview of the next prompts. (2) A short video of the wallet prompts. (3) Merge Wallet into Deposit.
**Discarded:** (2) no honest footage of our prompts exists, and a recorded one would date at once. (3) the Rule → Wallet → Deposit order keeps "connect" and "pay" as separate decisions.

**Chosen, (1):** [before (round 66) and after](rounds/92-wallet-1440.jpg), [phone](rounds/92-wallet-375.jpg).

**Test, "another screen at a glance?"** Yes: a photo page became a choice with a plan.

## Round 93 · The Design page on a phone: the contents become one row that follows you

**Hierarchy audit (Design, 375 px):** the five contents items wrapped into three rows of pills plus a full-width "Download" pill, about 200 px of navigation that then scrolled away, so on a long document the reader lost the map exactly when they needed it. Verify on a phone was checked too (the card stacks, the answer replaces the button) and needed nothing.

**Levels after:** the reading is primary; the contents a thin secondary strip that stays under the header, scrolls sideways, and keeps the current section's pill (dark) in view as you read.

**References:** Apple's product pages on a phone (a sticky row of section links under the global header) and Stripe's docs on mobile (the "On this page" control stays reachable). Why ours looked cheaper: a block of pills that behaved like a header on a desktop and like clutter on a phone.

**Three ideas:** (1) a sticky, scrollable one-row strip with scroll-spy. (2) A "Contents" button that opens a sheet. (3) No contents on phones.
**Discarded:** (2) one more tap to see where you are. (3) the document is 5,500 px long; a map matters more on a phone, not less.

**Chosen, (1):** [before, after at the top, after jumping to "Do we need a blockchain?"](rounds/93-design-phone.jpg). The strip is solid with a soft shadow at its edge; sections stop below it when you jump.

**Test, "another screen at a glance?"** For the top of the page on a phone, yes: three rows of pills became one line.

## Round 94 · The rental in progress is a live pill that docks under the header

**Hierarchy audit (the strip shown on every page during a ride):**

| Block | Before | After |
|---|---|---|
| Container | a full-width tinted band with ruled lines above and below, under a floating rounded header: two languages stacked | a floating pill, the header's own material (white, blur, hairline, one shadow from the scale), 560 px wide and centred |
| Position | scrolled away with the page | sticky: it docks just under the header and stays while you read |
| Words | "Your rental · The demo bike · 21 min · a medium knock" | "Riding the demo bike  21 min · a medium knock" (the verb first; the time in a quieter tone) |
| A knock | the whole band turned pink | a thin orange ring and the orange dot; the meter stays |
| Action | a small square "Open" | a round "Open" that matches the pill |

**Levels after:** the page's content stays primary; the pill is a calm, always-there secondary. **Squint test:** before, a pink stripe across every page during a ride; after, a small white pill under the bar.

**References:** iOS Live Activities and the Dynamic Island (a running task as a small pill that stays put, a tint only when something needs you), and Uber's in-trip banner. Why ours looked cheaper: a full-width coloured band is how sites shout about cookies.

**Three ideas:** (1) a sticky floating pill under the header. (2) The ride's status inside the header itself, replacing the centre links during a ride. (3) A pill at the bottom of the screen.
**Discarded:** (2) the centre links would vanish just when a renter might want "How it works" or their rentals. (3) the bike page and the rent steps already use the bottom for their own bar.

**Chosen, (1):** [1440](rounds/94-live-1440.jpg), [docked while scrolling](rounds/94-live-scrolled.jpg), [phone](rounds/94-live-375.jpg).

**Test, "another screen at a glance?"** For the chrome during a ride, yes: a band became a pill.

## Round 95 · A step back: one radius, really

**Hierarchy audit (corners across the site):** the rule is one corner radius (14 px, the `--radius` token) for cards, photos, buttons, fields and panels, with only pills and dots fully round. Fourteen declarations had drifted: 10 px on the trip card's photo, the hero's bike photo, the compact map cards, the account menu items, the Design contents, the rule rows and the inset photo in "three moments"; 8 px on Verify's bars; 6 px and 4 px on two focus outlines; and one `radius − 4 px` on the map's mini card. Most of them were added in rounds 64–94, each reasonable alone, together a second radius scale nobody chose.

**Levels:** not a hierarchy change; a consistency one. **Squint test:** the corners of nested photos now match the cards around them.

**Three ideas (what to remove):** (1) every stray radius, back to the token. (2) A second, smaller token for nested elements. (3) Square corners for photos inside cards.
**Discarded:** (2) would make two radii official, which is what the rule forbids. (3) square photos in round cards read as unfinished.

**Chosen, (1):** [Verify's bars and the hero's bike card with the one radius](rounds/95-one-radius.jpg). Kept: 2 px on hairline strokes (slider ticks), 999 px and 50% for pills and dots. Also fixed a double space in the hero's card ("walk  from Bocconi").

**Test, "another screen at a glance?"** No: a step back.

## Round 96 · "Near me" lives on the map; every shadow on the scale

**Hierarchy audit (the finder's controls):**

| Block | Before | After |
|---|---|---|
| "Near me" as a blue chip at the end of the filter chips | at 1024 px it fell alone onto a second row; it is not a filter, it moves the map | a map control in the map's corner (a target icon and "Near me", "Recenter" once located), the way every map app places it; on a phone it sits above the sheet and hides when the sheet is pulled up |
| Filter chips | All, City, E-bike, Cargo, Road, Up to 2 dollars, Near me | the five filters only: one row at every width from 1024 up |

Also a step towards one shadow scale: the three hand-written shadows left (the phone sheet, the bottom bar, the Design strip on phones) now use the tokens; the upward ones share a new `--elev-up`.

**Levels after:** filters are one row of equals; location is a map action. **Squint test:** before, a blue chip pulled the eye to the end of the filter row; after, the row is calm and the map has one control in its corner.

**References:** Google Maps and Apple Maps (the locate button lives on the map) and Airbnb's map (controls on the map, filters above the list). Why ours looked cheaper: a map action dressed as a filter.

**Three ideas:** (1) "Near me" as a map control. (2) The title as the switch ("Bikes near Bocconi / near you"). (3) Ask for location on load.
**Discarded:** (2) a title that is also a button is hard to discover. (3) asking for location before the visitor has done anything is the pop-up we promised not to have.

**Chosen, (1):** [1024 before and after](rounds/96-finder-1024.jpg), [phone](rounds/96-finder-375.jpg).

**Test, "another screen at a glance?"** For the finder's top, yes at 1024: two rows of controls became one.

## Round 97 · The receipt prints as a receipt

**Hierarchy audit (the receipt on paper, "Print" button):**

| Block | Printed before | Printed after |
|---|---|---|
| "Deposit back to you: 30 dollars" | **missing**: a print rule written for the QR sticker on the Add flow hid every H1 on the site | back, as the first thing on the page (the sticker rule now applies only to its own page) |
| The proof (transactions) | folded: "See the proof" with nothing under it | opened just before printing; each transaction prints with its full address, so the paper can be checked without the site |
| Footer, giant wordmark, demo switch, floating header | printed (a page and a half of chrome) | hidden |
| Card shadow | a grey smear on paper | a thin border |
| Split bar colours | dropped by "save ink" | kept (they carry meaning) |

**Levels after:** on paper, the amount, the split, the lines, the proof. **Squint test:** before, a card without its number and a page of footer; after, one receipt.

**References:** Stripe's receipts print as a single clean page with the transaction id; bank statements print the reference in full. Why ours looked cheaper: the one page meant to be printed fell apart on paper, and a global rule leaked from another screen.

**Three ideas:** (1) fix the print stylesheet and open the proof before printing. (2) A "Download PDF" made by the site. (3) Remove the Print button.
**Discarded:** (2) a PDF generator is a new feature and a dependency. (3) a receipt you can't keep is not a receipt.

**Chosen, (1):** [printed before and after](rounds/97-receipt-print.jpg).

**Test, "another screen at a glance?"** On paper, yes.

## Round 98 · Checked, not assumed: contrast on every rebuilt page, and motion that respects "reduce"

**Contrast audit:** a script walked every text node on eight pages (Home, the bike page, the Rule step, a receipt, My bikes, Verify, the ride, Design) at 1440 px and three of them at 375 px, measured text against its real background (walking up to the first opaque surface) and flagged anything under 4.5:1 (3:1 for large text). Result: every text passes, including the new tinted surfaces of rounds 64–97 (sand, blue wash, the knock tints, the live pill). The one flag is the footer's "Sharify" wordmark (2.83:1, blue on the footer's sand): it is the logotype, hidden from screen readers, and WCAG exempts logotypes; it stays the brand blue. [The footer it refers to](rounds/98-footer-logotype.jpg).

**Reduced motion:** a second script listed every animation outside a `prefers-reduced-motion: no-preference` guard. Five decorative loops were still running for people who asked the system to reduce motion: the signature tile's pulse, the live pill's dot, the skeleton shimmer, the recorder LED's breathing, the QR scan sweep, plus the pulsing dots. They now stop. The spinners keep turning: they are the only sign that something is still working, which is the exception the guideline allows.

**Three ideas:** (1) measure, then fix only what fails. (2) Raise every grey one step darker "to be safe". (3) A high-contrast toggle.
**Discarded:** (2) flattens the hierarchy that tertiary grey exists for. (3) a toggle for a site that already passes is a feature nobody needs.

**Chosen, (1).** Nothing changes at a glance; nothing is assumed either.

**Test, "another screen at a glance?"** No: a verification round.

## Round 99 · The whole site, one more look

**What was checked:** all 18 routes (Home, the bike page, the six rent steps, My rentals, a receipt, My bikes, Confirm a return, two Add steps, Verify, Design, a missing bike) at 375 px and 1024 px for horizontal overflow (none on any of the 36), and side by side at 1440 px on one sheet: [every page](rounds/99-every-page-1440.jpg).

**What the sheet shows:** one system. The same floating header; working screens with a calm title on the left and a white card on the right (the rent steps, Confirm a return, Add); documents and listings with big type (Home, the bike page, Design); state cards for errors; sand for secondary surfaces, never a ruled line between zones.

**What it caught:** My rentals was the only working screen still opening with a bare "Your rentals." while My bikes opens with a small label and a sentence that says where things stand. Now: "Your rentals" as the label and "One rental, settled." / "You're riding the demo bike." / "No rentals yet." as the title. [Before and after](rounds/99-rentals-title.jpg).

**Three ideas:** (1) look at everything together and fix what breaks the system. (2) A component library page. (3) Visual regression tests.
**Discarded:** (2) and (3) are tools for a team over months; this round is a look, not infrastructure.

**Test, "another screen at a glance?"** For My rentals' first line, yes; for the site, the point was that every screen now looks like the same product.

## Round 100 · A step back: the proof, lighter

**Hierarchy audit (the bike page with "See the proof" open):**

| Block | Who, when | If it vanished | Verdict |
|---|---|---|---|
| The ledger: 7 columns (seq, anchored, custodian, readings, peak, root, transaction) in ruled rows, inside the 700 px story column, the transaction column cut by the edge | professors, auditors | the proof | kept, five columns: seq, anchored, custodian, peak, transaction. "Readings" (16 in almost every row) and "root" (checked on Verify, one click away) go |
| Rules between every row | — | — | rows told apart by a sand tint on every other one; the table sits in one rounded frame |
| "Where this comes from": contracts in a ruled list | the same readers | — | on a sand block, no rules |

**Levels after:** in proof mode the transaction (the thing you click to check) is now fully visible at the end of each row. **Squint test:** before, a dense grid of hairlines; after, banded rows with one orange value where the knock is and one hatched band where batches are missing.

**Three ideas (what to remove):** (1) two columns and every row rule. (2) The ledger itself (Verify covers one reading). (3) The "Where this comes from" section.
**Discarded:** (2) the ledger is the only place that shows the whole sequence, gaps included, which is the argument of the project. (3) the contract addresses are how a professor checks we're reading the real chain.

**Chosen, (1):** [before and after](rounds/100-proof-ledger.jpg). On a phone the table still scrolls sideways inside its frame; no page overflow.

**Test, "another screen at a glance?"** No: a step back; the proof is easier to read.

### Block 91 to 100 (summary)

- **Lines in `webapp/src`:** about 7,320, under the cap of 13,517 (+60% over 463f724); visual code only.
- **Strongest changes:** (1) the end of a rental as a trip summary with the map of the ride (91) and the wallet step that says what the wallet will ask next (92); (2) the live rental as a pill that docks under the header (94) and "Near me" moved onto the map (96).
- **Things found by looking, not by guessing:** the receipt printed without its amount because a print rule from another screen hid every title (97); 14 stray radii (95); four hand-written shadows (96); five decorative loops ignoring reduced motion (98). Contrast measured on every rebuilt page: everything passes except the logotype, which is exempt (98). No overflow on any of 18 routes at 375 and 1024 px (99).
- **Steps back:** rounds 95 (one radius) and 100 (a lighter proof).

### Rounds 58 to 100 (the whole run)

Every screen was rebuilt at least once with the same method (a written hierarchy audit, two real references, three structural ideas and two discarded, before and after side by side), and the most important ones twice: the finder (structure, 79, 81, 96), the bike page (64, 65, 84), the rent flow (66, 67, 86, 91, 92), the header (structure, 77), the Home's first screen (78) and its rule simulator (82, 90). The site now has one system: a floating header, working screens with a calm title and a white card on the right, documents with big type, sand surfaces instead of ruled lines, one radius, one shadow scale, one picture of money (the blue and orange split bar) wherever a deposit is divided, and states (loading, empty, error, success) that always leave a way on.

## Round 101 · Study, no code: why the café site is warm and ours is flat

**A note first.** `PROTOCOL.md` changed while rounds 64–100 were running (study round, café yardstick, composition rounds, blurred-shot test, run to 150, cap raised to 10,560 lines). I stopped re-reading it after round 71, so rounds 86–100 followed the older version: no café comparison, no composition round, the "another screen?" answer given on sharp shots. From this round on, the current version applies.

**What I compared:** the 12 frames of the finished café site (`foto-sabato/cafe/`, not committed: not ours) beside [Sharify's Home, top to bottom](rounds/101-sharify-home-full.jpg).

### What makes the café warm

1. **Light you could stand in.** Its photographs are interiors in late-afternoon light (wood, brick, steam), used as the whole background of a section, edge to edge, with the content set into the scene. Ours are photographs in frames: a hero, then pictures inside cards. You look at our pictures; you are inside theirs.
2. **A rhythm of tone.** Cream sections alternate with deep espresso ones (the chalkboard, "More ways to order", the footer). The page breathes in and out. Ours is white and sand from top to bottom, with one pink band; nothing is ever dark, so nothing feels like evening, or like a place.
3. **Every section is an object from the shop.** The order is a paper receipt with a torn edge; loyalty is a punch card with holes; "your drink on the shelf" is a wooden shelf with cups for each weekday; the regulars' orders are on a chalkboard in handwriting; the seats are a floor plan you can pick from; the way there is a little street map with the bus stop. Each of these is also the thing you use. Ours are cards with text and a button: correct, interchangeable, the same card shape forty times.
4. **People.** Marcus, Priya, Dana, Sam, Jen, Walt: named regulars with their usual order and a line in their own words. Ours has "Alice" and "Bob" only inside the record, and nobody on the Home.
5. **Time and place, live.** The header says "Closed, opens tomorrow at 6am" and later "Order, ready by 6:05am"; the visit section says "418 Maple Street, park in the back lot behind the bank", "2 min walk from the 14 bus". Ours says "Bikes near Bocconi" and gives distances, but never a street, a shop, an hour, or what's happening right now.
6. **Two voices of type.** A warm serif for the headlines and a handwritten script on the chalkboard, against a quiet sans for the rest. Ours is one grotesque everywhere, bold or regular: tidy, and the same temperature on every line.
7. **Each section is composed differently.** A full-bleed photo with numbered hotspots and a dotted path; a split with a tall portrait card; a dark band with a strip of small photos; a map card floating over a kitchen. Ours repeats two moves: "title left, card right" and "a grid of equal cards" (the finder's ten photo cards fill two screens with the same shape, which the protocol now forbids).
8. **Small honest rituals in the copy.** "Every cup punches your card, so 5 a week works out to a free drink about every 2 weeks." Specific, numeric, about a habit. Ours is careful and clear, but it explains a system; it rarely describes a morning.

### What makes ours flat, section by section

- **Hero:** a good photograph, but the card covers the person; the scene is a backdrop, not a place. One button, one bike card: correct and cold.
- **Finder:** the most useful section, and the least warm: ten identical cards in a grid beside a map. No street names, no owner, no time.
- **Three moments:** three equal portrait photos with captions: the most "template" row on the site.
- **What if it gets dropped:** a white card on a pink band: clear, but it's a calculator, not an object.
- **Owners:** a photo of a shop owner who has no name, no shop, no street.
- **Footer:** sand, links, a big blue word: tidy, not a closing.

### Principles to carry into Sharify (Theme B · Day, our palette, not the café's)

1. **Put people and places in:** the owner has a name and a shop (Giacomo's bikes, Via Sarfatti); bikes are parked at a named spot; the Home can say what's happening now ("The demo bike is free, parked outside Bocconi since 10:20").
2. **One deep section per page** in our own ink (#17191b) with warm photographic light, so the page has a rhythm of light and dark, still inside Theme B.
3. **Turn functions into objects from the bike's world:** the deposit as a luggage-tag-like ticket; the record as the recorder's logbook; the rule as the sticker on the frame; the way to the bike as a little street map with the walk.
4. **Photographs as places, not thumbnails:** at least one full-bleed section per page where the content sits inside the scene, with hotspots (the recorder on the frame, the QR sticker, the lock).
5. **No row of identical cards:** the finder and "three moments" get compositions where items differ in size and role.
6. **A second voice of type**, used sparingly for warmth (to propose to Edoardo before using: it touches the theme).
7. **Copy about mornings, not systems:** what a ride is like, where you leave the bike, how long the walk is.

**Test:** none: a study round. The next rounds have to close this distance, and each one says in writing how much is left.

## Round 102 · Composition: the Home breathes in light and dark

**A composition round** (protocol: one in five): judged on the whole Home, top to bottom, sharp and blurred: [blurred, before and after](rounds/102-home-full-blur.jpg), [sharp](rounds/102-home-full-sharp.jpg).

**Hierarchy audit (the Home as a page):** hero (light photo) → finder (white, three screens) → three moments (white, three equal portraits) → try the rule (pink) → owners (sand) → footer (sand). Every section the same temperature; the only change of tone was the pink band. The three moments were the most template-like row on the site (protocol: no rows of identical cards).

**What changed:**
- **"A rental, in three moments" becomes a journey on a deep ink band**: three photographs of different sizes and shapes (square, landscape, portrait) set along a dotted route that draws itself as you scroll (static with reduced motion), each with its number, title and one sentence; the recorder inset on the ride. On a phone the three stack, staggered left and right.
- **The footer turns dark**, so the page ends in the evening: light, light, dark, light, light, dark. The blue wordmark on ink measures 5:1.
- On the bike page the same three moments keep the light band (a working page doesn't need the evening).

**Café test, "is it as welcoming as the café? what's missing?"** Closer in rhythm: the café alternates cream and espresso, and now so do we, in our own ink. Still missing: (1) the finder is three screens of the same card shape, the opposite of the café's varied objects; (2) no section is yet an object from the bike's world (the café's receipt, punch card, shelf, chalkboard); (3) no place has a street or an hour. Those are the next rounds.

**References:** the café frames (the espresso bands and the dark footer) and Apple's product pages (dark and light chapters alternate to pace a long page).

**Three ideas:** (1) a deep band for the journey and a dark footer. (2) Make the whole Home dark. (3) A full-bleed photo with hotspots for the three moments.
**Discarded:** (2) Theme B is light; a dark site is another theme. (3) one photo can't honestly show three different moments (the sticker, the ride, the return) at once.

**Test, "another screen at a glance?" on the blurred shots:** yes for the bottom half (a dark block appears where there was a row of three, and the page now ends dark); **no** for the top half, which is unchanged: the finder still reads as a long grid. That part is the next composition target.

## Round 103 · The finder: the closer the bike, the bigger its card

**Hierarchy audit (the finder's list):** after the real bike, nine sample cards of one shape filled two and a half screens (protocol: no rows of identical cards). Distance is what a renter cares about most after the price, and it was a grey line under each card.

**What changed:** the samples are grouped by how far you'd walk, and the size of the card says it:
- **Under 5 minutes' walk:** a wide card, photo left, name, distance, price and record right (one per row).
- **10 to 15 minutes:** three per row, photo and price, the record line left for the bike page.
- **A longer walk:** compact sand tiles, two per row: a square photo, name, distance, price.
Each group has a short heading. On a phone the carousel is unchanged (one card at a time already varies by what's centred).

**Levels after:** real bike → near → mid → far, in decreasing size. **Café test:** the café's menu varies objects by what they are (the bag of beans, the cups, the pastry case); we vary by what matters here, distance. Closer: the page no longer reads as a wall. Still missing: places (no street or owner names on the samples), and no object from the bike's world yet.

**References:** Airbnb search ("Guest favourite" larger, the rest smaller) and Apple Maps' results (nearest first and largest, the rest compact).

**Three ideas:** (1) size by distance with group headings. (2) A table of all bikes. (3) Only the five nearest, "show more" for the rest.
**Discarded:** (2) a table loses the photographs, the one thing that makes a bike desirable. (3) hides half the fleet the map still shows.

**Chosen, (1):** [the finder's bands](rounds/103-finder-bands.jpg), [whole Home, blurred, before and after](rounds/103-home-full-blur.jpg), [sharp](rounds/103-home-full-sharp.jpg). The Home is 743 px shorter at 1440.

**Test on the blurred shots:** yes for the finder: a regular grid of nine became a wide strip, a row of three, and a block of small tiles.

## Round 104 · An object from the bike's world: the sticker on the frame, real and scannable

**Hierarchy audit ("What if it gets dropped?" on the Home):** a title, three lines of text and, on the right, the simulator card. The left column was text and empty sand below it: the rule felt like a policy page, not something on a bike.

**What changed:** under the text, the **sticker on the frame**, drawn as it sits on a dark down tube: the same sticker the owner prints at the end of "Add your bike", with the bike's name and "Scan to rent", and a **real QR code** that opens this bike's rule. Point a phone at the screen and the rule opens on the phone: the page's one live thing now reaches out of the screen. It tilts a little more and lifts on hover.

**Café test:** the café turns each function into an object you know from the shop (the receipt, the punch card, the shelf). This is the first Sharify section that does the same: the rule arrives through an object that exists on the bike. Still missing: places and times; the finder and owners' band are still screens, not scenes.

**References:** the café's punch card and receipt; Apple's Wallet pages (the card is shown as the object it is, at an angle, with the real information on it).

**Three ideas:** (1) the frame sticker with a working QR. (2) The deposit as a luggage-tag ticket that tears into "back" and "kept". (3) The rule printed on a bike bell or a lock.
**Discarded:** (2) the split bar already shows the money everywhere; a second picture for the same thing splits the system. (3) invented objects: the rule isn't printed on anything but the sticker's QR leads to it.

**Chosen, (1):** [1440, "falls over" pressed](rounds/104-sticker-1440.jpg), [phone](rounds/104-sticker-375.jpg). The old, unused QR illustration and its styles were removed.

**Test on the blurred shots:** yes for that section: an empty left column now holds a dark diagonal with a white label on it.

## Round 105 · A step back: "Sample fleet" said once

**Hierarchy audit (the finder on a desktop):** the honesty note was said ten times: once as the sentence above the samples ("Sample fleet. How the map will look with more owners. These bikes have no recorder and can't be rented.") and nine more times as a white pill on every sample photo. Nine identical pills are noise on the photographs, and they made the one pill that matters ("Live · on-chain", on the real bike) one of ten.

**What changed:** on a desktop, the sample photos lose their pill; the sentence stays right above them, and the map's mini card still says "A sample bike: it has no recorder, so it can't be rented" when you pick one. "Live · on-chain" is now the only pill in the list. On a phone, where the carousel shows one card at a time and the sentence isn't visible, every card keeps its pill.

**Three ideas (what to remove):** (1) the repeated pills, keeping the sentence. (2) The sentence, keeping the pills. (3) The group headings from round 103.
**Discarded:** (2) a pill can't say why (no recorder) and that they can't be rented. (3) the headings are what makes the card sizes legible as distance.

**Café test:** cleaner photographs read more like the café's menu; the honesty is intact.

**Chosen, (1):** [before and after](rounds/105-sample-once.jpg).

**Test:** a step back: on the blurred shots the photos are calmer; not another screen, and not meant to be.

## Round 106 · The header says what the real bike is doing now

**Hierarchy audit (the header):** logo, two sections, the account or "Connect wallet", "Find a bike". Correct and timeless in the bad sense: nothing in it changes during the day. The café's header says "Closed, opens tomorrow at 6am", then "Order, ready by 6:05am": the shop is alive before you scroll.

**What changed:** beside the logo, a small status pill about the one real bike, read from the same data as the map: "● The demo bike is free, outside Bocconi" (blue dot, slow pulse) or "● The demo bike is out on a ride" (grey dot). It links to the bike. From 860 to 1240 px it shrinks to the dot (with the sentence as its name and tooltip); on phones it's hidden (the Home's first card says the same).

**Levels:** tertiary: small, sand, beside the logo; "Find a bike" stays the only filled button. **Café test:** closer: the site now has a "now". Still missing a place with a street name on the Home, and a scene-like owners' band.

**References:** the café's opening-hours pill; Linear's header changelog pill (a small live note beside the logo, never louder than the action).

**Three ideas:** (1) a live status pill for the real bike. (2) Opening hours of the owner's shop. (3) A ticker of recent rentals.
**Discarded:** (2) we have no hours to show: inventing them would be false. (3) a ticker of activity in a demo with one bike would be noise pretending to be traffic.

**Chosen, (1):** [free, out on a ride, connected, at 1024](rounds/106-header-status.jpg). First tried on the right, beside the buttons: it collided with the sections and squeezed "Find a bike" onto three lines; it went to the left, where the logo's column has room.

**Test on the blurred shots:** a small change by design; the header now has a third mass beside the logo.

## Round 107 · Composition: the bike page as a place

**A composition round**, judged on the whole bike page: [blurred, before and after](rounds/107-bike-full-blur.jpg), [sharp](rounds/107-bike-full-sharp.jpg).

**Hierarchy audit (the page):** title → a boxed mosaic → record and booking card → three light portrait cards ("How renting works") → footer. Everything inside the same 1,144 px column; one temperature; the bike was shown but nowhere placed.

**What changed:**
- **The pictures go edge to edge** (on desktops): the mosaic breaks out of the column and fills the width, 44 vw tall, so the bike stands in a street, not in a frame.
- **Where it's parked**, under the booking card: a small map with the bike's pin and "Parked outside Bocconi, 2 min walk from Bocconi. When it's out on a ride, it isn't on the map." Shown only while the bike is free (a rented bike's position is never published).
- **The page ends in the evening:** the three moments become the dark journey (as on the Home), joined to a dark footer one shade lighter.

**Café test:** the café's "Getting here" card (a small map with the walk) is now ours too, and the page has the café's light-then-dark rhythm. Still missing: a scene for the owners, and the warmth of the type.

**References:** the café's visit section (map card with the walk time); Airbnb's room page ("Where you'll be", a map under the booking details).

**Three ideas:** (1) edge-to-edge pictures, a parked map, an evening close. (2) The whole page on a single full-bleed photograph. (3) A street-level photo strip of the area around the bike.
**Discarded:** (2) the record and the booking card need a quiet background to be read. (3) we have no honest photographs of that exact street.

**Chosen, (1):** [the parked map under the booking card](rounds/107-bike-parked.jpg).

**Test on the blurred shots:** yes: the top is a band of photograph wall to wall, and the bottom third is dark; before, a boxed page on white.

## Round 108 · The owners' band is a scene: the shop fills the section, the card stands in it

**Hierarchy audit (the Home's owners' band):** a photo cropped to the left half, a white card overlapping it, sand around. Like every picture on the site, the shop was a framed thumbnail; the owner was half hidden behind the card.

**What changed:** on a desktop the shop photograph fills the whole section edge to edge (it drifts a little as you scroll, off with reduced motion); the card stands inside the scene on the left, and the owner in his doorway is in full view on the right. A soft shade on the card's side keeps the edge of the photo calm. On a phone the photo stays above the card (a full-bleed photo with a card over it doesn't fit 375 px).

Fixed on the way: an absolutely positioned photo inside a grid takes its grid area as its frame (columns 1–8, without the padding), which first left the photo at 60% width and then a dark strip above it; it now takes the section's whole box.

**Café test:** this is the café's visit section in our terms (a place you could walk into, the content standing in it). With the journey and the dark footer, the Home's second half now has two scenes. Still missing: the warmth of the type, and people (which we can't invent: no fake testimonials).

**References:** the café's "Opens tomorrow 6am" (full-bleed kitchen with a map card standing in it) and Airbnb's host page (a host in their space, the call to action beside them).

**Three ideas:** (1) full-bleed photo, card inside. (2) A split screen (photo half, text half, no card). (3) A short loop of the shop door opening.
**Discarded:** (2) the split is what we had, minus the overlap. (3) no honest footage exists, and the GPU video model isn't installed (round 62).

**Chosen, (1):** [before and after, 1440](rounds/108-owners-1440.jpg), [phone](rounds/108-owners-375.jpg).

**Test on the blurred shots:** yes: a white block over half a photo became a photograph wall to wall with a white card in it.

## Round 109 · Verify: the check happens on a dark stage, and the answer lights up

**Hierarchy audit (Verify):** the round-71 sheet was clear, but the page was white top to bottom, and the moment of proof (the one the professors watch) had no more presence than a settings form.

**What changed:** the check sheet sits on a full-width ink stage between the explanation above and the values below. When the contract says yes, the sheet's edge lights up with a soft blue glow (fading in; instant with reduced motion), on top of the check mark that already pops. The rest of the page stays light, so the dark band reads as "this is the moment".

**Café test:** the café's chalkboard is its dark, focused moment in a cream page; this is ours. It adds the evening tone to a screen that had none.

**References:** the café's chalkboard section; Apple's keynote-style product reveals (one object on a dark stage, lit).

**Three ideas:** (1) a dark stage under the sheet, a glow on success. (2) The whole page dark. (3) A full-screen "Verified" moment.
**Discarded:** (2) the explanation and the proof values read better on white, and Theme B is light. (3) hides the reading that was verified, which is what the answer refers to.

**Chosen, (1):** [before (round 71) and after, verified](rounds/109-verify-stage.jpg), [phone](rounds/109-verify-375.jpg). A first try with a negative-z pseudo-element painted behind the page and showed nothing; the stage is now its own element.

**Test on the blurred shots:** yes: a white page with a card became a white page with a dark band and a lit card in it.

## Round 110 · A step back: the rule's band stops changing colour

**Hierarchy audit:** "What if it gets dropped?" sat on a band that turned light blue with no knock and orange-pink with any knock (the default example is a light knock, so most visitors saw pink). The protocol keeps orange for knocks; here a whole section was tinted for a simulated one, and the knock was already shown three times in the card (the number, the meter's colour, the orange part of the bar).

**What changed:** the band is a constant sand; the card and the sticker carry all the colour.

**Three ideas (what to remove):** (1) the section tint. (2) The meter beside the knock number. (3) The examples' footnote.
**Discarded:** (2) the meter is the same symbol the bike's record and receipts use: learning it here pays off later. (3) the footnote is the honesty about the example values.

**Café test:** the café uses its accent orange sparingly, on buttons and one band; a band that flashes as you play reads as an alarm. Calmer now.

**Chosen, (1):** [before and after](rounds/110-rule-band.jpg).

**Test:** a step back; on the blurred shots the Home's tones are now white, ink, sand, photograph: no pink.

### Block 101 to 110 (summary)

- **Lines in `webapp/src`:** about 7,530, under the cap of 10,560 (the protocol's new cap).
- **Re-read the protocol:** it had changed during rounds 72–100 (café yardstick, composition rounds, blurred test, run to 150); from round 101 every round checks it first.
- **The café study (101)** named eight reasons the café feels warm; this block worked on four of them: a rhythm of light and dark (102: dark journey and footer; 109: Verify's dark stage), objects from the bike's world (104: the frame sticker with a working QR), a "now" (106: the header says what the real bike is doing), and places you could stand in (107: edge-to-edge pictures and a "where it's parked" map; 108: the owners' band as a scene).
- **Composition rounds:** 102 (Home) and 107 (bike page), judged on blurred full pages.
- **The finder** stopped being a wall of equal cards: size says distance (103), and "Sample fleet" is said once (105).
- **Still missing, honestly:** the café's second voice of type (it would change Theme B: to propose, not to impose) and its people (named regulars would be invented testimonials, which the rules forbid).

## Round 111 · Returning shows the place: the rack in a photo and on a map

**Hierarchy audit (Return step):** the first instruction was "Leave it where the owner asked, locked": where is that? The renter had to remember it, or go back to the bike page. A return is a moment in a place; the screen had no place in it.

**What changed:** under the title, the spot: the photograph of the rack outside Bocconi beside a small map with a dark pin "Leave it here", and the caption "The rack outside Bocconi. Where the owner asked for it back. Lock it to the rack." The first step now says "Leave it at the rack". The map is fixed (no dragging): it's a sign, not a tool.

**Café test:** the café's visit section ("Park in the back lot behind the bank", a map with the walk) is exactly this kind of instruction; ours now gives a renter somewhere to stand. Still white and quiet around it, which suits a working step.

**References:** the café's "Getting here"; Uber's drop-off screen (the exact spot pinned on a small map, a photo of the entrance when there is one).

**Three ideas:** (1) photo and map of the spot. (2) Turn-by-turn directions to the rack. (3) A checklist with a photo upload of the parked bike.
**Discarded:** (2) the renter is usually a few metres away; directions are a navigation app's job. (3) a photo upload is a new function, outside the cap's rule, and the recorder already proves condition.

**Chosen, (1):** [before (round 67) and after](rounds/111-return-place.jpg), [phone](rounds/111-return-375.jpg).

**Test on the blurred shots:** yes: three grey tiles became a picture-and-map band over the tiles.

## Round 112 · Composition: the Design page gets its two loud moments

**A composition round**, judged on the whole Design page: [blurred, before and after](rounds/112-design-full-blur.jpg), [sharp](rounds/112-design-full-sharp.jpg).

**Hierarchy audit (the page):** a long, even white document: a photo, a list, four small numbers on sand, seven scheme pairs, five yes/no tiles and a one-line verdict in bold, folded questions. Every section the same weight, so the two things a professor should remember (how small and cheap the system is; why it needs a public blockchain) were the quietest.

**What changed:**
- **The numbers** cross the page on an ink band, set at 64 px in white (1600/s, ±200 g, 16, ~145k gas): the page's first dark beat.
- **The verdict** of the blockchain test ("Result: a public, permissionless blockchain.") is a statement on ink that closes its section.
- **The contents** became a small floating white card, so they stay readable when the dark band passes under them.

**Café test:** the café's long page is paced by its espresso bands; this document now has two dark beats where the argument lands.

**References:** Apple's spec pages (numbers in large type on a dark band) and Stripe's annual-letter pages (one statement set apart after a long argument).

**Three ideas:** (1) dark bands for the numbers and the verdict. (2) Split the page into tabs per audience. (3) Put the scheme on a dark chapter.
**Discarded:** (2) the professors read it top to bottom, projected. (3) seven text-heavy pairs read best on white.

**Chosen, (1):** [the numbers band](rounds/112-design-numbers.jpg), [the verdict](rounds/112-design-verdict.jpg).

**Test on the blurred shots:** yes: a uniform grey column became one with a dark band near the top and a dark bar mid-page.

## Round 113 · The receipt is a slip on the counter

**Hierarchy audit (receipt):** the round-68 slip leads with the money and reads well; but it was a white card on a white page, a document, not a thing you were handed. The café's receipt (paper, torn edge, set over its photo) is the object people remember.

**What changed:** the slip lies on a dark counter that crosses the page, tilted a degree, with a torn bottom edge, and drops into place when the page opens (off with reduced motion). On paper none of it applies: printed, it is the plain round-97 receipt with its proof. On a phone the slip isn't tilted.

**Café test:** this is the café's receipt, made of our own material (the money bar, the rule, the proof). The tone ladder of the site now has paper on the counter as well as cards on sand.

**References:** the café's order slip; Apple Wallet's passes (a document shown as the object it stands for).

**Three ideas:** (1) a slip on a dark counter. (2) A receipt you can "tear off" with a drag to save it. (3) An emailed-receipt look with a header band.
**Discarded:** (2) a gesture for a novelty adds no information. (3) an email look on a web page is a costume.

**Note:** in round 68 I discarded the torn edge as "decoration, not hierarchy". Under the café yardstick it earns its place again: the hierarchy is already right, and the edge says "this is something you keep". Nothing is final.

**Chosen, (1):** [before and after](rounds/113-receipt-slip.jpg), [phone](rounds/113-receipt-375.jpg). Print rechecked: no shadow, no tilt, no mask.

**Test on the blurred shots:** yes: a white card on white became a light slip on a dark band.

## Round 114 · My bikes shows today, hour by hour

**Hierarchy audit (owner's home):** a sentence ("Nothing needs you right now."), the tiles and the earnings card. All of it is totals and states; nothing says how the day went, which is what someone lending their bike actually wonders ("was it out this afternoon?").

**What changed:** under the title, a dark "Today" ribbon: the day from midnight to midnight, a tick every six hours, a mark for each rental while it was out (blue, or orange when the recorder felt a knock), and a white "now" line. The sentence above it counts the rides ("3 rides today"). Hovering a mark names the renter and the time.

**Café test:** the café's "shelf by the door" (the week as cups, one per weekday) makes time visible as an object; this is the owner's equivalent, in our dark tone. The demo's rentals all happened within minutes, so the marks stand close together near "now": true to the demo, not a staged picture.

**References:** the café's weekday shelf; Apple's Screen Time and Fitness (a day as a band with what happened on it).

**Three ideas:** (1) a 24-hour ribbon of today's rides. (2) A month calendar with dots. (3) A chart of earnings over time.
**Discarded:** (2) one bike, a few rentals: a month of empty squares would look abandoned. (3) the earnings are 21 test dollars; a chart would dramatise noise.

**Chosen, (1):** [before (round 69) and after, with a bike out](rounds/114-owner-today.jpg), [phone](rounds/114-owner-375.jpg).

**Test on the blurred shots:** yes: a dark band now separates the title from the tiles.

## Round 115 · A step back: one "the demo bike is free" at a time

**Hierarchy audit (the Home's first screen):** since round 106 the header's status pill said "The demo bike is free, outside Bocconi" while the hero's bike card, a few centimetres below, said "Free now, 2 min walk from Bocconi". Two ways to say the same thing on one screen, the smaller one in the header competing with the hero.

**What changed:** on the Home, the header's status waits until the hero has scrolled away (it fades in with the header's "Find a bike", 380 to 560 px); with reduced motion it stays out of the Home's header altogether. Every other page keeps it from the start. [Top of the Home, then scrolled](rounds/115-status-waits.jpg).

**Three ideas (what to remove):** (1) the status on the Home's first screen. (2) The hero's bike card. (3) The status everywhere.
**Discarded:** (2) the bike card is the Home's concrete proof, with its photo and price. (3) on every other page the status is the only place that says what the real bike is doing.

**Café test:** the café's header has one line of status and the page never repeats it next to itself; neither do we now.

**Test:** a step back; on the first screen the header is lighter by one pill.

## Round 116 · The ride card shows the money the way the receipt will

**Hierarchy audit (ride, status card):** title (what would be kept), then a grey line "50 dollars deposit · the bike last reported 21 minutes ago", then Return. The consequence was only in words; the picture of the money (blue back, orange kept) that the receipt, the confirm screen and the simulator all use was missing at the one moment it changes live.

**What changed:** between the title and the button, a small sand block "If you returned it now" with the split bar and its legend ("30 dollars back · 20 dollars kept"); the line under it keeps the meter and when the bike last reported. With no knock the bar is all blue.

**Café test:** the café's order bar at the bottom ("2 items, $6.75 · +1 punch") keeps the running total in view as you choose; ours keeps the running outcome in view as you ride.

**References:** the café's floating order bar; Uber's in-trip fare estimate (what it would cost if the trip ended now).

**Three ideas:** (1) the split bar, "if you returned it now". (2) A countdown or a running clock of the rental. (3) A live chart of the knocks so far.
**Discarded:** (2) the deposit doesn't run out with time; a ticking clock would suggest a meter. (3) the hardest knock is all that counts; a chart of every bump would mislead.

**Chosen, (1):** [before (round 67) and after](rounds/116-ride-money.jpg), [phone](rounds/116-ride-375.jpg).

**Test on the blurred shots:** a change inside the card: a coloured bar now sits in it; the screen as a whole is the same, as intended.

## Round 117 · Composition: My rentals opens on your last ride

**A composition round**, judged on the whole page: [blurred, before and after](rounds/117-rentals-full-blur.jpg), [sharp](rounds/117-rentals-full-sharp.jpg).

**Hierarchy audit (the page):** a title ("One rental, settled."), the heading "Past rentals" and one small photo tile (the same stock photo of the bike for every rental). The page knew about the ride (where it went, what came back) and showed a thumbnail.

**What changed:** after the title, **your last ride** as one wide card: on the left the map of the route you rode (with the knock, if any, in orange); on the right, on ink, "Your last ride · 40 minutes ago", the bike and how long, the split bar (back / kept) and two buttons (Receipt, Check the knock). Earlier rentals follow as tiles under "Earlier rentals"; with only one rental, no list repeats it.

**Café test:** the café greets you with your usual and your order ready; this greets you with your last ride. Personal, concrete, in our dark tone.

**References:** Strava's activity feed (the map of your last ride is the hero) and Uber's trip history (the latest trip with its map and fare first).

**Three ideas:** (1) the last ride as the page's hero. (2) All your rides drawn on one map. (3) A summary of totals (rides, minutes, dollars back).
**Discarded:** (2) one line across separate rides would draw journeys that never happened. (3) totals in a demo with one or two rentals are trivia.

**Chosen, (1):** [phone](rounds/117-rentals-375.jpg). The routes are shown only to the renter who rode them.

**Test on the blurred shots:** yes: a small tile on white became a wide map-and-ink band.

## Round 118 · Waiting is a line with one moving point, and a deposit you can see is safe

**Hierarchy audit (Waiting step):** three stacked tiles (returned / owner confirms / deposit back) and a sand panel "What if the owner doesn't confirm?". The renter's real question while waiting is "is my money safe?", and the answer sat in a paragraph at the bottom.

**What changed:** the three steps are one horizontal line: a ticked dot, a pulsing dot ("The owner confirms · Waiting", in blue), an empty dot, joined by a track that's blue up to where you are. Under it, a dark block with a padlock: "50 dollars, held by the rule. Nobody can take it while you wait: not the owner, not us. If the owner doesn't confirm, it stays where it is; the owner can't change the rule." On a phone the line stacks.

**Honesty check:** "stays where it is" is exactly the known limit (no deadline for the owner's confirmation; listed on the Design page). Nothing here promises a refund by a date.

**Café test:** the café's "Order, ready by 6:05am" turns waiting into something you can see; ours shows where the return stands and what's protecting the money.

**References:** the café's order status; delivery trackers (one line, one moving point).

**Three ideas:** (1) a progress line and a "held" block. (2) A countdown to an automatic refund. (3) A button to remind the owner.
**Discarded:** (2) there is no automatic refund in today's contract; a countdown would be false. (3) messaging the owner is a new function.

**Chosen, (1):** [before and after](rounds/118-waiting.jpg), [phone](rounds/118-waiting-375.jpg).

**Test on the blurred shots:** yes: three grey tiles and a panel became a line of dots and a dark block.

## Round 119 · Mounting the recorder: the real box, the steps as tiles, "it's fixed" as a tile you can't miss

**Hierarchy audit (Add, step 2):** a crude line drawing of a box on a tube with "Sharify" in a monospace face (left over from an earlier theme), a default numbered list beside it, and a tiny browser checkbox for the one thing the step needs ("It's fixed and doesn't move by hand"), with "Continue" greyed out until you find it.

**What changed:** the drawing gives way to the photograph of the recorder against a frame (wide crop); the three instructions are numbered tiles like the Return step's; the confirmation is a large tile with its own box, a second line ("Give it a firm push: nothing should wobble."), a blue ring and tick when on, and a focus ring for the keyboard. The drawing's component and styles are deleted.

**Café test:** the café shows its real machines, not diagrams; so do we now.

**References:** Apple's setup guides (a real photo of the device, then numbered steps); Stripe's onboarding confirmations (a full-width checkable row, not a 13 px box).

**Three ideas:** (1) photo, tiles, a check tile. (2) A short looping clip of fixing the box. (3) An illustration redrawn in the house style.
**Discarded:** (2) no footage exists. (3) a drawing of something we have a photograph of is a step away from the real thing.

**Chosen, (1):** [before and after (check ticked)](rounds/119-mount.jpg), [phone](rounds/119-mount-375.jpg).

**Test on the blurred shots:** yes: a dark diagonal drawing and a list became a wide photo over three tiles and a blue-ringed tile.

## Round 120 · A step back: the wordmark signs off the pages you read, not the screens you work in

**Hierarchy audit (every page, dark surfaces counted):** a probe of large dark surfaces per page: Home has three (journey, owners band, footer), the others two at most. The one surface repeated everywhere is the footer, and at its foot a 180 px blue "Sharify" wordmark: on the Home and the bike page it signs off a page you read top to bottom; on My bikes, the Add steps and Verify it is the heaviest block on a screen where you came to do one thing, and on a short page like My bikes it outweighs the work above it.

**What changed:** on working screens (`main.rent`, owner pages included, and Verify) the wordmark is hidden and the footer closes on the links (492 px → 279 px). Home, bike page, receipt, My rentals and Design keep it. One CSS rule, nothing added.

**Café test:** the café's sign is over the door, not on every table; the counter where you pay has just the menu. Still missing: the café's warmth on the owner screens, which are still white on white with one sand tile.

**References:** Stripe (the marketing footer is big, the dashboard has none); Airbnb (host tools close on a short link row).

**Three ideas:** (1) wordmark only on reading pages. (2) Lighten the owners band on the Home to drop a dark beat. (3) Merge the Home journey and owners band into one dark scene.
**Discarded:** (2) the owners band is a photograph-led scene, the dark is the photo's, not a block; lightening it would wash the picture. (3) two different audiences (renters, owners) in one band is the confusion rounds 102–108 removed.

**Chosen, (1):** [before and after, My bikes](rounds/120-footer.jpg).

**Test on the blurred shots:** yes, for My bikes: the lower half was a black slab with a blue shape, now the tiles and the earnings card are the weight and the footer is a quiet band.

## Block 111 to 120 (summary)

Rounds 111–119 rotated through the screens that had gone longest untouched and turned each into a real place or object: the Return step got the photo of the spot and its map (111); Design got the numbers on a dark band and the verdict as a statement (112); the receipt became a slip on a dark counter (113); My bikes opens on today's ribbon (114); the header status became one sentence at a time (115, step back); the ride card shows the money split the receipt will show (116); My rentals opens on your last ride (117); Waiting became a line with one moving point and a deposit you can see is held (118); mounting the recorder uses the real photo and a check tile (119). This round removed instead of adding. Lines in `src`: about 7,700 of the 10,560 cap. Next: the oldest screens in the register (Rule and Deposit steps 86, Confirm a return 76, Home hero 78, page transitions 88, states 89).

## Round 121 · Confirm a return starts at the rack

**Hierarchy audit (Confirm a return, untouched since 76):** the owner's one job is "go and look, then confirm". The page gave them a three-line lead about fees, a split box, the full four-row rule table (the same numbers as the split, a second time) and the button in a side card that on a phone sits below the whole table, about two screens down. Nothing on the page said *where* to look.

**What changed:** the lead is one sentence ("Alice says it's back, 21 minutes ago. Go and look, then confirm."); under it the place: the rack photo and the map pin from the Return step (round 111), so the renter and the owner see the same spot; then the split, which is the answer; the rule table folds into "The rule you set" (closed, with its one-line reason in the summary). On phones a sticky bar carries the amounts and "Confirm it's back" from the first screen; it disappears once the confirmation is done (tested: click → "Done: 5 dollars to you, 45 dollars back to Alice.", bar gone).

**Café test:** at the café you look at the cup before you pay; here you now look at the rack before you confirm. Still missing: a real photo of *this* return (the recorder can't take one; we don't pretend it does).

**References:** Airbnb's host checkout (the place first, then the payout); car-sharing return flows (Zity, ShareNow) that show the parking spot on a map before you end the trip.

**Three ideas:** (1) the place first, the rule folded, a sticky action on phones. (2) A checklist ("locked", "wheels turn", "no new damage") the owner ticks before the button unlocks. (3) Move the split into the side card and leave the left column to the photo.
**Discarded:** (2) the fee is set by the rule, not by the owner's inspection: a damage checklist would suggest the owner can add charges, which the system doesn't do. (3) on phones the side card is far below; the split must stay next to the question.

**Chosen, (1):** [before and after](rounds/121-confirm.jpg), [phone](rounds/121-confirm-375.jpg).

**Test on the blurred shots:** yes: a text column over a table became a photo-and-map band under the question; on the phone a blue button is now on the first screen.

## Round 122 · Composition: after the finder, the Home is one run of bands

**Hierarchy audit (Home, full page at 1440):** six blocks: photo hero, white finder (two screens), dark journey, sand "What if it gets dropped?", photo owners band, dark footer. Each full-bleed band sat 128 px below the one before, so between dark and sand, and between sand and the photo, a white strip appeared that belongs to nothing: on the blurred shot they read as two pale cuts, the page looked unfinished where it should accelerate towards the end.

**What changed:** the bands after the finder meet edge to edge: journey (dark) → try the rule (sand, which turns pink on a strong knock) → owners photo → footer. The white ground stays where it is the ground (between hero and finder, between finder and journey). The page is 256 px shorter (6,348 → 6,092) with nothing removed. Phone checked: 1775→3479, 3479→4633, 4633→5516, no gaps.

**Separation without lines:** the seams were the "divider" here: a white rule 128 px thick. The bands are separated by their own surfaces (ink, sand, photograph) and need no gap.

**Café test:** the café's rooms open one into the next (counter, tables, terrace) without a corridor. Still missing: the finder is two white screens long, the one stretch of the Home that feels like a catalogue, not a place.

**References:** Apple's product pages (full-bleed tiles butt against each other, no gutters between colour fields); Aesop's site (sand, photograph and dark blocks stacked edge to edge).

**Three ideas:** (1) close the seams. (2) Make "try the rule" white so it blends with the seams. (3) Reorder so the try-the-rule comes before the journey.
**Discarded:** (2) the sand is the stage that turns pink on a strong knock: losing the surface loses the one live colour change. (3) the rule makes sense after you've seen the three moments of a rental, not before.

**Chosen, (1):** [full page before, after, and both blurred](rounds/122-home-full.jpg).

**Test on the blurred shots:** yes: two pale cuts disappear; the second half of the page is one continuous run of dark, sand, photo, dark.

## Round 123 · 10 to 15 minutes' walk: a lead bike beside a short list, never three in a row and an orphan

**Hierarchy audit (Home, finder, below the fold):** the near band is one large card, the far band two compact sand rows, but the middle band was three identical cards in a row and a fourth alone on the next line (Vigentina road bike), with half a row of white beside it: the one place in the finder that looked like a template and like a mistake.

**What changed:** the first bike of the band is the lead (half width, 4:3 photo); the others stack beside it as compact rows (square thumbnail, name, walk, price), sand on hover and when selected on the map. The lead's height spans the list (`--rest`, up to four rows). A band of one bike is just the lead, on the left. Checked with the filters (City, E-bike, Up to 2 dollars): lead on the left, list on the right, never an empty left half.

**Separation without lines:** the band title and the change of shape (one photo vs. a list) separate the bands; no rules.

**Café test:** a café's display has one cake on a stand and the rest in a row behind the glass: one thing first. Still missing: the finder still reads cooler than the photographs around it.

**References:** Airbnb's "Inspiration" grid (one large card, then a list); Apple Maps' place guides (lead photo, then compact rows).

**Three ideas:** (1) lead plus list. (2) Two per row (span 3 each). (3) A horizontal strip.
**Discarded:** (2) two rows of two identical cards, which the protocol forbids. (3) a strip hides bikes behind a scroll on desktop, where the map already shows them all.

**Chosen, (1):** [before and after](rounds/123-finder-mid.jpg). Phone unchanged (it has its own peek cards).

**Test on the blurred shots:** yes: a row of three equal blocks and an orphan became one big block beside three small ones.

## Round 124 · Leaving the deposit: the wallet's confirmations are one rail, counted the way the sentence counts them

**Hierarchy audit (Deposit, untouched since 86):** the lead says "it will ask you to confirm 3 times"; below it, four identical sand boxes numbered 1 to 4, the first of which is the owner's ("Nothing to do on your side"). Four equal blocks (a row of identical elements), a count that contradicts the sentence above it, and nothing showing which one is happening now except a blue outline.

**What changed:** the steps are a rail: dots joined by a line that turns blue as each step is done. Only the wallet's confirmations are numbered (1, 2, 3, as the lead says); the owner's step is a small dot with smaller grey text, riding along. The step your wallet is asking for has a filled blue dot, a bold label and "Confirm in your wallet" in blue; done steps get a tick and fade to grey with their "proof" link. The same component serves the owner's Confirm a return and the Add flow, so they get the same rail. Tested the whole run: asking → three ticks → "Unlocked. Enjoy the ride."

**Separation without lines:** the boxes are gone; the connecting line is not a divider but the path itself, and it carries state (grey → blue).

**Café test:** the café's order slip moves along the counter one station at a time; this is now the same: one point lit, the rest waiting. Still missing: the left column is short beside the card at 1440 (the space under the rail is empty).

**References:** Stripe's payment-link checkout steps (one active, the rest muted); Coinbase Wallet's transaction progress (numbered confirmations on a line).

**Three ideas:** (1) the rail, wallet steps numbered. (2) Hide the owner's step. (3) A single progress bar with "1 of 3".
**Discarded:** (2) the owner's step is real and happens first; hiding it would make the first wait unexplained. (3) a bar loses what each confirmation is for, which is what people read in the wallet's pop-up.

**Chosen, (1):** [before and after, wallet asking](rounds/124-deposit.jpg), [phone, done](rounds/124-deposit-375.jpg).

**Test on the blurred shots:** yes: four grey slabs became a line of dots with one blue point.

## Round 125 · A step back: the simulator's amount sits on the card, not in a box inside it

**Hierarchy audit (Rule step and Home "What if it gets dropped?", after 121–124 added pieces elsewhere):** the simulator is a white card; inside it, "You'd get back 45 dollars" sat in a sand box: a box in a box, the only one left in the rent flow. Under the card on the Rule step, two grey bullet points (the only browser bullets in the flow), and the lead repeated "Nobody decides it by hand" one clause after "the hardest knock decides".

**What was removed:** the sand box (the amount and its bar now sit on the card, separated by space; on the Home and on the Rule step); the bullets (now one plain sentence under the card); the repeated clause in the lead. Nothing added.

**Café test:** the café's menu board doesn't frame the price inside another frame. What still isn't as welcoming: the Rule step's left column is a long card while the side card is short; that's the next pass on the Rule step.

**Three ideas:** (1) remove the inner box, the bullets and the repeated clause. (2) Remove the rule table under the simulator (the amount says it already). (3) Remove the chips and keep only the slider.
**Discarded:** (2) the table *is* the rule you accept; the page's title is about it. (3) the chips ("pothole", "falls over") are what make the grams mean something.

**Chosen, (1):** [before and after](rounds/125-rule.jpg). Home checked: same card, cleaner.

**Test on the blurred shots:** yes, slightly: one fewer grey slab inside the card; the amount reads as the card's headline.

## Round 126 · Connect a wallet: the demo wallet is the card's button, the next asks are the Deposit step's rail

**Hierarchy audit (Wallet, untouched since 92):** the step's one action, "Use the demo test wallet", was a pale blue outlined box in the left column that looked like a selected option, not a button; the side card, which on every other step holds the action, had none. Below, "What your wallet will ask next" was a sand box with small numbered circles, a different drawing of the same three steps the Deposit step now shows as a rail (124).

**What changed:** the demo wallet is the side card's primary button (with its "Test money only" line), exactly where "Accept the rule" and "Leave 50 dollars" are on the steps around it. The three asks are drawn as the Deposit step's rail (same dots, same line, same size), so the next screen is recognisable before it arrives. The live-network wallet choices (MetaMask, WalletConnect) stay as options in the column, because there it is a real choice.

**On phones (every rent step):** the side card is below the content, so its first button now rides fixed at the bottom of the screen on Rule, Wallet and Deposit (verified: bottom at 800 px on an 812 px screen); Confirm a return keeps its own bar from 121, and the rule excludes it so there are never two.

**Café test:** at the counter, the till is always in the same place. Still missing: the column is a list of text; the café would show you the thing (a picture of the wallet's pop-up).

**References:** Stripe Checkout (the pay button in the same place on every step); Apple Pay's sheet (what will be asked, in the order it will be asked).

**Three ideas:** (1) action in the card, the asks as the rail, a fixed button on phones. (2) A drawn mock of the wallet's pop-up for each ask. (3) Skip the step in demo mode and connect silently.
**Discarded:** (2) a drawing of a wallet that isn't the user's would look like a real product screenshot and could mislead. (3) the step explains that Sharify never holds the money: skipping it hides the one sentence that matters most here.

**Chosen, (1):** [before and after](rounds/126-wallet.jpg), [phone](rounds/126-wallet-375.jpg). Tested: the button connects and lands on the Deposit step.

**Test on the blurred shots:** yes: a pale box became a blue button in the card; on the phone a blue bar now sits on the first screen.

## Round 127 · Composition: the bike page ends light, then dark

**Hierarchy audit (bike page, full page at 1440, 3,504 px):** gallery (photographs) → the record and the booking card (white) → "How renting works" (dark, 1,180 px) → footer (dark, 492 px). On the blurred shot the bottom half of the page was one black block: the journey and the footer (only a shade apart, #17191b vs #222528) read as a single slab heavier than the bike itself, and the page's real content (the record, the price) became the pale strip between two heavy ends.

**What changed:** on the bike page the journey is a sand band (ink text, grey dotted path, softer photo shadows); the footer goes back to the same ink as everywhere else. The page now steps down: photographs → white record → sand "how it works" → dark footer. The Home keeps its dark journey, where it is the hinge between the finder and the sand "What if it gets dropped?".

**Separation without lines:** three surfaces (white, sand, ink) each meeting edge to edge; no shade-of-black trick needed to tell the journey from the footer.

**Café test:** the café goes from the bright counter to the warm back room to the dark door out; the bike page now has the same descent. Still missing: the record block is the least pictorial part of the page.

**References:** Airbnb's listing page (light all the way down, the darkest thing is the footer); Apple's product pages (a sand "how it works" tile between white and the black footer).

**Three ideas:** (1) sand journey on the bike page. (2) Remove the journey from the bike page. (3) Lighten the footer instead.
**Discarded:** (2) a first-time visitor who lands on a bike from the QR sticker has never seen the Home: the three moments are their only explanation. (3) the dark footer is the site's one constant ending (102); changing it per page would make it look unfinished.

**Chosen, (1):** [full page before, after, both blurred](rounds/127-bike-full.jpg).

**Test on the blurred shots:** yes: the bottom half went from one black slab to a warm band and a short dark end.

## Round 128 · Pairing is a viewfinder

**Hierarchy audit (Add, steps 1, 3, 4, 5, untouched since 74):** the weakest is Pair (3): a small pale-blue square with four corner marks and a monospace caption, a secondary-styled "Scan the QR" beside it, and two thirds of the column empty while the preview card on the right, still blank, outweighed the step. The one action of the step looked like the least important control on the screen.

**What changed:** the step is a camera viewfinder: the photograph of the recorder in a hand, dimmed under a dark stage, white corner brackets, the instruction in white at the top, and "Scan the QR" as the primary button inside the frame. Scanning tightens the brackets and makes them breathe (not under reduced motion); when paired the photo brightens, the brackets turn blue and "✓ Paired" sits at the bottom of the frame. The recorder's facts (ending in 07D2, last signal, battery) are one sand strip of three, without the grey lines they had. The monospace caption is gone.

**Café test:** the café shows the machine, not a diagram of it; here you see the recorder through the camera you'll use. Still missing: steps 4 (an empty "Add a photo" box) and 5 (a long form) are still forms first.

**References:** Apple's AirTag/AirPods pairing sheet (the object, large, with one button under it); bank apps' cheque-scan screens (a dark viewfinder, corner guides, the instruction on top).

**Three ideas:** (1) a viewfinder stage with the action inside. (2) Open the real camera (getUserMedia) in demo mode too. (3) A three-step illustration of where the QR is.
**Discarded:** (2) the demo has no real recorder to scan; a live camera that can't find anything would fail every time. (3) a drawing where the photograph exists (same reason as 119).

**Chosen, (1):** [before and after](rounds/128-pair.jpg), [idle and paired](rounds/128-pair-found.jpg). Tested: Scan → Paired → Continue enabled; preview card ticks "Recorder ending in 07D2".

**Test on the blurred shots:** yes: a pale square and a grey button became a dark photographic frame with a blue button in it.

## Round 129 · "Your bike": the photo is added where renters will see it

**Hierarchy audit (Add, step 4):** two empty photo boxes on the same screen: a small dashed "Add a photo" (monospace, dashed border, both leftovers) in the form, and a large "Your photo" placeholder in the preview card on the right. The eye went to the big empty one, which did nothing when clicked; the small one that worked looked like a disabled field.

**What changed:** the photo is added in the preview card itself: its photo area is the upload (a black "+" disc, "Add a photo of your bike", "In daylight, the whole bike, where it's parked."; sand that darkens on hover; a focus ring for the keyboard; "Change photo" as a frosted pill once there is one). The form keeps only the words (name, type, where it's parked) under a one-line lead. On phones the card comes first on this step (the other steps keep it after the form), without its "How renters will see it" label.

**Separation without lines:** the dashed border is gone; the upload is a surface (sand) inside the card.

**Café test:** at the café you put your cake in the window where people will see it, not on a form about the window. Still missing: step 5 (the rules) is the longest form in the site.

**References:** Airbnb's listing editor (the photo is edited on the listing preview); Vinted's "sell" flow (the photo slot is the first, largest thing).

**Three ideas:** (1) upload in the preview card. (2) A large drop zone at the top of the form. (3) Keep both, label the preview "preview only".
**Discarded:** (2) still two photo areas on screen. (3) a label to explain a confusion is worse than removing it.

**Chosen, (1):** [before and after](rounds/129-yourbike.jpg), [phone](rounds/129-yourbike-375.jpg).

**Test on the blurred shots:** yes: a grey square left of the form disappears; the card's photo area now carries a dark point, so the eye lands on it.

## Round 130 · A step back: what 121–129 left behind

**Hierarchy audit (the screens touched in this block, rechecked):** Confirm a return on a phone had two "Confirm it's back" buttons (the sticky bar from 121 and the card's, further down); the CSS still carried the dashed photo box (gone from the page in 129) and the outlined "primary" wallet option (gone in 126).

**What was removed:** the card's button on phones on Confirm a return (the bar is the one action; verified: one visible button at 375 and at 1440); the `.photo` and `.wallet-opt.primary` rules. Nothing added.

**Café test:** a good café clears the cups as it goes. Still missing: the owner side of the site (My bikes, Add) is still whiter and emptier than the renter side.

**Three ideas:** (1) remove the duplicate and the dead rules. (2) Merge the two rails' CSS (tx-steps and ahead-list) into one class. (3) Remove the "How renters will see it" label everywhere.
**Discarded:** (2) one is live state, the other a static preview: the same look on purpose, but merging the markup would mean faking transaction steps before a wallet exists. (3) on desktop the label is what tells the owner the card is a preview, not their published listing.

**Chosen, (1).** No visual sheet: the only visible change is one button fewer on a phone.

**Test on the blurred shots:** not applicable beyond the phone: one blue bar instead of a bar plus a second blue block below.

## Block 121 to 130 (summary)

Block 121–130 worked through the oldest screens in the register and two composition passes. Confirm a return starts at the rack (121). The Home's bands after the finder meet edge to edge (122). The finder's middle band is a lead bike beside a list (123). The wallet's confirmations are one rail, numbered as the sentence counts them (124). The simulator lost its box in a box (125, step back). Connect a wallet has its action in the card, and every rent step keeps its action reachable on a phone (126). The bike page ends sand-then-dark (127). Pairing is a viewfinder (128). The bike's photo is added in the preview card (129). This round cleaned up after them. Lines in `src`: about 7,860 of the 10,560 cap. Next: My bikes and the Add flow's rules step (owner side, whitest part of the site), Home hero (78), page transitions (88), states (89), the live rental pill (94).

## Round 131 · "Your rules": the card shows the rule renters will accept; each row says its dollars

**Hierarchy audit (Add, step 5, the longest form):** price and deposit; three sand rows of inputs (identical boxes); a grey hint; then "What renters will see" and the same rule again as a table, below the inputs; and on the right the listing preview with its empty "Your photo" block, which has nothing to do with the rules. The owner typed percentages and had to scroll to learn what they meant in dollars.

**What changed:** the right card on this step is the rule as renters will see it (bike name, price and deposit, the four tiers in dollars), live as you type; when the levels are wrong it shows the error there. In the form each knock row ends with its dollars ("That is 20 dollars", strong in orange), so the percentage is never alone. The rows lost their sand boxes (inputs on the page, spacing between them); the duplicated table under the form is gone. On phones the dollars column hides (the card follows the form and shows them), checked: no horizontal overflow at 375.

**Separation without lines:** the table's header and cell borders stay off; rows are separated by the inputs' own height and 12 px.

**Café test:** the café's price board shows the price you'll pay, not the margin; the owner now sees dollars, not only percentages. Still missing: an image; this is the one owner step without a picture, and it's fine as a form.

**References:** Stripe's pricing editor (the customer-facing price preview beside the inputs); Airbnb's pricing step (your input on the left, "guest pays" on the right).

**Three ideas:** (1) rule card on the right, dollars in each row. (2) A single slider per tier. (3) Presets ("gentle", "standard", "strict") instead of numbers.
**Discarded:** (2) the levels have to go up (light < medium < strong): three sliders that can cross each other make the error easier, not harder. (3) presets would invent a policy the contracts don't name; the suggested numbers already come from the bike's type.

**Chosen, (1):** [before and after](rounds/131-rules.jpg).

**Test on the blurred shots:** yes: three grey slabs on the left and an empty block on the right became a clean column of inputs and a card with four orange marks.

## Round 132 · Composition: with one bike, the bike is the poster of My bikes

**Hierarchy audit (My bikes, full page at 1440, 1,346 px):** the title, the dark "Today" ribbon, then three equal-weight objects in a row (the bike's photo, a sand "Add a bike" tile of the same size, the earnings card), then 224 px of white before the footer. In the blurred shot the heaviest things were the ribbon and the empty sand tile; the owner's actual bike was a third of a row.

**What changed:** when the owner has one bike, its photo takes the whole column (16:9, name at 22 px) beside the earnings card; "Add a bike" becomes a sand row under it (the "+" disc, the name, the one-line promise on the right; stacked on a phone). With two or more bikes the grid is unchanged. On working screens the footer no longer adds its 128 px margin to the page's padding: 96 px of white before it instead of 224.

**Separation without lines:** the row is a surface, not a bordered box; the white before the footer is one step of the spacing scale.

**Café test:** the café's window shows its best cake large, not one of three equal plates. Still missing: the Today ribbon is still the darkest thing on the page on a quiet day.

**References:** Airbnb's host "Listings" with a single listing (one large card, the "create" action as a row); Strava's single-bike gear page (the bike, big, the stats beside it).

**Three ideas:** (1) the bike as the poster, "Add" as a row. (2) Move the earnings into the Today ribbon. (3) Lighten the ribbon on quiet days.
**Discarded:** (2) the ribbon is about today; earnings are all-time, mixing them would mislabel one of them. (3) worth a round of its own (the ribbon's states), not a side effect here.

**Chosen, (1):** [full page before, after, blurred](rounds/132-mybikes-full.jpg) (taken before the footer gap fix).

**Test on the blurred shots:** yes: three equal blocks became one large photograph beside a card, with a slim row under it.

## Round 133 · The hero: the proposition on the left, the bike that's free now pinned on the photo

**Hierarchy audit (Home hero, untouched since 78):** one white card held four things (headline, sentence, button, and the "Free now" demo bike row), 585 px tall over a 774 px photo: the card covered the canal's facades and the cyclist's bike, and the live fact (the one thing that changes) sat inside the card as its fourth line, like a footnote. Bug found: "2 min walkfrom Bocconi" (the flex row swallowed the space before the phone-hidden span).

**What changed:** the card keeps the proposition (headline, sentence, button) and is 117 px shorter; the free bike becomes its own frosted card pinned to the photo's bottom right (photo, "Free now, 2 min walk from Bocconi", name, price and deposit, white on hover). The facades and the rider are uncovered. On phones it stays in the flow right after the hero card. The missing space is fixed with a non-breaking space.

**Separation without lines:** two surfaces on one photograph, at the two ends of the same baseline.

**Café test:** the café's sign says what it is; the chalk board by the door says what's fresh today. Two objects, two jobs. Still missing: nothing in the hero moves with the real state except that card (it hides when the demo bike is out, as before).

**References:** Airbnb's experiences hero (the proposition card and a live "available" card on the photo); Apple's store pages (a pinned availability chip on the hero photo).

**Three ideas:** (1) split the live fact out of the card. (2) Text directly on the photo with a scrim, no card. (3) Card straddling the photo's bottom edge.
**Discarded:** (2) the canal photo is bright: white text needs a heavy scrim that would grey the picture. (3) the hero clips its overflow for the scroll drift; straddling would mean rebuilding that.

**Chosen, (1):** [before and after](rounds/133-hero.jpg).

**Test on the blurred shots:** yes: one big white block became a block and a small frosted one; more photograph in the top half.

## Round 134 · States: when the chain doesn't answer, the finder says so

**Hierarchy audit (states across the site, untouched since 89):** checked loading (bike page skeleton: fine), the bike page's chain error (a clear card: fine), empty fleet, and the Home finder with the chain down. The last one was wrong: "0 free to borrow, nearest first" and "No bike matches. Show all bikes", a filter message with a button that did nothing, for an outage. On a phone the sheet said "0 bikes". While the first requests were retrying it showed the same "0" for several seconds.

**What changed:** the finder has four distinct states, each with its own words. Loading: "Looking for bikes near you…". Down (from the first failed attempt, not after all retries): the sentence under the title says the map reads the bikes from the blockchain and it isn't answering; a sand card with the orange state dot says "No bikes to show until it answers", that we don't show a copy from our own server, that it retries by itself, and has "Try again now" (the query's refetch); the map's legend and "Near me" hide. No match for a filter: the old message, now only when a filter is on. Nothing free: "No bike is free right now. Bikes come back on the map when their ride ends." The phone sheet's handle says "No connection to the chain" or "Looking for bikes…" instead of "0 bikes". Normal state checked unchanged ("10 free to borrow…").

**Café test:** when the café's machine is broken, there's a note on it, not an empty cup. Still missing: the down state has no picture; the bike page's error card has the same shape, which is at least consistent.

**References:** Citymapper's "live times unavailable" (says the source is down, keeps the map); Stripe's dashboard degraded-service card (what's down, that it retries, a retry button).

**Three ideas:** (1) four honest states in the finder. (2) Show the last known fleet with a "may be out of date" label. (3) Hide the finder entirely when down.
**Discarded:** (2) the site's promise is to show only what the chain says (the same reason the bike page refuses a cached copy). (3) the Home would lose its middle without explaining why.

**Chosen, (1):** [before and after, chain down](rounds/134-finder-down.jpg).

**Test on the blurred shots:** yes: an empty column became a sand card with an orange point and a blue button.

## Round 135 · A step back: "Today" loses its black slab

**Hierarchy audit (My bikes, after 132 made the bike the poster):** the "Today" ribbon was still a full-width black slab above the photo; on the blurred shot it was the first and heaviest thing, on a screen whose title says "Nothing needs you right now." Round 120 decided that on working screens the only dark surface is the footer; the ribbon was the exception.

**What was removed:** the black: the ribbon is sand, the track white with a hairline edge, the hour ticks and "now" in ink. The marks (blue rides, orange knocks) are now the only colour in it. Nothing added, nothing moved.

**Café test:** the café's day sheet hangs on the wall; it doesn't block the window. Still missing: when there are no rides today, the ribbon is an empty track (it was 114's choice to keep it; still right, the empty day is information).

**Three ideas:** (1) sand ribbon. (2) Hide the ribbon on quiet days. (3) Move it under the bike.
**Discarded:** (2) "no rides today" is something the owner wants to know. (3) the ribbon is the page's answer to "what happened today", which comes before the inventory.

**Chosen, (1):** [before and after](rounds/135-today.jpg) (before reconstructed by re-applying the old colours in the browser).

**Test on the blurred shots:** yes: the black band at the top is gone; the bike photo is the darkest, largest thing on the page.

## Round 136 · Motion: the photo you click becomes the bike page's photo

**Hierarchy audit (page transitions, untouched since 88):** every page change was the same short cross-fade of the whole page, with the header held still. Going from the Home's "Free now: the demo bike" card or a My bikes tile to the bike page, the small photo you pressed vanished and a large photo of the same bike appeared elsewhere: the one continuity the eye could follow was thrown away.

**What changed:** a shared-element view transition. The photo inside the link you click is named `bike-photo` just before the change (only that one, so no two elements share the name), and the bike page's main photo carries the same name: the thumbnail grows into the gallery's main picture in 0.42 s while the rest cross-fades. For it to have something to land on, the bike's data is warmed before the click: on hover, focus or press, the Home prefetches the bike and the network; a My bikes tile puts the bike it already has into the cache. Without a warm cache (a very fast tap on a slow network) it falls back to the old cross-fade. Off with reduced motion (the router skips view transitions entirely, as before).

**Mid-animation frames:** [three frames at 6× slower](rounds/136-photo-transition.jpg): the thumbnail leaves its card, grows over the fading Home, lands in the gallery.

**Café test:** when the waiter brings what you pointed at in the window, it's the same cake. Still missing: the same continuity from the finder's cards (they select on the map rather than navigate; their "See the bike" link does carry it from the map's mini card).

**References:** the iOS Photos app (the thumbnail opens into the photo); Airbnb's listing open on mobile web (the card's photo expands into the listing's).

**Three ideas:** (1) shared photo transition with prefetch. (2) Slide pages left/right by flow direction. (3) Keep the cross-fade, make it longer.
**Discarded:** (2) the site isn't a stack: Home → bike → rent is mostly forward, but the header links jump anywhere, and sideways slides would lie about where you are. (3) longer only makes the disappearing photo more noticeable.

**Chosen, (1).** Probed: during the transition `::view-transition-group(bike-photo)`, `old` and `new` all exist.

**Test on the blurred shots:** at rest nothing changes; in motion, one picture travels instead of two blinking.

## Rotation register

Nothing is final: when every screen has had a round, the rotation starts again from the first, with the same protocol. This table says which round last touched each screen.

| Screen | Last round |
|---|---|
| Home: hero | 133 |
| Home: journey (dark band) | 102 |
| Bike page: "how it works" band | 127 (sand journey) |
| Home: owners band | 108 |
| Home: try the rule (and Rule step) | 104 (bands joined: 122) |
| Home: find a bike (grid + map) | 123 |
| Header | 106 |
| Page transitions | 136 (shared photo) |
| Live rental strip | 94 |
| Footer | 120 (wordmark only on reading pages) |
| Bike page | 107 (proof mode: 100) |
| Rent flow: Rule | 125 (step back) |
| Rent flow: Deposit | 124 |
| Rent flow: Wallet | 126 |
| Rent flow: Ride | 116 |
| Rent flow: Waiting | 118 |
| Rent flow: Return | 111 |
| Rent flow: Outcome | 91 |
| Receipt | 113 (print: 97) |
| My rentals | 117 |
| Owner (My bikes) | 132, 135 (step back) |
| Owner: Confirm a return | 121 |
| Add a bike | 119 (step 2), 128 (step 3), 129 (step 4), 131 (step 5) |
| Verify | 109 |
| Empty, loading and error states | 134 (finder) |
| Design | 112 |
