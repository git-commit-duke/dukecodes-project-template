# ADR-0003: Gates travel with the repository

Date: 2026-09-22
Status: accepted

## Context

Claude Code runs in local sessions and in cloud sessions. A cloud session starts from a fresh clone: it sees the repository's `CLAUDE.md`, `.claude/rules/`, `.claude/skills/` and `.claude/agents/`, and in a session holding one repository it also loads that repository's `.claude/settings.json` hooks and permission rules. It sees nothing configured only on a workstation, and it does not install the plugins a repository lists under `enabledPlugins`; cloud plugins come from the claude.ai account. A session holding several repositories loads no repository's hooks or permission rules.

## Decision

- Every gate is committed: permission rules and hooks in `.claude/`, the git pre-commit hook in `.githooks/`, CI in `.github/`. Nothing depends on a workstation.
- Repositories are isolated. A new repository is created from this template once and then owns its copy; there is no shared layer and no sync script.
- A cloud session holds one repository.
- Plugins: the template enables plugins that bring only skills, commands and agents. A plugin that registers hooks or starts an MCP server is an exception, listed with those hooks and servers in `docs/agents/plugins.md` and reviewed on every update.
- Gates degrade loudly: a gate whose tool is missing says so.

## Consequences

- An improvement to the template reaches an existing repository only by pull request.
- A session opened outside a repository has no project guardrails.
- Multi-repository cloud sessions are out of policy.
