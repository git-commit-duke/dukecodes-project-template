# <project name>

<One sentence: what this repo is and who uses it. Replace this line.>

## Stack

Node 24, pnpm. Scripts: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. Deploy target: Vercel.

## Rules

- Tests first. A change without a test is a NACK unless the maintainer agrees it is untestable.
- Changes to a public API, config format, or schema need an ADR and a migration before the code.
- No secrets in the repo. `.env.example` names variables; `.env` is gitignored and written by hand.
- Run the product through the browser MCP before claiming a change works.
- Spikes go in `prototypes/` with a README stating the hypothesis. Nothing in `src/` imports from there.

## Agent skills

### Issue tracker

GitHub Issues on this repo, driven through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` at the root plus `docs/adr/`. See `docs/agents/domain.md`.
