# Handoff: agent-workspace-template, Foundation (2026-09-22)

Attach this file to the new session and say: "resume the foundation plan".

## State

**Local Claude Code setup (P0): done and verified.**
- `~/.claude/settings.json`: `permissions.disableBypassPermissionsMode: "disable"`; 39 dead `@inline` entries removed; enabled plugins cut from 76 to 8 (superpowers, mattpocock-skills, learning-output-style, pr-review-toolkit, code-review, commit-commands, claude-md-management, context7). Every other setting is byte-identical to the backup.
- Rewritten and tested: `~/.claude/CLAUDE.md` (58 lines, adds a per-session protocol), `rules/shell.md`, `rules/adr.md`, `agents/maintainer.md`, `skills/checkpoint/SKILL.md`, `hooks/block-protected-files.js`, `hooks/session-start.sh`. New skill: `skills/session-close/SKILL.md`.
- Four dead skill symlinks (into a removed `~/.agents/skills`) deleted. Real skills left: `checkpoint`, `tailscale`.
- Memory rewritten: 7 files, all indexed in `MEMORY.md`.

**The template repository: nothing has been done to it yet.** No issue, no branch, no commit, no push. `git-commit-duke/project-template` is untouched at `d1eddf0`, private, 0 issues.

**The implementation plan: amended and re-verified, but incomplete.** Applied: A1 (cloud gitleaks via the Go module proxy), A2 (PR ① runs Task 3 first), A3 (NUL-separated staged paths), A4 (one list per concept: `[edit-only]` lockfiles, `GUARDED_TOOLS`, Grep/Glob checking, matcher-equality lint, SHA-pin lint, all-green coverage lint), A10 (`scripts/test.sh`, the single test runner), A14 (web add-on installs its language server; pnpm only). Still to apply: A5–A9, A11–A13, A15–A18 (listed under Next actions).

## Decisions made, and why

