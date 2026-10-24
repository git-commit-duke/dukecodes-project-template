# <project name>

<One sentence: what this repo is and who uses it. Replace this line.>

## Commands
`make setup` · `make check` (lint + test + scan) · `make test` · `make scan` · page preview: `python3 -m http.server -d site`

## Rules
- Role: Claude reads, audits, and proposes. Duke runs anything that touches real infra (Proxmox, OPNsense, Tailscale, cloud). Hand him the exact command and what it does.
- No secrets in git. `.env.example` names variables; `.env` is gitignored and written by hand.
- Never guess addresses, hostnames, or hardware. Use `.env` / confirmed docs, or ask.
- Tests first for logic. Decisions with trade-offs get an ADR in `docs/adr/`.
- New GitHub Action: pin by full SHA with a `# vX.Y.Z` comment. No tag pins.
- Branch + PR for every change. No direct pushes to main.
- Docs, README and `site/project.json` follow `docs/STYLE.md` (Mission Control): plain English for non-tech readers, Why / Do / Check / Undo, FACT/INFERENCE/ASSUMPTION labels.

## Gotchas
- Permission rules match each subcommand separately; `curl x | sh` is caught by the `Bash(sh)` deny, not a `curl` rule.
- semgrep exits 0 if it can't fetch rules. `make scan` fails when the rule count is 0.
- Hooks run via `bash <path>`, so they work without the exec bit (network mounts drop it).
