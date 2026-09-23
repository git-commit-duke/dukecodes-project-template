# CONTEXT: <project name>

Vocabulary for this repo. Use these terms and avoid the synonyms noted. Add the project's own terms below the shared ones.

## Shared across every repo

- **Ledger**: GitHub Issues on this repo; the durable record of what is planned, in progress and decided.
- **Gate**: a deterministic check that blocks work: a permission rule, a hook, a CI job, a ruleset. Fixed, not argued with.
- **Baseline**: the GitHub security features `scripts/protect-repo.sh` turns on for the repo's visibility.
- **Maintainer**: the review role (the `maintainer` agent) that ACKs or NACKs a diff before it is committed.
- **Checkpoint**: the end-of-slice ritual in `/checkpoint`: verify, review, commit, push, pull request, ledger.
- **ADR**: a decision record under `docs/adr/`; one decision per file, never edited after acceptance, superseded instead.
- **Cloud session**: a Claude Code session on Anthropic's infrastructure holding one clone of this repo. It sees only what is committed. Not "remote agent".
- **Throwaway clone**: a local checkout that can be deleted at any time because everything in it is pushed.
- **Tripwire**: a gate that catches the common case but can be bypassed on purpose; the guard hook is one.

## This project

<Add terms as they are settled.>
