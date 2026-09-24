# <project name>

<One sentence: what this repo is and who uses it. Replace this line.>

## Non-negotiables

1. Nothing exists until it is committed and pushed. Small, signed commits whose messages say why. Work reaches `main` only through a pull request.
2. Never break the contract. Existing tests, public APIs, config formats and documented behaviour keep working unless an ADR in `docs/adr/` says otherwise.
3. Secrets stay out of context. `.env*` files (except `.env.example`), SSH keys and credential files are never read, printed or edited. `.claude/hooks/guard.js` blocks the common paths; it is a backstop, not a boundary to probe.
4. Verify before claiming done. Run the checks and report their real output. No output, no claim.
5. Ask before anything irreversible: force-push, history rewrites, deleting branches, dropping data, production deploys, changing repository visibility.
6. Finish every step, in order. Anything that catches the eye during the work is flagged in the report.
7. If two rules conflict, stop and ask.

## How work flows

Brainstorm → spec → plan (tasks as GitHub issues) → build test-first → maintainer review → pull request → CI green → the owner merges → ship → observe.

- New feature or subsystem: `/superpowers:brainstorming` first. No code before an approved design.
- Bug: `/superpowers:systematic-debugging`. Reproduce before fixing.
- A finished slice of work ends with `/checkpoint`.
- Evidence first: read the files, run the command, fetch the official docs page; search the web last. Label any claim you could not verify.

## Where things are

- `.claude/`: this repo's gates (settings, hooks, the `maintainer` agent, the `checkpoint` skill, path-scoped rules). A change there changes every session in this repo, so it gets its own pull request.
- `docs/adr/`: decisions, one per file. `CONTEXT.md`: vocabulary. Read both before exploring.
- Issue tracker: GitHub Issues, see `docs/agents/issue-tracker.md`. Domain docs: `docs/agents/domain.md`.

## Stack

<Fill in. For a Node app: Node 24, pnpm with `packageManager` pinned in package.json, scripts `typecheck`, `lint`, `test`, `build`. Deploy target: Vercel.>

## Project rules

- Spikes go in `prototypes/` with a README stating the hypothesis. Nothing in `src/` imports from there.
- Look at the running product in the browser before claiming a UI change works.
- <Add the rules specific to this repo.>
