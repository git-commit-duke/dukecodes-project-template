---
paths: ["site/**", "docs/**", "README.md"]
---
# Site and docs
- Follow `docs/STYLE.md`: plain English, Why / Do / Check / Undo, FACT/INFERENCE/ASSUMPTION labels, risk badges.
- Page content goes in `site/project.json`. Don't edit `mc-tokens.css`, `mc-components.css` or `mc.js` here; change them in dukecodes-project-template and sync.
- `mc.js` escapes all text and only renders `code` in backticks. Never add innerHTML from unescaped data.
- Never publish real IPs, hostnames, serials, or tailnet names. Use RFC 5737 examples (192.0.2.0/24).
