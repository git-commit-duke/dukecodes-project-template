# CONTEXT: <project name>

Vocabulary for this repo. Use these terms; avoid the synonyms noted. Add the project's own terms below the shared ones.

## Shared across every repo

- **Ledger**: GitHub Issues on this repo. The durable record of what is planned, in progress, and decided.
- **Gate**: a deterministic check that blocks work: a hook, a permission rule, a CI job, a ruleset. Fixed, not argued with.
- **Baseline**: the free GitHub-native security set enabled at creation: Dependabot alerts, security updates, secret scanning, push protection. Public repos add dependency review and a ruleset.
- **Maintainer**: the review role (a subagent) that ACKs or NACKs a diff before it is committed.
- **Checkpoint**: the end-of-task ritual: verify, review, commit, push a branch, update the pull request and the ledger.
- **ADR**: an architecture decision record under `docs/adr/`. One decision per file, numbered, never edited after acceptance; superseded instead.
- **Cloud session**: a Claude Code session on Anthropic's infrastructure, holding one clone of this repo. It sees only what is committed. Not "remote agent".
- **Throwaway clone**: a local checkout that may be deleted at any time because everything in it is pushed. Not "workspace".

## This project

<Add terms as they are settled. If a term is not here, either the project does not use it yet or it needs a decision.>
