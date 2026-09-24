# ADR-0004: Cloud-first, repo-isolated workspace

Date: 2026-09-22
Status: accepted

## Context

ADR-0003 measured a Claude Code cloud session against dev-setup. It had no user-level `CLAUDE.md`, rules, agents or hooks, 0 plugins, no `gh`, and restricted egress. Everything that made up the gates lived in `~/.claude` on one workstation, so remote work ran ungated. It also quoted the constraint that shapes any fix: a cloud session holding several repositories reads only `enabledPlugins` and `extraKnownMarketplaces` from each repository's `.claude/settings.json`, not permissions or hooks.

A read-only audit of the workstation on 2026-09-22 found the user-level layer had drifted as well:

- 76 of 124 installed plugins were enabled, against the 12 that dev-setup declared, because `merge-settings.js` never overrides a local choice.
- `claude/install.sh` aborts on dangling skill links.
- `core.hooksPath` was unset in every clone, so no pre-commit gate ran.
- The `.env` guard covered edits only; reads through `Read` or Bash were not blocked.

The one commit made from a cloud session (dev-setup PR #1, `4f84633`) is reported by GitHub as `verified: true`, so the signed-commit rule holds in cloud sessions.

The owner decided: cloud sessions are primary, one repository per cloud session, repositories are isolated from each other, the template is a starting point copied once, workstation setup lives outside the template, and `~/.claude` stays at its defaults.

## Decision

Each repository carries its own gates, committed in `.claude/`: permission rules, the PreToolUse guard hook, the SessionStart ledger hook, path-scoped rules, the `maintainer` agent, the `checkpoint` skill and the plugin list. This is ADR-0003's first decision and it stands.

There is no shared layer between repositories. A new repository is created from this template with `gh repo create --template`, and from then on it owns and changes its copy. There is no `install-project.sh`, no private plugin marketplace and no projects-root `CLAUDE.md`. This replaces ADR-0003's workstation "conveniences" layer and its sync script.

GitHub is the gate that holds wherever the work happens. The `universal` CI job runs on every pull request. Public repositories add a ruleset: pull request required, signed commits, required status checks, no force push. The git pre-commit hook repeats the secret and env-file refusal at commit time, and gates degrade loudly when a tool they rely on is absent. Both are carried over from ADR-0003.

Cloud sessions hold one repository each. Local clones are disposable: nothing is kept only on a workstation.

## Consequences

- An improvement to the template does not reach existing repositories. Each one ports a fix by pull request if it wants it. That is the cost of isolation.
- A local session opened outside any repository has no project guardrails, because `~/.claude` holds no rules.
- The Windows workstation has no Bash sandbox: `sandbox` requires macOS, Linux or WSL2. The guard hook is therefore the only Bash-level secret guard on that machine. It is defense in depth, not a guarantee; CI secret scanning and GitHub push protection are the backstop.
- Multi-repository cloud sessions are out of policy, because they drop permissions and hooks.
- This supersedes ADR-0003 and the dev-setup draft spec `docs/superpowers/specs/2026-09-19-repo-scaffold-design.md`, including its decisions D9 and D11 and its plan to fold this template into dev-setup. dev-setup is archived.
