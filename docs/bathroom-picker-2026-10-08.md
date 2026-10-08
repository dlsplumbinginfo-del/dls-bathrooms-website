# Bathroom picker expansion — 8 October 2026

70 concepts: existing 50 inspiration images retained, plus 20 dimensional layout concepts (51–70). Every customiser now uses a live 3D material/layout preview. These are approximate style models, not manufacturer CAD or surveyed installation drawings. Original inspiration images remain available in a separate tab.

New concepts cover tiny cloakrooms, narrow ensuites, compact square rooms, family baths, L-shaped projections, recessed showers, loft/understairs ceilings, offset entrances, windows, clean walls, half/full service walls and slim ledges. Gallery size/shape filters use concept footprints, not measurements inferred from the photos.

25 wall tile choices: 15 existing premium directions and 10 Tile Mountain value directions. Existing supplier sample photos are retained; missing photos have clearly labelled procedural illustrative swatches. Quoted prices are dated guide references, not installed prices or stock promises. Floor choices follow recorded bathroom-floor suitability. Wetroom mode only offers tiles explicitly marked suitable in the source bank, with drain/former/tanking still requiring a separate specification.

Scudo furniture packages (15 alternatives plus the starting furniture), 9 mirror menu options including the starting mirror, coordinated finishes, requested furniture widths/worktops, toilet type, niche, room dimensions/shape, boxing/ledges, coverage, tile direction, grout and lighting direction are supported. Product-specific limitations are flagged rather than inventing matching codes. Straight baths and some finish-specific bathscreen codes still need final supplier confirmation; bath filler, waste/overflow and support/panels are flagged where absent.

Customer workflow: undo/redo, six saved versions per room on the current device, complete state in shareable links, product list download, WhatsApp draft and prefilled quote form. Nothing is sent automatically. A floating mobile thumbnail lets customers return to the live room while browsing controls.

## Source checks

- Tile Mountain: Mylos Ivory, Marmostone Grey/Ivory/Anthracite, Boscostone Grey/Beige, Everlast Sand, Jaya Beige, Dakaris Haya and Baltico Beige product pages. Ordinary R9 floors are not assumed suitable for wetroom falls.
- Mandarin Stone: bathroom collections and existing linked Fusion, Hoxton, Violetta, Jakob, Carrara, Pebble and Nordic directions. Violetta wetroom suitability updated from the supplier page. Existing 5 October source checks remain dated accordingly.
- Scudo: Spa close-coupled WC COMPLETE-TOILET-SET-2; Lunar 600 LUNAR60; Thalia single screen CHR/BB/BZ codes from official product/datasheet pages. Existing furniture/finish bank retained.
- Virtue's exact Liverpool portfolio could not be independently confirmed/accessed during this run. No claim is made that the new models reproduce its installations. Broader high-end tile/material styling informed the variations.

## Verification

- All 70 rooms loaded with a live WebGL model, changed wall material pixels and matching product links, and passed undo/redo/reset checks.
- Additional checks exercised all 25 wall tiles, furniture and mirror menu options, all five metal finishes, layout/boxing/coverage/toilet/worktop/pattern/grout/light/niche controls, dimensions, wetroom filtering, saved version, shared state, product-list download and quote prefill.
- Revised loft geometry was rechecked for rooms 59/60 after visual review; all customer workflow checks then passed with zero page errors.
- Gallery suite passed at desktop, 390px and 320px: all 70 cards, favourites, shortlist, guided suggestions, sharing, browser Back, no-JS fallback and preserved 80 real-work photos.
- Broad existing website suite: picker counts, routes, desktop/mobile overflow, quote submission construction and script/style loading passed. Two pre-existing homepage Facebook-review wording assertions fail (98% / 40 reviews); homepage content was not changed by this update.

Run `tools/verify_live_picker.cjs` with Playwright available. `PICKER_BROWSER` optionally selects an installed Chromium executable. `PICKER_LOOKS` optionally limits room regression checks after a specific layout edit. Gallery preview images are captured from the actual live renderer, not fabricated photographs.
