---
paths: ["site/**", "docs/**", "README.md"]
---
# Site and docs
- Follow `docs/STYLE.md`: plain English, Why / Do / Check / Undo, truth labels, confidence, risk.
- Page content goes in `site/project.json`. Run `make site-check` after every edit.
- `site/ds/` and `site/vendor/` are vendored and byte-locked. Never edit them; sync with `docs/runbooks/sync-design-system.md`.
- `site/app.js` builds every element with React, so text is never parsed as HTML. No innerHTML, eval, string timers, RegExp built from data, or fetch beyond a relative file: `make site-check` fails on each.
- The CSP in `site/index.html` is a security control. Change it only together with `REQUIRED_CSP` in `scripts/check_site.py`, and say why in the PR.
- Never publish real IPs, hostnames, serials, or tailnet names. Use RFC 5737 examples (192.0.2.0/24).
