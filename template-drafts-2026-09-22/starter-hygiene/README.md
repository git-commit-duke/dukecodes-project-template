# project-template

The starting point for a new repository. A repository is created from it once, and from then on it owns its copy and changes it freely. Nothing syncs back or across ([ADR-0004](docs/adr/0004-cloud-first-repo-isolated-workspace.md)).

Every repository made from it carries its own gates, so they hold in a cloud session, on any machine and in CI: permission rules and a secret guard hook in `.claude/`, a pre-commit secret scan, and a `universal` CI job that a ruleset makes required.

## Create a repository

```bash
gh repo create <name> --template git-commit-duke/project-template --public --clone
cd <name>
git config core.hooksPath .githooks
```

Use `--private` for a repository that must stay private. On GitHub Free, a private repository gets no ruleset, secret scanning or dependency review ([ADR-0001](docs/adr/0001-github-native-security-baseline.md)), so its only gates are the hooks and CI.

Then:

1. Edit `CLAUDE.md` and `CONTEXT.md` for the project, and add the plugins its stack needs to `enabledPlugins` in `.claude/settings.json` (for example `vercel@claude-plugins-official`).
2. For a public repository, turn on the baseline and the ruleset (next section).
3. Run `/superpowers:brainstorming` before writing any code.

## Baseline and ruleset (public repositories)

```bash
repo=git-commit-duke/<name>
gh api -X PUT "repos/$repo/vulnerability-alerts"
gh api -X PUT "repos/$repo/automated-security-fixes"
gh api -X PUT "repos/$repo/private-vulnerability-reporting"
gh api -X PATCH "repos/$repo" \
  -f "security_and_analysis[secret_scanning][status]=enabled" \
  -f "security_and_analysis[secret_scanning_push_protection][status]=enabled"
gh repo edit "$repo" --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false --delete-branch-on-merge
gh api -X POST "repos/$repo/rulesets" --input .github/rulesets/main.json
```

The ruleset in `.github/rulesets/main.json` protects the default branch. It requires a pull request, merge commits only, signed commits and a green `universal` check, and it forbids force pushes and deletion. Merge commits keep each signed commit intact; squash and rebase would replace or drop the signatures.

## Cloud sessions

- One repository per session. A session holding several repositories ignores their permission rules and hooks ([ADR-0004](docs/adr/0004-cloud-first-repo-isolated-workspace.md)).
- Environment network access: **Trusted**, which reaches GitHub and the package registries. Store no secrets in the environment.
- Environment setup script:

```bash
git config core.hooksPath .githooks
if [ -f package.json ]; then corepack enable && pnpm install --frozen-lockfile; fi
```

## CI contract

- `universal` runs on every pull request: gitleaks, actionlint, zizmor, Semgrep, and the repository's self-tests (`tests/*.test.sh`, `node --test .claude/hooks/`). It is the required check.
- `node` switches on when a `package.json` exists. It requires `"packageManager": "pnpm@<version>"` and a `test` script, then runs install, typecheck, lint, test and build, skipping any of those scripts that does not exist.
- `dependency-review` runs on pull requests in public repositories.
- Actions are pinned to full commit SHAs, and Dependabot proposes the updates. To pin a newly added action, run `pinact run`.

## What is inside

- `.claude/`: `settings.json` (permissions, hooks, plugins), `hooks/guard.js` (secret and lockfile guard), `hooks/session-start.sh` (the ledger), `agents/maintainer.md`, `skills/checkpoint/`, and path-scoped `rules/`.
- `.githooks/pre-commit`: refuses staged secrets and env files, runs the typecheck, and lints Dockerfiles. Tested by `tests/pre-commit.test.sh`.
- `.github/`: CI, Dependabot, the ruleset, and the pull request template.
- `CLAUDE.md`, `CONTEXT.md`, `docs/adr/`, `docs/agents/`: rules, vocabulary, decisions, and how agents use the issue tracker.
- `SECURITY.md`, `LICENSE`, `.env.example` (variable names only, never values).

## Path-scoped rules

`.claude/rules/` holds guidance that loads only when a matching file is touched: `server.md`, `ui.md`, `tests.md`, `web-security.md`, `prototypes.md`, `adr.md`, `shell.md`. Spikes go in `prototypes/`; nothing in `src/` imports from there.
