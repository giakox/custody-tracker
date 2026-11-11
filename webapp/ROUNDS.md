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

## Rotation register

Nothing is final: when every screen has had a round, the rotation starts again from the first, with the same protocol. This table says which round last touched each screen.

| Screen | Last round |
|---|---|
| Home: hero and story | 62 |
| Home: find a bike (grid + map) | Structure |
| Header | Structure |
| Footer | — |
| Bike page | 65 |
| Rent flow: Rule, Wallet, Deposit | 66 |
| Rent flow: Ride, Return, Waiting, Outcome | 67 |
| Receipt and My rentals | 68 |
| Owner (My bikes) | 69 |
| Add a bike | 63 |
| Verify | — |
| Design | — |
