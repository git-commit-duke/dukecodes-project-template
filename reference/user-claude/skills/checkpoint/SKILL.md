---
name: checkpoint
description: End-of-slice ritual. Verify, maintainer review, signed commit, push a branch, open or update the pull request, comment on the issue. Run when a slice of work is done, before switching tasks, and before ending a session.
---

# Checkpoint

The ledger outlives the session, and in a cloud session the disk does not. Run this so the next session starts from recorded truth.

## Definition of done

Every line must hold before this slice is done:

1. a test that failed first now passes, with its output;
2. every check the repo's test runner names is green;
3. maintainer ACK;
4. one logical change, in a signed commit;
5. an ADR when an API, config format, schema or documented behaviour changed;
6. the ledger updated with evidence;
7. nothing left only on this machine.

## Steps

1. Verify. Run the repo's test runner (`scripts/test.sh all` where it exists, otherwise every command CI runs that this change touches). Paste the last lines of real output. If anything fails, stop: fix it, or record it as a blocker on the issue.
2. Review. Dispatch the `maintainer` agent on `git diff --cached`. On NACK, fix and return to step 1.
3. Commit. One logical change per commit, signed, first line under 72 characters saying what and why. Never `--no-verify`.
4. Push and open the pull request. Push the branch, never `main`. Put the verification output in the pull request body. The owner merges after CI is green; never run `gh pr merge`.
5. Ledger. Comment on the issue with what changed, what is left and what was decided. In cloud sessions use the built-in GitHub tools or `gh api repos/{owner}/{repo}/issues/<n>/comments -f body=…`; `gh issue comment` uses GraphQL, which the cloud proxy may refuse, and its 403 names the REST fallback. Close the issue only after the pull request that resolves it has merged.
6. State. Write `.claude/state/active.md` (gitignored): current task, next command, open decisions. A compacted or resumed session reads it instead of relying on memory.
7. Durable facts. A decision becomes an ADR, a term becomes a line in `CONTEXT.md`, a gotcha becomes an issue comment, a lasting preference becomes a memory file.
8. Report. Three lines: done, remaining, the next command.

When a step cannot run (no tests yet, no issue), say so in the report.
