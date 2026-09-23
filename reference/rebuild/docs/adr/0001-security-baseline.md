# ADR-0001: GitHub-native security baseline before paid scanners

Date: 2026-09-22
Status: accepted

## Context

This repository is public portfolio work maintained by one person. GitHub offers Dependabot alerts and security updates, secret scanning, push protection, private vulnerability reporting, dependency review and branch rulesets at no cost on public repositories. On GitHub Free, private repositories get Dependabot but not rulesets, secret scanning, push protection or dependency review.

## Decision

Every repository runs `scripts/protect-repo.sh` once after creation. It turns on the baseline the repository's visibility allows and applies the ruleset in `.github/rulesets/main.json`. Every pull request runs the `universal` CI job: gitleaks, Semgrep, actionlint, zizmor and the repository's self-tests. Public repositories also run dependency review. A paid scanner is added only when a threat model names a gap this baseline leaves, recorded in its own ADR.

## Consequences

- A private repository on GitHub Free has weaker gates: its protection is the hooks and CI alone, and its README says so.
- `protect-repo.sh --check` detects drift, so a setting switched off by hand is visible.
- Semgrep reads its rules from a registry. If the registry is unreachable, every merge blocks; the owner may set the ruleset's enforcement to Disabled, merge, re-enable it, and confirm with `protect-repo.sh --check`.
- Every later tool must name the gap it closes.
