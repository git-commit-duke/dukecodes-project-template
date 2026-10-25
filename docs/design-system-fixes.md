# Design-system fixes

The page works around these gaps in the Dukecodes Design System (version `1792886826-addb`, synced 2026-10-25). Each one is `FACT`: read in `site/ds/bundle.js` or `bundle.css`, and checked in a browser. The work-arounds live in `site/app.js` and `site/app.css`, marked `DS fix`, because `site/ds/` is never edited.

After every [sync](runbooks/sync-design-system.md), go down this list. If the new version fixes a gap, delete the work-around and its row. Changes to the design system itself are duke's call.

## Open gaps

| Part | Gap | What the page does | Where |
|------|-----|--------------------|-------|
| StepCard, BentoCard | `overflow: hidden` clips a glossary definition that opens inside the card. | Sets `overflow: visible`, and lifts a hovered or focused bento card above its neighbours. | `.pg-stepwrap` and `.pg-why` in app.css |
| LiveConsole | Prints a hard-coded pass line: "✓ all gates green · deployed to lab". | Hides that line from sight and from screen readers, and shows `console.passLine` from project.json in its place. | `ConsolePanel` in app.js, `.pg-console` in app.css |
| CommandPalette | The no-match hint names a Minirack step: "Try a step ID like pve-11." | Hides it the same way and shows a hint about this page's steps. | `Palette` in app.js, `.pg-palette` in app.css |
| CommandPalette | The trigger is at least 260px wide, too wide for a phone header. | 230px on desktop; on phones, the icon only. | `.pg-palette` in app.css |
| StageCard | Fixed 160px wide, so cards don't fill the row. | Width 100% in an auto-fitting grid. | `.pg-stages` in app.css |
| Flashcards | A fixed 170px card cuts off long answers on a phone. | 210px below 560px wide. | `.pg-flash` in app.css |

`FACT`: a screen reader gets the page's text, not the hidden one. Chrome's accessibility tree was read for both swapped lines on 2026-10-24.

## Guarded behaviour

| Part | Behaviour | What the repo does | Where |
|------|-----------|--------------------|-------|
| GateSimulator | An attack that names a gate that doesn't exist gets through every gate, with only a console warning. | `make site-check` rejects an unknown gate id, so the page never shows an attack sailing through by mistake. | `scripts/check_site.py` |
| Built-in demo data | Components fall back to built-in demo data when a page passes none. Since version `1792886826-addb` that data is made up (documentation addresses, generic hardware), but a later version could bring a real network back. | The private-address scan reads `site/ds/` too, so a copy holding a private address or a tailnet name fails the commit. | `scripts/check_private.py` |

## For the design system itself

These are not page bugs, but worth deciding upstream:

- **Fonts from Google.** `bundle.css` no longer imports the fonts; `site/index.html` links them, so the CSP allows `fonts.googleapis.com` and `fonts.gstatic.com`. Every visit still tells Google the reader's IP address. Self-hosting the three fonts would make the page fully self-contained.
- **Contrast.** Plain `teal` and `amber` fail 4.5:1 as small text on the light ground, so the page sets small text in `teal-strong`, `amber-strong` and `green-strong`. `site/contrast.json` lists every text colour the page sets and each background it sits on; `make site-check` fails any pair under 4.5:1 (3:1 for text 24px or larger and for focus rings) in either theme.
- **Reduced motion.** `bundle.css` turns off every animation and transition under "reduce motion", the page's own included. That is the safe default; a component that needs a short transition to show state can't have one.
