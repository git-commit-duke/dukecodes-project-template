# Global operating rules

Who I am: a solo developer on Windows 11 (Git Bash), learning DevSecOps by shipping. Every repo is portfolio material and may be read by a hiring manager.

## Non-negotiables

1. Nothing exists until it is committed. Small, signed commits whose messages say why.
2. Never break the contract. Existing tests, public APIs, config formats, and documented behaviour keep working unless an ADR says otherwise.
3. Never touch secrets. Do not read, print, or edit `.env*` files (except `.env.example`), credentials, or tokens. A hook enforces this; do not work around it.
4. Verify before claiming done. Run the typecheck and the tests, then report the real output. No output, no claim.
5. Ask before anything irreversible: force-push, history rewrites, deleting branches, dropping data, production deploys.
6. Finish every step, in order. A workflow's steps, tasks, and questions all run, none skipped, and each is checked complete before the next starts. Anything that catches the eye during the work is flagged in the report, never dropped.
7. If two rules conflict, stop and ask. Never pick one silently.

## Session protocol (every session, no exceptions)

1. Preflight before any work: the folder is the repo clone; `git config core.hooksPath` is set; the plugin and connector set is the build profile; read `.claude/state/active.md` when it exists. A failed preflight is fixed first, never worked around.
2. One task at a time, in plan order. Fix at the source; no patch that leaves the cause, no "note it for later" instead of a fix.
3. Evidence or it did not happen: the command and its real output, in the same turn.
4. Audit before moving on. A read-only agent (`auditor`, or `maintainer` for a diff) returns PASS, CONCERNS or FAIL with `file:line`. The builder never audits itself; the strictest verdict wins; CONCERNS is fixed or filed before the next task.
5. Track in this order: plan checkbox, then an issue comment carrying the evidence, then the commit. Unticked means unfinished.
6. An open question becomes a `needs-decision` note on the issue with a key, and stays open until a matching `resolved` comment lands.
7. Nothing is landed until it is merged. Remove a worktree only after the content is on the default branch.
8. End every slice with `/checkpoint`, which enforces the definition of done, and every session with `/session-close`, which lands or parks each thread and writes a handoff file the next session starts from.

## How work flows

Brainstorm, spec, plan as issues, build test-first, maintainer review, pull request, CI green, owner merges, ship, observe.

- New project or subsystem: `/superpowers:brainstorming` first. No code before an approved design.
- Bug: `/superpowers:systematic-debugging`. Reproduce before fixing.
- Work reaches `main` only through a pull request the owner merges.
- Evidence first: read the file, run the command, fetch the owning documentation page; search the web last. Label anything unverified.
- Every finished slice of work ends with `/checkpoint`.

## Roles inside one session

- Orchestrator: the main session. It decides, delegates, and merges. It keeps its own context clean.
- Explorers: the `Explore` subagent for any search that touches more than three files.
- Reviewers: the repo's `maintainer` (ACK or NACK on a diff), its read-only `auditor`, and the pr-review-toolkit agents for pull requests. Domain plugins are enabled per repository, never globally.
- Gates: hooks, permission rules, and CI are deterministic. They are fixed, not argued with.

## Context discipline

- Read `CONTEXT.md` and `docs/adr/` before exploring a repo. Use their vocabulary.
- Prefer a skill over re-deriving a procedure. Prefer a subagent over pulling ten files into this context.
- Path-specific guidance lives in `.claude/rules/` (project) and `~/.claude/rules/` (all projects) and loads only when a matching file is touched. Put it there, not here.
- Durable context lives in git, issues, ADRs and memory. A session's context is disposable; write anything the next session needs into one of those before it ends.
- Keep this file and every project CLAUDE.md under 150 lines.

## Environment

- Windows 11, Git Bash. Forward slashes, quoted paths, LF line endings. Installs via `winget` or `npm -g`. There is no `sudo`.
- Node 24, pnpm preferred. Deploy target is Vercel unless the project says otherwise.
- Clones live in `C:/Users/dev/Downloads/repos`, one repository per folder, and are throwaway: GitHub holds the canonical copy. `~/.claude/projects` is Claude Code's own state; never put a repo there.
- Build sessions open in the repo clone, not in `~/.claude`, so the repo's CLAUDE.md, rules, agents and gates load and worktree isolation works.
- Cloud sessions run Ubuntu 24.04 with Node 20 to 22, `gh`, `jq` and Go preinstalled; shellcheck, actionlint, zizmor, semgrep and gitleaks are not. They read only what is committed.
- No environment variables are required: CLIs sign in by device flow, and runtime secrets live in the platform's store.
