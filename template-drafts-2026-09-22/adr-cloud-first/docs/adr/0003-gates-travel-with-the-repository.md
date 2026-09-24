# ADR-0003: Gates travel with the repository; conveniences stay on the workstation

Date: 2026-09-22
Status: superseded by ADR-0004

## Context

`claude/` was written as a single user-level payload: `claude/install.sh` copies it into `~/.claude` on the workstation, and that is the only way any of it loads. This holds as long as the workstation is the only place work happens.

It is not. Work now also happens in Claude Code on the web, in an ephemeral cloud container that clones the repo and nothing else. A session there was measured against this repo:

- `~/.claude` is harness-managed and fresh. No `CLAUDE.md`, no `settings.json`, no rules, no agents, no hooks, no status line.
- Twelve plugins are enabled in `settings.fragment.json`. The container's plugin directory is empty.
- `gh` is not installed, and the container is directed to the GitHub MCP tools instead. `hooks/session-start.sh` guards on `command -v gh` and so drops the ledger without saying it dropped it.
- Egress is restricted. GitHub and the package registries resolve; general web hosts, including `tailscale.com`, return policy denials.

One constraint decides the shape of the fix. A committed `.claude/settings.json` reaches a cloud session only when that session holds a single repository. The settings documentation is explicit:

> A session with several repositories starts above the clones and reads only the `enabledPlugins` and `extraKnownMarketplaces` keys from each repository's `.claude/settings.json`, not permission rules, hooks, `env`, or other keys.

So moving a gate into `.claude/` fixes single-repo sessions and leaves multi-repo sessions ungated. Only a git hook survives there, because git runs it rather than Claude Code. A gate set that stops at the Claude Code layer is therefore incomplete by construction.

CONTEXT.md defines a Gate as a deterministic check that blocks work, and says gates are fixed, not argued with. A gate that only exists on one machine is not fixed. The protected-files hook of ADR-0002 is the sharpest case: the rule that agents may not edit `.env` files is enforced by a hook that a cloud session never loads.

## Decision

Split the payload by what has to be true everywhere, rather than by who installs it.

- **Gates live in `.claude/` and are committed.** Permission rules, the PreToolUse protected-files hook, the SessionStart ledger hook, path-scoped rules, the `maintainer` agent, and the `checkpoint` skill. A checkout carries them, so they load in a cloud container, on a second machine, and in CI without an install step.
- **Conveniences live in `claude/` and install to `~/.claude`.** The global `CLAUDE.md`, the status line, the plugin and marketplace manifest, and skills that are not gates. These are workstation setup and may legitimately be absent elsewhere.
- **Each file has one home.** `claude/install.sh` installs both directories into `~/.claude`, so the workstation still gets every gate for every project. Nothing is vendored twice.
- **`claude/install-project.sh` copies the gate set into any other repo's `.claude/`.** That is how `homelab`, `quant-intel`, and `project-template` get the same gates in their own cloud sessions.
- **The secret and protected-file gates are backed by a git hook.** `.githooks/pre-commit` repeats the env-file refusal and the secret scan at commit time. Git runs it, so it holds in a multi-repo session, under any editor, and for any tool that is not Claude Code. The Claude Code layer is the fast feedback; the git layer is the one that cannot be bypassed by session shape.
- **A gate degrades loudly, never silently.** Where a gate depends on a tool that may be absent, it says so in its output and names the substitute. `gh` is the first such case: the ledger hook reports its absence and points at the GitHub MCP tools.

## Consequences

- `.claude/` is no longer a place for one stray rule file. It is the contract, and a change to it is a change to how every checkout of this repo behaves, on any machine.
- Hook commands in `.claude/settings.json` are written against `$CLAUDE_PROJECT_DIR` so they resolve in any clone. `install.sh` rewrites that prefix to an absolute `~/.claude` path when it merges them for user scope.
- Adding a gate now means adding it to `.claude/` and running `install-project.sh` for the other repos. A gate that exists only in `~/.claude` is a bug.
- Procedures that assume `gh` are dual-path or they are broken remotely. `docs/agents/issue-tracker.md` names both the `gh` command and its MCP equivalent.
- Restricted egress stands. Homelab configuration can be edited from a cloud session but cannot be verified against a live host, because the tailnet is unreachable. Verification stays a workstation step, and any runbook that needs the tailnet says so.
- This contradicts decision D9 of `docs/superpowers/specs/2026-09-19-repo-scaffold-design.md`, named here as `claude/rules/adr.md` requires. D9 assigns the deny list, the protected-files hook, and the session-start ledger to the global layer and gives the project layer only the allow list and an edit-time gate. That is the layer a cloud session never loads, so D9 would leave every remote session ungated. The split above replaces it. D9's other half stands: the two layers still do not duplicate each other.
- Nothing here is implemented yet. This ADR records the decision only; the `.claude/` move, the git hook, and `install-project.sh` are separate work and this file should not be read as describing the repository's current state.
