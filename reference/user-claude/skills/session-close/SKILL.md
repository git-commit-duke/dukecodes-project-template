---
name: session-close
description: End-of-session ritual. Land or park every thread, write a handoff file the next session can start from, sync memory and the plan, clean the workspace, and report. Run before closing, restarting, updating Claude, or handing over.
---

# Session close

Landing the plane is the hard part: work is not done when the code works, it is done when it is merged, recorded, and the workspace is clean. `/checkpoint` ends a slice; this ends a session. Run it before closing, restarting or updating Claude.

Do the steps in order and report what each produced. A step that cannot run says so in the report; it is never skipped silently.

## 1. Finish or park every thread

List what was started this session. For each: finish it, or write its exact next action. A half-finished edit is either completed or reverted; nothing is left in a state where the next session must guess.

## 2. Verify what is claimed

Run the repo's test runner (`scripts/test.sh all` where it exists, otherwise the commands CI runs). Paste the real output. Anything unproven is written down as unproven.

## 3. Land or park the work

For each branch and worktree touched:
- merged into the default branch? remove the worktree;
- not merged? push the branch and leave the worktree alone.

Never remove unlanded work, and never force anything to make the tree look clean.

## 4. Update the ledger

Comment on each touched issue with what changed, what remains and the evidence. Keyed `needs-decision` notes stay open until a matching `resolved` comment lands. Close an issue only when its pull request has merged.

## 5. Write the handoff

Write `~/.claude/handoffs/<YYYY-MM-DD>-<topic>.md` with the template below, then give the owner its full path so they can attach it to the next session. It is written for a reader with no memory of this session: no pronouns without antecedents, no "as discussed", every path absolute.

```markdown
# Handoff: <topic> (<date>)

## State
What is true right now: what exists, what is committed and pushed, what is not.

## Decisions made, and why
One line each, with the reason and any decision it replaces.

## Evidence
Commands run and their real results. Say what was NOT verified.

## Next actions
Numbered, in order, each with the command or file to start from.

## Paths
Every file, plan, issue and URL the next session needs, absolute.

## Open questions
Anything awaiting the owner, phrased so an answer can be acted on directly.

## Do not repeat
Things already tried that failed, refuted claims, and dead ends, so they are not rediscovered.
```

## 6. Sync durable context

- Update the plan's Resume state block: where we are, what is next, what is unproven.
- Write durable facts to memory. A lasting rule needs two independent observations before it is written; a one-off goes in the handoff instead.
- Correct anything in memory, CLAUDE.md or a published artifact that this session made stale. Overwrite it; never leave two versions.

## 7. Clean the workspace

Remove scratch files the handoff does not reference. Keep backups. Leave the tree so that `git status` is explainable in one line.

## 8. Report

Three lines: what landed, what is parked, the next command. Then the handoff path.
