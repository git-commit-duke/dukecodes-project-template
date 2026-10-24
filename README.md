# dukecodes-project-template

Base for every new DevSecOps project, lab, workspace, and device setup.
Security gates are on from the first commit: secret scanning, SAST, dependency and IaC scanning, GitHub Actions audit, and Claude Code guardrails.

## Start a new project

1. On GitHub: **Use this template** → **Create a new repository** (private by default).
2. Clone it, then:

   ```bash
   make init NAME=my-project   # renames the package, resets README title
   make setup                  # uv sync + pre-commit hooks installed
   make check                  # lint + test + scan, same gates as CI
   ```

3. Fill in `CLAUDE.md` line 3 (what the repo is) and `pyproject.toml` authors.
4. Record the first real decision in `docs/adr/`.

New device or cloud workspace with no local tooling: open in the dev container (`.devcontainer/`) or a Codespace. Everything in `make setup` runs inside it.

## What runs where

| Gate | Local (pre-commit) | CI |
|------|--------------------|----|
| Secrets (gitleaks) | yes | yes |
| Python lint/format (ruff) | yes | yes |
| Tests (pytest) | `make test` | yes |
| Shell (shellcheck), YAML (yamllint) | yes | yes |
| Actions lint + audit (actionlint, zizmor) | yes | yes |
| SAST (semgrep) | `make scan` | yes |
| Deps + IaC + secrets (trivy fs/config) | `make scan` | yes |

## Layout

```
.claude/            settings.json (deny/ask rules, hooks), hooks/, rules/ (path-scoped)
.devcontainer/      reproducible workspace for new devices/Codespaces
.github/            CI, Dependabot, CODEOWNERS, PR + issue templates
docs/adr/           decisions (context, decision, pros, cons)
scripts/            init + helper scripts
src/app/, tests/    Python package (default stack; delete if unused)
```

Non-Python project: delete `src/`, `tests/`, `pyproject.toml`, `uv.lock`, the `test` CI job, and the ruff hooks. Keep everything else.

## Keeping it current

Dependabot opens weekly PRs for Actions (SHA pins), uv, Docker, and dev container features. `make update-hooks` bumps pre-commit revs.
