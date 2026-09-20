# project-template

The starting point for every new repo. Copy it, rename it, and the gates are green before the first line of product code.

## Start a new repo

```bash
cp -r ~/repos/project-template ~/repos/<name> && cd ~/repos/<name>
git init && git config core.hooksPath .githooks
gh repo create <name> --public --source . --push
gh api -X PUT repos/<you>/<name>/vulnerability-alerts
gh api -X PUT repos/<you>/<name>/automated-security-fixes
```

Then edit `CLAUDE.md` and `CONTEXT.md` for the project, enable CodeQL default setup under the repo's Security settings once there is code to scan, and run `/superpowers:brainstorming` before writing code.

## What is inside

- `CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, `docs/agents/`: the ledger and domain-doc conventions from the framework.
- `.github/workflows/ci.yml`: typecheck, lint, test, build, and dependency review on every pull request. Written for Node and pnpm; adapt the `checks` job for other stacks.
- `.github/dependabot.yml`: weekly dependency and Actions updates, minor and patch grouped.
- `.githooks/pre-commit`: gitleaks secret scan and typecheck before every commit. Enable per clone with `git config core.hooksPath .githooks`.
- `.env.example`: variable names only, never values.

The CI job expects `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` scripts. Define them in `package.json` on day one, even if some are no-ops at first.

The pnpm setup step in CI reads the pnpm version from `"packageManager": "pnpm@<version>"` in `package.json`. Set it before the first push or the `checks` job fails at setup.

## Path-scoped rules

`.claude/rules/` holds guidance that loads only when a matching file is touched: `server.md`, `ui.md`, `tests.md`, `web-security.md`, `prototypes.md`. Spikes go in `prototypes/`; nothing in `src/` imports from there.
