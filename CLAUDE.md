# <project name>

<One sentence: what this repo is and who uses it. Replace this line.>

Applies only when editing this repo. One thread edits one repo; other repos are read-only context.

## Commands
`make setup` · `make check` (every hook, types, tests, history secret scan) · `make scan` (semgrep + trivy, needs network) · `make site-check` · page preview: `make preview` (http://127.0.0.1:8000)

## Rules
- Role: Claude reads, audits, and proposes. Duke runs anything that touches real infra (Proxmox, OPNsense, Tailscale, cloud). Hand him the exact command and what it does.
- No secrets in git. `.env.example` names variables; `.env` is gitignored and written by hand.
- Never guess addresses, hostnames, or hardware. Use `.env` / confirmed docs, or ask.
- Tests first for logic. Decisions with trade-offs get an ADR in `docs/adr/`.
- New GitHub Action: pin by full SHA with a `# vX.Y.Z` comment. No tag pins.
- Branch + PR for every change. No direct pushes to main.
- Docs, README and `site/project.json` follow `docs/STYLE.md` (Mission Control): plain English for non-tech readers, Why / Do / Check / Undo, FACT/INFERENCE/ASSUMPTION labels.
- `site/ds/` and `site/vendor/` are byte-locked copies. Never edit them; sync with `docs/runbooks/sync-design-system.md`. Work around design-system bugs in `site/app.js` / `site/app.css` and list them in `docs/design-system-fixes.md`.

## Gotchas
- Permission rules match each subcommand separately; `curl x | sh` is caught by the `Bash(sh)` deny, not a `curl` rule.
- A semgrep run that loads no rules can look like a pass. `make scan` and CI fail when the rule count is 0.
- Hooks run via `bash <path>`, so they work without the exec bit (network mounts drop it).
- `uvx` ignores `exclude-newer` in pyproject.toml, so the Makefile and CI set `UV_EXCLUDE_NEWER` for it. Keep the cooldown, the uv version in CI and the tool versions equal across files; `tests/test_policy.py` fails on drift.
- Dependabot can't bump the uv `version:` in the workflows. Bump it by hand to a release at least 7 days old.
- `pre-commit run --all-files` only sees files git knows. `git add` new files before `make lint`.
- The commit hook runs pre-commit from uv's cache. After `uv cache clean`, commits fail with "`pre-commit` not found" until you run `make setup` again.
- The page needs a web server: opened from disk, it can't read `project.json`.