- **Local setup: build profile, not a full reset.** Preferences kept; only the plugins and bypass mode changed. Replaces the earlier "empty `~/.claude` to 4 keys" idea for now; the full reset stays a homelab issue.
- **Build sessions run in the Desktop Code tab, opened on the clone** `C:\Users\dev\Downloads\repos\project-template`, after the Desktop-injected connectors and Cowork plugins are turned off. A session in `~/.claude` loads no repo context and cannot use worktree isolation.
- **Plans live in git.** `~/.claude/plans/` is deleted after 30 days, so the spec and the implementation plan are to be committed to private `homelab` under `docs/plans/agent-workspace-template/`. Not yet done.
- **Cloud gitleaks comes from the Go module proxy.** A GitHub release download returns 403 in cloud sessions for repositories not attached to the session (Anthropic's docs). Replaces the checksum-pinned curl in S25.
- **The ledger is read over REST.** The cloud GitHub proxy serves only pinned pull-request GraphQL operations, and `gh issue …` is GraphQL.
- **Gate code stays plain Node `.mjs`.** Measured: 110 ms per guarded call (59 ms is bare Node startup). Go/Deno/Bun were considered and rejected on availability, not speed; TypeScript was rejected because cloud Node minors are unpinned and `tsc --checkJs` found no real defects while adding friction.
- **Extra Foundation additions you chose:** repo settings as data (A7), one test runner (A10), a Definition of Done (A11). `.editorconfig` declined.
- **From the audited repos (beads, no-mistakes, firstmate, CCGS, treehouse, axi, backpass, gnhf, lavish-axi):** adopt four small, tailored ideas (A15–A18 below). Skip beads (a second ledger outside GitHub), no-mistakes' daemon and gate remote, treehouse leases, lavish-axi's browser gate. Defer gnhf's run caps to Sub-project B.

## Evidence

- `bash <scratch>/verify-plan.sh` → **0 failed of 12**, including: the pre-commit tests red on the original hook and green on the fixed one; `café/.env is refused`; `Grep glob=".env"` blocked; the owner's `isSecretCommand` tests red on the scaffold and satisfiable in four lines; shellcheck, actionlint, zizmor, semgrep `p/default --error`, and gitleaks over the history all clean.
- Local settings after the change: `8 plugins, bypass=disable`, `inline_entries=0`; `diff` of everything except plugins and permissions against the backup: identical.
- User hooks tested by execution: `.envrc` and key material now blocked; unparseable input fails closed (it used to fail open); the ledger prints inside a worktree (it used to be silent); a non-repo folder stays silent; shellcheck clean.
- All 20 binaries the gates use are installed; four match the CI pins exactly (semgrep 1.177.0, actionlint 1.7.12, zizmor 1.30.1, gitleaks 8.30.1). No language servers are installed, and none is needed for this template.
- **Not verified:** anything cloud-side (C1–C4), whether the Git Credential Manager token carries the `workflow` scope (the first push is the probe), and whether `gh issue …` really fails in a cloud session (INFERENCE from the docs).

## Next actions

1. Finish the amendments in `C:\Users\dev\.claude\plans\2026-09-22-foundation-implementation.md`:
   - A5 ledger and checkpoint over REST; A6 CI runs shellcheck and the CI-script tests on Node 22 and 24; A7 repo settings as data; A8 small items (build session-start before settings.json; separate bootstrap failure messages; `.gitignore` checked against the fixtures; folded-frontmatter parser); A9 execution mechanics (Desktop PR tools, review lanes); A11 Definition of Done in the template CLAUDE.md; A12 `.claude/state/active.md`; A13 the plugins.md note about semgrep.
   - New, all small: A15 a shell-rule bullet that scripts agents call are non-interactive, idempotent and exit 0 on a no-op; A16 a maintainer rule that a pull request editing its own gates is reviewed against `main`'s version; A17 an auditor rule that every CONCERNS is labelled `fix` or `ask-owner`; A18 a checkpoint rule that a lasting rule needs two independent observations.
2. Re-run `bash <scratch>/verify-plan.sh` until it reports `0 failed`.
3. P2 context sync: commit both plans to private `homelab`; republish the two stale artifacts; publish the ship list.
4. Ask before Task 0, which creates the GitHub issues. Then execute tasks 0–24 under the zero-trust protocol.

## Paths

- Spec, pre-flight, findings, ship list: `C:\Users\dev\.claude\plans\playful-rolling-scone.md` (read its "Resume state" block first).
- Implementation plan, tasks 0–24: `C:\Users\dev\.claude\plans\2026-09-22-foundation-implementation.md`.
- Verification harness: `C:\Users\dev\AppData\Local\Temp\claude\C--Users-dev--claude\3b17c90b-a85b-49e2-b9a5-6abe0b9647b1\scratchpad\verify-plan.sh` and `extract-blocks.mjs`; the rebuilt repo is `…\scratchpad\verify-final`. These live in a session temp folder: if it is gone, the script rebuilds everything from the plan text.
- Settings backup: `C:\Users\dev\Downloads\claude-settings-2026-09-22.json`.
- Draft work from the six superseded worktrees, preserved 2026-09-22 to `C:\Users\dev\Downloads\template-drafts-2026-09-22\`: `combined-reviewed.patch` (36 KB) plus 14 files under one folder per worktree. `gates-in-repo` held no changes. Task 1 may therefore remove those worktrees without regenerating anything.
- Clone: `C:\Users\dev\Downloads\repos\project-template` (7 worktrees, 6 of them superseded drafts to remove in Task 1).
- Repos: `git-commit-duke/project-template` (private, to become `agent-workspace-template`), `git-commit-duke/homelab` (private), `git-commit-duke/dev-setup` (private, to be archived).
- Artifacts to update: Kernel and Fleet `https://claude.ai/artifact/KkGRNwsGtvamn6DFAw6cP5` (shared by link; still names dev-setup, CodeQL and homelab hardware) and Claude Setup Review `https://claude.ai/artifact/64yK3pHXmrVAg7Rmn2d5eD` (contradicts ADR-0003).

## Open questions

- Nothing blocks progress. Three owner actions are pending, in your hands whenever convenient:
  1. allowed-signers: `mkdir -p ~/.config/git && printf '%s namespaces="git" %s\n' "$(git config --global user.email)" "$(cat "$(git config --global user.signingkey)")" > ~/.config/git/allowed_signers && git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers` then `git -C "C:/Users/dev/Downloads/repos/dev-setup" log --format=%G? -1 28356b4` should print `G`.
  2. In Desktop, turn off the injected connectors (Airtable, Figma, Lovable, Base44, GitHits, Firecrawl, Economic Index) and the Cowork-side plugins that reach Code (desktop-commander above all).
  3. Open the next session on the clone folder, not on `~/.claude`.

## Unfinished at handoff time

An independent four-way close-out audit (core files, durable context, workspace state, plan integrity, plus a completeness critic) was launched and had not finished when the session ended. Nothing depends on it: every claim above was verified directly. If you want that second opinion, re-run it fresh in the next session from its saved script:
`C:\Users\dev\.claude\projects\C--Users-dev--claude\3b17c90b-a85b-49e2-b9a5-6abe0b9647b1\workflows\scripts\session-close-audit-wf_b584444e-814.js`

## Do not repeat

- The cloud bootstrap must not download a GitHub release: it returns 403 for unattached repositories. Use the Go module proxy.
- `plans/` in `~/.claude` is swept after 30 days; do not treat it as durable storage.
- The main-module check (`path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)`) is false when a file is reached through a directory junction, which silently disables a hook. Hook entry files therefore have no exports and no such check. A lowercase drive letter is harmless; that earlier explanation was wrong.
- gitleaks ignores sequential fake tokens such as `abc…xyz`; a test token must look random.
- Semgrep's `p/default` flags `new RegExp(...)` built from a variable; the single `compile()` helper carries the one reviewed `nosemgrep`.
- `git diff --cached --name-only` quotes non-ASCII paths; always read staged paths with `-z`.
- Do not re-litigate: `.mjs` over Go/Deno/Bun/TypeScript for gate code, and GitHub Issues over beads as the ledger.
