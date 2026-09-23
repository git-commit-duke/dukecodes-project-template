# <project name>

<One sentence: what this repo is and who uses it. Replace this line.>

## Non-negotiables

1. Nothing exists until it is committed and pushed. Small, signed commits whose messages say why. Work reaches `main` only through a pull request that the owner merges.
2. Never break the contract. Existing tests, public APIs, config formats and documented behaviour keep working unless an ADR in `docs/adr/` says otherwise; a change to an API, config format or schema needs that ADR and a migration before the code.
3. Secrets stay out of context. Files listed in `.claude/hooks/secret-paths.txt` are never read, printed or edited; the guard hook blocks the common ways, and it is a backstop, not a boundary to probe.
4. Verify before claiming done. Tests come first: a change without a test is a NACK unless the maintainer agrees it is untestable. Run the checks and report their real output. No output, no claim.
5. Ask before anything irreversible: force-push, history rewrites, deleting branches, dropping data, production deploys, merging, changing repository visibility.
6. Finish every step, in order. A workflow's steps, tasks and questions all run, none skipped, each checked complete before the next starts. Anything that catches the eye is flagged in the report, never dropped.
7. If two rules conflict, stop and ask. Never pick one silently.

## How work flows

Brainstorm → spec → plan as GitHub issues → build test-first → `maintainer` review → pull request → CI `all-green` → the owner merges → ship → observe.

- New feature or subsystem: `/superpowers:brainstorming` first. No code before an approved design.
- Bug: `/superpowers:systematic-debugging`. Reproduce before fixing.
- A finished slice ends with `/checkpoint`.
- Evidence first: read the file, run the command, fetch the official documentation page; search the web last. Label claims you could not verify.

## Where things are

- `.claude/`: this repo's gates and tools (settings, hooks, agents, skills, path-scoped rules). A change there changes every session in this repo, so it gets its own pull request, and `node .github/scripts/check-workspace.mjs` must pass.
- `docs/adr/`: decisions. `CONTEXT.md`: vocabulary. Read both before exploring.
- Issues: GitHub, see `docs/agents/issue-tracker.md`. Plugins, their hooks and MCP servers: `docs/agents/plugins.md`.

## Stack

<Fill in. For a web app, apply `docs/addons/web/README.md`.>

## Project rules

- Spikes go in `prototypes/` with a README stating the hypothesis. Nothing in `src/` imports from there.
- <Add the rules specific to this repo.>
