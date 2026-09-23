---
name: checkpoint
description: End-of-slice ritual. Verify, maintainer review, signed commit, push a branch, open or update the pull request, comment on the issue. Run when a slice of work is done, before switching tasks, and before ending a session.
---

# Checkpoint

The ledger outlives the session, and in a cloud session the disk does not. Run this so the next session starts from recorded truth.

1. Verify. Run every test command in `.github/workflows/ci.yml` that the change touches. Paste the last lines of real output. If anything fails, stop: fix it, or record it as a blocker on the issue.
2. Review. Dispatch the `maintainer` agent on `git diff --cached`. On NACK, fix and return to step 1.
3. Commit. One logical change per commit, signed, first line under 72 characters saying what and why. Never `--no-verify`.
4. Push and open the pull request. Push the branch, never `main`. Open or update the pull request with the verification output in its body. The owner merges after CI is green; never run `gh pr merge`.
5. Ledger. `gh issue comment <n>` with what changed, what is left and what was decided. Close the issue only after the pull request that resolves it has merged.
6. Durable facts. A decision becomes an ADR, a term becomes a line in `CONTEXT.md`, a gotcha becomes an issue comment. Memory is a convenience, not the ledger.
7. Report. Three lines: done, remaining, the next command.

When a step cannot run (no tests yet, no issue), say so in the report.
