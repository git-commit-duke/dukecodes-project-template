# Plan: cloud-first, repo-isolated Claude Code workspace

## Context

You asked for a deep re-audit of the whole workspace, fixes for everything found, and a workflow that actually fits how Claude Code is designed. The audit ran 15 read-only agents over 7 areas; each finding was checked by an adversarial verifier and then a completeness critic (98 findings). Six grilling rounds then settled what you want.

**The core problem.** Your safety rules, reviewer agent, `/checkpoint` and plugin list live in `C:\Users\dev\.claude`, installed by dev-setup. A **cloud** session never sees that folder. Your own cloud session proved it in dev-setup PR #1: *0 plugins, no rules, no hooks, no `gh`*. Locally, the installer is broken, and 76 plugins are enabled instead of 12. So the gates you designed run nowhere reliably.

**The fix.** Make every repo self-contained: rules and gates are committed inside it, and GitHub (CI + branch rules) guards `main`. The template repo gives each new repo that setup on day one, and then each repo evolves on its own. The local PC becomes a throwaway sandbox.

## Final decisions (these supersede all earlier rounds)

| # | Decision |
|---|---|
| D1 | **Cloud sessions are primary.** Local is a throwaway sandbox; nothing lives only on the PC. Cloud commits are GitHub-verified (FACT: PR #1 commit `4f846333` `verified=true reason=valid`) |
| D2 | **One repo per cloud session.** Multi-repo sessions ignore a repo's permissions and hooks (docs, quoted in PR #1) |
| D3 | **Repos are isolated.** The template is copied **once** at creation (GitHub "Use this template"); after that each repo evolves on its own. No shared plugin, no parent-folder CLAUDE.md |
| D4 | **project-template** absorbs dev-setup's repo-level parts, becomes public and a GitHub template. **dev-setup is archived** on GitHub (reversible), with no local folder |
| D5 | **PC setup → a public GitHub Gist**, outside the template, followed by hand: tools, SSH signing key, `gh` login, account security, the Claude GitHub connector, optional Tailscale |
| D6 | **`C:\Users\dev\.claude` emptied to defaults**, after a backup zip. Keep login, session history and memory |
| D7 | Approval = maintainer ACK → signed commit on a branch → PR → CI green → you merge. **Merge commits only**, branch deleted on merge |
| D8 | Visibility: project-template **public** with rulesets; homelab **private**; dev-setup archived and private |
| D9 | Template CI = universal checks (gitleaks, Semgrep, actionlint + zizmor, dependency review) on every PR + Node checks **only when `package.json` exists** (fails if it has no `test` script). Actions **pinned to commit SHAs**; Dependabot bumps them |
| D10 | Cloud environment: **Trusted** network + a tiny setup script (enable `.githooks`; `pnpm install` if there's a `package.json`). No secrets stored in it |
| D11 | homelab = **guide + runbook**. Claude edits it via PR and never runs its scripts; you do |
| D12 | Repo plugin set (template `.claude/settings.json`): superpowers, mattpocock-skills, claude-md-management, hookify, commit-commands, code-review, pr-review-toolkit, claude-security, semgrep, security-guidance, typescript-lsp, context7, playwright, frontend-design, modern-web-guidance, project-artifact, learning-output-style, coderabbit. Each repo edits its own copy (e.g. the app adds vercel). **Change from the round-3 list:** claude-code-setup, skill-creator and plugin-dev are left out because they're config-authoring tools an app repo doesn't need; add them back per repo if you want them |
| D13 | Clones stay in `C:\Users\dev\Downloads\repos` (throwaway). Worktrees: `<repo>/.claude/worktrees/<task>`, gitignored |
| D14 | Cowork: **revised 2026-09-22.** It's an isolated, plan-only sandbox at default settings. Its memory is already empty (FACT, 1 byte). Account sync into Code is off: user settings have `syncClaudeAiPlugins:false`, `syncClaudeAiSkills:false`, `disableClaudeAiConnectors:true`. Cowork's own plugins get disabled by you in the app (account setting) |
| D17 | `workflowSizeGuideline: "unrestricted"` in user settings. D6 keeps exactly these 4 user keys (workflow size + 3 sync keys); everything else goes back to defaults |
| D15 | Disable bypass-permissions (repo setting `permissions.disableBypassPermissionsMode: "disable"`, verified value) and keep Remote Control on |
| D16 | Scope: **minimum viable, then ship the app.** Every finding not fixed below becomes a GitHub issue in its repo |

## Target layout

```
GitHub (source of truth)
├── git-commit-duke/project-template   PUBLIC · template · rulesets        starting point only
├── git-commit-duke/<app>              created with gh repo create --template; evolves alone
├── git-commit-duke/homelab            PRIVATE · runbook; you run the scripts
├── git-commit-duke/dev-setup          ARCHIVED (history kept)
└── gist: "workstation setup"          PUBLIC · once per PC, by hand

Every repo (committed, so cloud sees it)
├── CLAUDE.md  CONTEXT.md  docs/adr/  SECURITY.md  LICENSE  .gitattributes  .gitignore
├── .claude/settings.json      gates · plugins · official marketplace · disableBypass
├── .claude/hooks/             secret + lockfile guard (Read|Edit|Write|MultiEdit|NotebookEdit|Bash)
├── .claude/agents/maintainer.md   .claude/skills/checkpoint/   .claude/rules/
├── .githooks/pre-commit       gitleaks (fixed, executable, tested)
└── .github/workflows/  .github/dependabot.yml

This PC (throwaway)
├── C:\Users\dev\.claude\          defaults + login + history (no config)
└── C:\Users\dev\Downloads\repos\  clones only when needed; nothing else at this level
```

## §D Verified findings driving the work (details in `wf_f5a965a8-064` journal)

| ID | Sev · verdict | Finding (named files) | Fixed in |
|---|---|---|---|
| PR#1 / DS-14 | high · FACT | Cloud sessions have no gates. The repo is the only carrier (dev-setup PR #1, ADR-0003 proposed) | Phase 1 |
| DS-02 / critic-01 | high · confirmed | 76 plugins live vs 12 declared. The "Fullstack dev plugins" session edited `settings.json` directly (file-history v3 12 → v4 77) | Phase 5 |
| a1 / critic-03 | high · confirmed | `.env` guard is edit-only. `Read` deny covers 4 literal paths; `cat .env` and `git diff --no-index` read secrets with no prompt (`Bash(git diff:*)` allow) | Phase 1 |
| PT-01 / critic-02 | high · FACT | `project-template/.githooks/pre-commit:22`: `grep` + `pipefail` blocks every commit with no TODO, and prints no message | Phase 1 |
| PT-02, PT-05, PT-08 | medium · FACT | CI red since the first push (no `package.json`); mutable `@v4` tags on the deprecated node20 runtime; Dependabot watching a missing npm manifest | Phase 1 |
| TG-01 | high · partially | `core.hooksPath` unset in all 3 repos; hooks tracked non-executable (100644) | Phase 1, 3 |
| PT-07 / TG-02 | medium · FACT | Private on GitHub Free, so no rulesets (API 403), no secret scanning | Phase 2 |
| TG-05 | medium · FACT | `data-agent-kit-starter-pack` PreToolUse `*` telemetry hook forks node with the full tool payload in argv | Phase 5 |
| DS-01 | medium · confirmed | `install.sh` aborts on dangling junctions (`~/.claude/skills/{find-skills,…}` → missing `~/.agents`) | Phase 5 (retired) |
| critic-05 | medium · INFERENCE | Repos moved into Downloads inherit Desktop folder mode `auto` (was `default`) | Phase 4 (you, in Desktop) |
| SEC-006 | medium · confirmed | Agent in `auto` on an admin tailnet device (`ip '*'`), with no ask/deny for `ssh` or `tailscale set/up/logout/lock` | Phase 1 |
| HL-03 | medium · confirmed | Retired `homelab/network/setup-wizard.sh` still runnable; it would renumber the LAN onto the IoT subnet | Phase 3 |
| HL-10 | low · FACT | `homelab/.claude/skills/tailscale` dangles to the old `C:/Users/dev/repos` | Phase 3 |
| DS-04 | medium · FACT | `.gitleaks.toml` allowlist regex unanchored (dev-setup **and** homelab) | Phase 1, 3 |
| TG-07 | medium · FACT | `~/.bashrc` aliases (ls→eza, cat→bat, du→dust, ps→procs) leak into agent shells; a plain `ls -la` returned nothing this session | Phase 4 |
| DS-07 | low · FACT | `gpg.ssh.allowedSignersFile` unset, so local signature checks error | Phase 4 |
| C6 / TG-11 | low · FACT | ≥3.8 GB cache for disabled plugins; 10 of 11 LSP plugins have no server binary; 8 orphan `temp_git_*` clones | Phase 5 |
| critic-04 | **high · FACT** | Desktop filesystem extension has **read/write on all of `~/.claude`** incl. `.credentials.json` | Flagged (your call) |

## Implementation

Rules for every phase: small SSH-signed commits whose message says why; maintainer ACK before each commit; PRs merged by you; real test/CI output pasted before claiming done; each destructive step shows its exact list first and waits for your yes.

**Phase 0 — Evidence and safety (local, no deletions)**
1. Zip everything Phase 5 will remove, plus `file-history/9e7c6788-*` (the drift evidence), to `Downloads/claude-config-backup-2026-09-22.zip`, and list its contents.
2. Save feedback memories: "tool calls before web search" and "grill in plain language; explain before asking".

**Phase 1 — Rebuild project-template (clone → worktree `.claude/worktrees/template-v2` → PRs)**
One PR per concern, in this order:
1. **ADR-0004 "cloud-first, repo-isolated workspace"** (supersedes dev-setup's draft `2026-09-19-repo-scaffold-design.md` and `install.sh`; imports PR #1's ADR-0003 text). Rule 2 requires the ADR before the behaviour changes.
2. **Gates in the repo:** `.claude/settings.json` gets deny rules `Read(//**/.env)`, `Read(//**/.env.local)`, `Read(//**/.env.*.local)`, `Read(~/.ssh/**)`; deny `Bash(git diff --no-index *)`; ask for `Bash(ssh *)`, `Bash(scp *)`, `Bash(tailscale set|up|down|serve|funnel|file *)`, `Bash(git branch -D *)`; deny `Bash(tailscale logout|lock *)`; plus `disableBypassPermissionsMode: "disable"`, the D12 `enabledPlugins`, and the official marketplace. A new **fail-closed guard hook** matches Read|Edit|Write|MultiEdit|NotebookEdit|Bash and blocks `.env*` (except `.example`/`.sample`/`.template`), `~/.ssh/`, and lockfile edits, with `node:test` cases. On Windows this hook is the **only** Bash-level guard, because `sandbox` is macOS/Linux/WSL2-only and WSL is broken here; it's defense in depth, not a guarantee.
3. **Carried over from dev-setup:** `maintainer.md`, `checkpoint` (reworded: push branch + PR, never main), rules `adr.md`/`shell.md`, the 7 non-negotiables in `CLAUDE.md` (<150 lines), ADR-0001 security baseline, ADR-0002 no secrets on disk, `CONTEXT.md` vocabulary.
4. **Hook fixes:** PT-01 (`grep -c … || true`) + `tests/pre-commit.test.sh`; `git update-index --chmod=+x`; `.gitattributes` (`* text=auto eol=lf`); gitleaks allowlist regex anchored (DS-04).
5. **CI (D9):** a `universal` job (gitleaks, `semgrep scan --config p/default`, actionlint, `zizmor --offline`, dependency-review) and a `node` job with `if: hashFiles('package.json') != ''` (install → typecheck → lint → test → build; fails when there's no `test` script). Job-level `permissions`, `persist-credentials: false`, SHAs pinned via `pinact`. Dependabot for `github-actions` with a cooldown; npm entry commented until there's a manifest.
6. **Starter hygiene:** `SECURITY.md`, `LICENSE` (MIT), PR template, `.gitignore` adds `.claude/worktrees/` and `.claude/settings.local.json`, README "create a repo" = `gh repo create <name> --template git-commit-duke/project-template --private|--public --clone` + `git config core.hooksPath .githooks` + the cloud environment setup script (D10).

**Phase 2 — GitHub settings (each one waits for your approval)**
- dev-setup: push `28356b4` via PR; close PR #1 with a link to ADR-0004; archive.
- project-template: set public (full-history gitleaks is already clean), `isTemplate=true`, ruleset on `main` (PR required, signed commits, required checks `universal`, no force push, no deletion), merge commits only, `deleteBranchOnMerge`, secret scanning + push protection, private vulnerability reporting.
- homelab: merge commits only and `deleteBranchOnMerge`. Rulesets aren't available on private Free (it stays gated by hooks + CI).

**Phase 3 — homelab alignment (PR, in a worktree)**
`.claude/settings.json` denies `Bash(ssh *)`, `Bash(scp *)` and running `network/**` scripts (D11); vendor the pinned tailscale skill with SOURCE + LICENSE into `homelab/.claude/skills/tailscale` (fixes HL-10/HL-11); add the retirement guard to `network/setup-wizard.sh` or `git rm` it per ADR-0002 (HL-03); `.gitattributes`, `+x` hook, anchored gitleaks allowlist, CI universal job. HL-01, 02, 04–09, 12–18 become issues.

**Phase 4 — Public Gist "workstation setup" + things only you can click**
- Gist: steps 1–4 and 9 (+ optional 10) of the old wizard. Drop step 6 (dev-setup repo) and step 8 (unpinned "game engine" installs, DS-09); step 7 moves into repos. Also: a `[[ -n $CLAUDECODE ]] ||` guard around the `.bashrc` aliases (TG-07), `gpg.ssh.allowedSignersFile` + `tag.gpgsign` (DS-07), and `~/.local/bin` on PATH (`claude` didn't resolve in the agent shell).
- You in Desktop settings: bypass opt-in off; folder mode for `Downloads\repos` = default; remove stale entries (`C:\Users\dev\repos`, `…\slate7-tailnet`, `C:\Users\dev\Claude`); cloud environment per D10.

**Phase 5 — Empty `~/.claude` (exact list shown first)**
`claude plugin uninstall` for every user-scope plugin (removes the telemetry hook, LSP stubs, and ~3.8 GB of cache); remove `CLAUDE.md`, `settings.json` config keys, `rules/`, `hooks/`, `agents/`, `skills/`, `statusline.sh`, the 9 `.bak` files, `backups/`, `ts.json`, `ts2.json`, stray `.claude.json`, 8 `marketplaces/temp_git_*`, and the 3 stray Temp files from the audit agent. **Keep** `.credentials.json`, `projects/` (history + memory), `file-history/`. Then, once Phases 1–2 are merged and `git status`/`rev-list` show nothing unpushed: remove the local clones `Downloads/repos/{dev-setup,project-template}` and the parent `CLAUDE.md`, `README.md`, `.zed/` (their content lives in the Gist).

**Phase 6 — Ship readiness → next session**
File every remaining finding as a GitHub issue (with its evidence) in its repo, then `gh repo create <app> --template …` and start `/superpowers:brainstorming` there.

## Tool gaps (the recommendations and alerts you asked for, incl. my self-audit)

| Gap | Why it matters | Recommendation |
|---|---|---|
| **Audit agents weren't truly read-only** (self-audit) | A verifier wrote 3 files during plan mode because prompt-only rules aren't enforced | Give audit agents a read-only toolset (no Bash) or a PreToolUse guard that denies redirects; add a `/deep-audit` skill + `auditor` agent carrying GATE-0, instead of pasting it |
| Agents had no docs tool (TG-16, critic-12) | Several claims stayed INFERENCE; one docs subagent was **wrong** (parent CLAUDE.md loading) until I checked the live page | Keep context7 in the repo plugin set; verify doc claims with WebFetch of code.claude.com before acting |
| zizmor + pinact installed, never run (TG-03) | Free supply-chain checks sitting unused | Wired into CI in Phase 1 |
| vercel CLI missing (TG-04) | Deploy target is Vercel | Optional under cloud-first: use the Vercel GitHub integration; install the CLI only if you deploy locally (`npm i -g vercel`, pinned) |
| No link checking (TG-13) | homelab and the template are doc-heavy | `lychee` weekly in CI (winget `lycheeverse.lychee`) — later, as an issue |
| No tailnet drift check (homelab missed) | Live DNS/policy differs from the runbook, and nothing records it | A secret-free `tailscale status/dns status` snapshot script in homelab (you run it) — issue |
| MCP | TG-15 verdict: no new MCP gives leverage over `gh` + CLIs today | None now. Revisit a read-only homelab MCP only if the runbook becomes interactive |
| Considered, not adopted (TG-14) | Avoid tools for their own sake | docker/syft/cosign (no images yet), osv-scanner (trivy covers SCA), lefthook (one hook author), trufflehog (gitleaks suffices) |

## Flagged — your call (not executed by this plan)

1. **critic-04 (HIGH):** the Desktop filesystem extension has read/write on all of `~/.claude` including `.credentials.json`. Recommend disabling it or re-scoping it to a notes folder.
2. **HL-16:** there's no router backup at `~/slate7-ops` (per ADR-0002). Where is the current backup?
3. **SEC-001 / SEC-005:** key expiry looks disabled on all 5 nodes (INFERENCE, MED; check the Machines page), and Tailnet Lock is off.
4. **critic-09:** transcripts from ≥6 earlier sessions are gone from `~/.claude/projects` (file-history remains); cause unknown.
5. The **Kernel & Fleet** artifact (shared by link) still describes the old layout (`~/Claude/`, install.sh). Updating it changes shared content, so that needs your OK.
6. Cowork's memory still holds the full GATE-0 prompt. It's untouched, per D14.

## Learn by doing (your 5–10 lines)

In Phase 1 step 2 I'll scaffold `.claude/hooks/guard.js` with tests and leave `isSecretAccess(toolName, input)` for you. It's the security trade-off at the heart of the setup: matching `.env` in Bash text catches `cat .env` but can be dodged (`cat .e""nv`) and can false-positive on `echo .env.example`. Where you draw that line is the lesson.

## Verification (end to end, real output pasted)

- `bash tests/pre-commit.test.sh` and `node --test .claude/hooks/` pass; `actionlint`, `zizmor --offline .github/`, `shellcheck .githooks/*` are clean.
- Template PR: CI `universal` green, `node` skipped (no package.json); `gh api repos/git-commit-duke/project-template/rulesets` lists the ruleset; `gh repo view --json visibility,isTemplateRepository`.
- **Cloud check (D1/D2):** start a cloud session on a repo made from the template; confirm the plugins are enabled, `Read .env` and `cat .env` are blocked by the hook, and a commit shows `verified=true`.
- **Local check:** same three checks in a local session opened in the clone (not in `~/.claude`).
- `claude plugin list` shows nothing at user scope; `ls ~/.claude` shows only state; the backup zip lists every removed file.
- `git -C <clone> status` / `rev-list origin/main..main` = 0 before any clone is deleted.

## Awaiting approval (irreversible or outward-facing; each is asked again at execution with the exact list)

- [ ] Make project-template public; add rulesets; change merge settings on 3 repos
- [ ] Close dev-setup PR #1; archive dev-setup
- [ ] Publish the public Gist
- [ ] Uninstall all user-scope plugins; remove `~/.claude` config files and sediment (after the backup zip)
- [ ] Delete the local clones (dev-setup, project-template), the parent `Downloads/repos` files, and the 3 stray Temp files
- [ ] (Optional, flagged) update the Kernel & Fleet artifact; change the Desktop filesystem extension
