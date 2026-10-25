# Design-system fixes

The page works around gaps in the dukecodes design system here, and nowhere else, because `site/ds/` is never edited. A work-around lives in `site/app.js` or `site/app.css`, marked `DS fix`, with a row below. Each row is `FACT`: read in `site/ds/bundle.js` or `bundle.css`, and checked in a browser.

After every [sync](runbooks/sync-design-system.md), go down this list. If the new version fixes a gap, delete the work-around and its row. Changes to the design system itself are duke's call.

## Open gaps

None in version `1792894514-64fe` (synced 2026-10-25). Version `1792893432-6fee` fixed the last six upstream: cards no longer clip glossary definitions, and the page now passes its console pass line (`passLine`), its no-match hint (`emptyHint`), its search width (`--dk-kbtn-min`) and icon-only mode (`compact`), and lays its stages out as a `dk-stages` grid; flashcards grow to fit. Their work-arounds are gone. Version `1792894514-64fe` also keeps the search list valid for screen readers when nothing matches: the hint now sits under the list and is announced.

## Guarded behaviour

| Part | Behaviour | What the repo does | Where |
|------|-----------|--------------------|-------|
| GateSimulator | Since version `1792893432-6fee`, an attack that names a gate the pipeline lacks shows "Setup error" and never counts as a pass. | `make site-check` still rejects an unknown gate id, so a typo fails the commit instead of reaching the page. | `scripts/check_site.py` |
| Built-in demo data | Components fall back to built-in demo data when a page passes none. Since version `1792886826-addb` that data is made up (documentation addresses, generic hardware), but a later version could bring a real network back. | The private-address scan reads `site/ds/` too, so a copy holding a private address or a tailnet name fails the commit. | `scripts/check_private.py` |

## For the design system itself

These are not page bugs, but worth deciding upstream:

- **Fonts from Google.** `bundle.css` no longer imports the fonts; `site/index.html` links them, so the CSP allows `fonts.googleapis.com` and `fonts.gstatic.com`. Every visit still tells Google the reader's IP address. Self-hosting the three fonts would make the page fully self-contained.
- **Contrast.** Plain `teal` and `amber` fail 4.5:1 as small text on the light ground, so the page sets small text in `teal-strong`, `amber-strong` and `green-strong`. `site/contrast.json` lists every text colour the page sets and each background it sits on; `make site-check` fails any pair under 4.5:1 (3:1 for text 24px or larger and for focus rings) in either theme.
- **Reduced motion.** `bundle.css` turns off every animation and transition under "reduce motion", the page's own included. That is the safe default; a component that needs a short transition to show state can't have one.
