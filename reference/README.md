# reference/: preserved local-only work (2026-09-22)

**Never merge this branch.** It is a read-only record of work that existed only on one PC, in folders that Claude Code sweeps after 30 days (`~/.claude/plans`) and that Windows Storage Sense cleans (`%TEMP%`). Delete the branch before this repository goes public.

## How cloud sessions use it

Salvage, don't merge. An issue names the pieces it needs. The session copies them into its own branch, writes the failing test first, fixes the known defects, and opens a PR the owner reviews. Nothing here is trusted as correct: `audits/2026-09-22-gate-defects.md` lists the known defects in `rebuild/`.

## Contents

| Path | What it is |
|---|---|
| `rebuild/` | The 52-file template the WIP plan would have produced (rebuilt from the plan text). It has known defects |
| `harness/` | `verify-plan.sh` and `extract-blocks.mjs`, which rebuilt and checked `rebuild/` from the plan. They hard-code local Windows paths |
| `plans/` | The Foundation spec, the implementation plan, the earlier workspace plan, and the 2026-09-22 cloud-first execution plan |
| `handoff/` | The 2026-09-22 session handoff. Parts are superseded by the cloud-first decisions in the execution plan |
| `drafts/` | `combined-reviewed.patch`, the uncommitted drafts from six local worktrees (16 files) |
| `research/` | Task 1 research: 10 sources, 607 verbatim-checked rows, the reconciled subagent roster and its proof table |
| `audits/` | The confirmed gate-code defects and the setup audit findings |
