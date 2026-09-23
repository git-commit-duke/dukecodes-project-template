# Plan: the AI-workspace template, Sub-project A (Foundation)

## Resume state (read first after any compaction)
- **Where we are (2026-09-22, paused for a Claude restart onto Opus 5.5):**
  - **P0 is done and verified.** `~/.claude/settings.json`: bypass disabled, 39 dead `@inline` entries removed, 76 plugins → the 8-plugin build profile, everything else byte-identical (backup: `Downloads/claude-settings-2026-09-22.json`). Rewritten and tested: `CLAUDE.md` (58 lines, stale paths gone, session protocol added), `rules/shell.md`, `rules/adr.md`, `agents/maintainer.md`, `skills/checkpoint/SKILL.md`, `hooks/block-protected-files.js` (now fails closed, covers `.envrc` and key material), `hooks/session-start.sh` (worktree-safe, REST issues, prints `active.md`). Four dead skill symlinks removed. Memory rewritten: 6 files, all indexed.
  - **P0 items still yours:** the allowed-signers command, the Desktop connector and Cowork-plugin cleanup, and opening the build session on the clone.
  - **P1 is in progress on `~/.claude/plans/2026-09-22-foundation-implementation.md`.** Done: A1 (cloud gitleaks via the Go module proxy, with stub-`go` tests and a "no release download" assertion), A2 (PR ① runs Task 3 first), A3 (NUL-separated staged paths, `café/.env` test and fixture), A14 (web add-on installs the language server; pnpm only), and most of A4 (`[edit-only]` lockfile section, `isEditOnly`, `GUARDED_TOOLS`, glob checking for Grep/Glob, and the lint functions `matcherCoversTools`, `actionsPinned`, `allGreenCovers`).
  - **Nothing is executed.** No issue, commit or push exists, and the amended plan has **not** been re-verified yet.
- **Next actions, in order:**
  1. Finish A4: wire the three new lint functions into `run()`, add their tests, add the `Grep glob=".env"` case to guard.test and an `[edit-only]` case to paths.test.
  2. A5 REST ledger, A6 CI (shellcheck step, CI-script tests on Node 22 and 24), A7 repo settings as data, A8 small items (task order 11/12, gitignore fixture check, folded-frontmatter parser), A9 execution mechanics, A10 `scripts/test.sh`, A11 Definition of Done in the template CLAUDE.md, A12 `active.md`, A13 plugins.md note.
  3. New, from the repo audits, all small and tailored: A15 a shell-rule bullet that scripts agents call are non-interactive and idempotent and exit 0 on a no-op (axi); A16 a maintainer rule that a PR editing its own gates is reviewed against `main`'s version (no-mistakes' trusted-config rule); A17 an auditor rule that every CONCERNS is labelled `fix` or `ask-owner` (no-mistakes' finding taxonomy); A18 a checkpoint rule that a lasting rule needs two independent observations before it is written to memory (backpass).
  4. Rebuild and run `verify-plan.sh` with the new cases until it reports `0 failed`. Only then P2.
- **Repo audit verdicts (decided, not yet written into the plan's appendix):** adopt the four small ideas above; skip beads (a second ledger outside GitHub), no-mistakes' daemon and gate remote (a background service plus a second LLM pass per push), treehouse leases, lavish-axi's browser gate; defer gnhf's run caps to Sub-project B.
- **Your requests this turn, all to be honoured:**
  1. a Linus/Yegge readiness audit of this workstation (tools, env vars, setup) plus tools of value and a final audit;
  2. update **all** context artifacts so every session has accurate context;
  3. set up the core Claude Code files before building ("if this local session is not setup properly first…");
  4. a ground-zero-to-market **ship list** of every task a system architect / full-stack DevOps engineer does, no skips, referencing CCGS and firstmate, through the code-review and verification-before-completion lenses;
  5. no context lost across compactions. This block, the plan file, then memory (C1) and git (C3) carry it.
- **Research:** complete. firstmate and CCGS lifecycles are folded into the ship list appendix (adopt / avoid, with citations).
- **Your decisions (2026-09-22):**
  - core files: **build profile now** (preferences kept; 76 plugins → 8; bypass off; CLAUDE.md, rules, maintainer and checkpoint aligned);
  - build session: **Desktop, after cleaning the injected connectors and Cowork plugins**;
  - plans persistence: **private homelab repo**, `docs/plans/agent-workspace-template/`;
  - extra additions: **repo settings as data (A7)**, **one test runner (A10)**, **Definition of Done (A11)**. `.editorconfig` declined.
  - Cloud gitleaks needs no decision: the download is broken (F1), so `go install` is the only working path; the cached setup-script line stays optional.
- **Then:** ExitPlanMode. On approval, run P0 → P1 (re-verify with `verify-plan.sh`) → P2, each under the zero-trust protocol, and ask before Task 0.
- **Key paths:**
  - implementation plan `~/.claude/plans/2026-09-22-foundation-implementation.md`;
  - scratch (session temp) `…/scratchpad/`: `verify-plan.sh`, `extract-blocks.mjs`, `verify-final/`;
  - saved artifact copies `~/.claude/projects/C--Users-dev--claude/3b17c90b-…/tool-results/artifact-*.html` (Kernel and Fleet 637 lines, Setup Review 337 lines; both swept after 30 days);
  - cloud docs text `…/tool-results/toolu_017HX4rJVzunJHVieq6XxDcB.txt`.

## Pre-flight: readiness audit before execution (added 2026-09-22)

### Context

**Your request.** Before any build work:
- a Linus/Yegge audit that this workstation is set up to build the template (tools, env vars, setup scripts);
- an audit of the tools and resources worth using;
- one final audit of the plan.

Mid-turn you added two more:
- update every context artifact so all sessions start from accurate context;
- set up the core Claude Code files first ("if this local session is not setup properly first, how can we expect to produce and exceed expectations?").

**Method (read-only; nothing changed):**
- probes of tools, git, gh and `~/.claude/settings.json`;
- two explorers: all 76 enabled plugins, and an architecture walk of the plan's rebuilt final repo (`scratchpad/verify-final`, 17/17 checks green);
- primary docs: cloud-environments and claude-directory;
- reads of the 3 published artifacts.

**Outcome:** four short stages run **before Task 0**:
- **P0:** workstation core files;
- **P1:** amendments to the implementation plan, re-verified end to end;
- **P2:** context sync;
- **P3:** tools used during execution.

### Already right (FACT)
- **Tools at the plan's pinned versions:** semgrep 1.177.0, actionlint 1.7.12, zizmor 1.30.1, gitleaks 8.30.1. Also present: shellcheck 0.11.0, hadolint 2.15.1, jq 1.8.2, go 1.27, node 24.19, pnpm 12.4.2, gh 2.101, git 2.55, bash 5.3.
- **Git:** `core.autocrlf=false`, `core.eol=lf`, commits SSH-signed (`gpg.format ssh`, `commit.gpgsign true`), noreply email. Tracked scripts are LF.
- **Environment variables:** none required. `GH_TOKEN`/`GITHUB_TOKEN` are unset, matching ADR-0002's device flows. The `*_BIN` variables are test seams only.
- **GitHub:** all 3 repos private with issues on; Actions enabled (`allowed=all`); no open issues or PRs; the `workstation` label doesn't exist yet (Task 0 creates it).
- **Terminal:** `~/.bashrc:2` puts `~/.local/bin` (claude.exe) on PATH, so Task 14's `claude --setting-sources` probe works.
- **User hooks:** `block-protected-files.js` and `session-start.sh` conflict with no plan step.
- **State file:** `~/.claude.json` is present (the old review's "CHECK NOW" item is resolved).

### Findings, most severe first

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| F1 | CRIT | `cloud-bootstrap.sh` downloads a gitleaks release from GitHub, which returns 403 in every cloud session. The commit gate loses its secret scan there, and C2 can't pass | cloud-environments docs: "release-asset requests reach only repositories attached to the session … gets a 403" (FACT) | A1 |
| F2 | CRIT | The clone already has `core.hooksPath=.githooks`. The old hook fails every commit that adds no TODO (red run: 8 failures), so it refuses Task 2's ADR commit | `.git/config` (FACT) | A2 |
| F3 | CRIT | The spec and the 144 KB implementation plan live in `~/.claude/plans/`, which Claude Code deletes after 30 days. The memory file points at them | claude-directory docs: `plans/` swept after `cleanupPeriodDays`, default 30 (FACT) | C3 |
| F4 | HIGH | Commit-gate bypass: git quotes non-ASCII staged paths (`"caf\303\251/.env"`), so neither matcher recognises the file name | git `core.quotePath` default (FACT); the bypass itself is INFERENCE (HIGH), to be proven by A3's test | A3 |
| F5 | HIGH | Guard gaps: Grep `glob` and Glob `pattern` aren't checked (`Grep glob=".env"` searches `.env`). The hook matcher, the policy's tool list, the lockfile regex and the Edit denies are unchecked copies of each other | `policy.mjs:5-8`, `settings.json:33,50` (FACT) | A4 |
| F6 | HIGH | The cloud GitHub proxy serves only pinned pull-request GraphQL operations. `gh issue list/comment/create` use GraphQL, so the ledger, `/checkpoint` and `issue-tracker.md` probably break in cloud sessions | docs "GraphQL restrictions" (FACT); `gh issue` failing is INFERENCE (MED-HIGH) | A5 |
| F7 | HIGH | The plan promises "shellcheck prints nothing", but CI never shellchecks the `.sh` files. CI scripts run only on Node 24, while cloud sessions run 22 | `ci.yml` (FACT) | A6 |
| F8 | HIGH | User settings: `defaultMode: auto`, no `disableBypassPermissionsMode`, `ralph-loop` enabled. That's the "no brakes" mix, and it contradicts your "disable bypass" decision | `~/.claude/settings.json` (FACT) | P0-2 |
| F9 | HIGH | This session runs from `~/.claude`, which isn't a git repo. So repo CLAUDE.md, rules and agents never load; subagent worktree isolation can't work; the builder never runs under the project gates after PR ② | environment (FACT) | P0-4 |
| F10 | MED | Artifacts are stale. **Kernel and Fleet** (public link): dev-setup installer, `setup-wizard.sh`, CodeQL, and the homelab hardware line (L564-587, L482/500/555, L578). **Claude Setup Review** (pinned): recommends a live `duke-core` marketplace (contradicts ADR-0003), says repo plugins install in the cloud (refuted), rates learning-output-style NACK (you chose it) | artifact reads (FACT) | C4 |
| F11 | MED | Cowork skills still reach Code through `AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/`, despite `syncClaudeAiSkills:false` | `anthropic-skills:setup-claude` loaded from there (FACT) | P0-3 |
| F12 | MED | No `gpg.ssh.allowedSignersFile`, so signatures can't be verified locally | `%G?` error (FACT) | P0-1 |
| F13 | MED | `protect-repo.sh` states the desired settings 3 times (plan text, check, apply). The applied values and the ruleset "differs" branch are untested | `protect-repo.sh:37-46,65,81-86`, test `:60` (FACT) | A7 |
| F14 | LOW | Several small gaps (details in A8) | walk (FACT) | A8 |
| F15 | INFO | git pushes through Git Credential Manager (system gitconfig), not gh's token, which lacks `workflow`. GCM's scopes can't be read without touching credentials | gitconfig (FACT); scope UNVERIFIED | P0-5 |
| F16 | HIGH | The Desktop Code tab injects tools regardless of `~/.claude/settings.json` (details below). That breaks repo isolation, and the whole-filesystem server undercuts every gate | `session_connectors_status` (FACT) | P0-3 |
| F17 | HIGH | Plugin interference while building (details below) | plugin audit, file:line (FACT unless marked) | P0-2 |

**F16 details:**
- **10 claude.ai connectors** despite `disableClaudeAiConnectors:true`: Airtable 46, Lovable 41, Figma 40, Base44 24, GitHits 13, Economic Index 9, Claude Docs 8, Firecrawl 6, Context7 2, visualize 2.
- **Plugins absent from `enabledPlugins`**, loaded through the Desktop/Cowork route: **desktop-commander** (26 tools: whole-filesystem read/write and processes), `marketing:*` (13 servers), `airtable`, `dak:*`.

**F17 details:**
- **security-guidance:**
  - runs a background LLM review on every `git commit`/`push`, subagents' too, and can wake the session up to 20 times;
  - its Stop and SubagentStop hooks return `decision:block`, forcing up to 3 extra turns;
  - it injects a warning after the first write to each workflow file.
- **semgrep:** runs an 18 MB binary before and after every Write, Edit and Bash call. Its strings name `scanner.semgrep.ai` and "Not logged into Semgrep Guardian"; INFERENCE: it may send written code to Semgrep's cloud. R14 evidence.
- **Overhead on every tool call:** hookify (Python), data-agent-kit (node, with Google telemetry), convex (node).
- **data-engineering:** its Stop hook errors every time (`uv` missing).
- **Context injected at start and every compaction:** outputai 18.2 KB ("This project uses the Output.ai framework"); vercel 8.2 KB in some folders, including "Skip exploration… Start executing immediately".
- **Dead:** the 11 LSP plugins, whose language servers aren't installed.

**F14 details:**
- Task 11 registers `session-start.sh` before Task 12 creates it.
- `.gitignore` and the fallback regex are unchecked copies of the secret list.
- Nothing checks `all-green.needs` coverage.
- The frontmatter parser handles single-line values only.
- A pnpm failure is reported as a gitleaks problem.

### P0: workstation core files (before Task 0)
1. **[OWNER] Signature check.** Write `~/.config/git/allowed_signers` from your *public* signing key, then set `git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers`. Verify: `git -C C:/Users/dev/Downloads/repos/dev-setup log --format=%G? -1 28356b4` prints `G`.
2. **[ASK] `~/.claude/settings.json`.** First copy it to `Downloads/claude-settings-2026-09-22.json` (`~/.claude/backups/` is swept after 30 days). Then:
   - add `permissions.disableBypassPermissionsMode: "disable"`;
   - delete the dead `…@inline` entries;
   - reduce `enabledPlugins` to the **build profile** (8): superpowers, mattpocock-skills, learning-output-style (your choice), pr-review-toolkit, code-review, commit-commands, claude-md-management, context7. All 68 others go off (F17). semgrep and project-artifact come back through the repo's own `enabledPlugins` once PR ② merges, on purpose, so R14 is observed. claude-security is re-enabled for one run only if Task 22's optional scan is chosen.
   - Verify: `jq '[.enabledPlugins|to_entries[]|select(.value)]|length'` prints 8, and a new session's startup shows none of the outputai, vercel or explanatory text.
3. **[OWNER] Desktop host.** In Desktop, turn off the account connectors this build doesn't use (keep Context7 or rely on the plugin, not both), and remove the Cowork/Desktop plugins that reach Code (desktop-commander, marketing, airtable, data-agent-kit). Keep Cowork's own superpowers and semgrep.
   - Verify: in the new build session, `session_connectors_status` lists no desktop-commander and no unneeded connectors.
   - If the Desktop host can't be made clean, run the build session from a terminal with `claude` in the clone. The CLI honours `disableClaudeAiConnectors` and doesn't load Desktop's local-agent plugins (INFERENCE; verify the same way).
4. **Build session.** Open a new Claude Code session with the folder `C:\Users\dev\Downloads\repos\project-template` and effort high. The orchestrator starts by reading `~/.claude/plans/2026-09-22-foundation-implementation.md`. Subagents use `isolation: "worktree"`, or the plan's per-PR worktrees under `.claude/worktrees/`.
5. **[OWNER, only if Task 7's push is refused "without `workflow` scope"].** Run `gh auth refresh -h github.com -s workflow`, then `gh auth setup-git`. That leaves one credential path, with scopes visible in `gh auth status`.
6. **Optional.** `winget install Schniz.fnm` and `fnm install 22` for local Node 22 parity. CI's matrix covers it anyway.
7. **[ASK] Core files.**
   - `~/.claude/CLAUDE.md:42`: clones live in `C:/Users/dev/Downloads/repos` and are throwaway; GitHub is canonical; build sessions open in the clone, not in `~/.claude`.
   - `~/.claude/rules/shell.md`: align with the template's shell rule (Git Bash **and** Linux; no `grep -q` under `pipefail`; `*_BIN` seams).
   - `~/.claude/agents/maintainer.md` and `skills/checkpoint/SKILL.md`: align with the template versions (checkpoint gains A5's cloud REST fallback).
   The user-level copies stay until every repo carries its own.

### P1: amendments to `2026-09-22-foundation-implementation.md`
Then rerun `scratchpad/verify-plan.sh`, extended with the new cases; every check must pass.

- **A1, cloud gitleaks.** Install with `GOBIN="$HOME/.local/bin" go install github.com/zricethezav/gitleaks/v8@v8.30.1`.
  - FACTs: the module exists on proxy.golang.org at commit 8d1f98c7 and needs Go ≥ 1.24.11; Go is preinstalled in the cloud; proxy.golang.org and sum.golang.org are on the Trusted list, and Go checks every download against sum.golang.org.
  - Remove the curl + sha256 path and the `CURL_BIN` seam; add a `GO_BIN` seam. Tests: a stub `go` records its arguments (asserts `@v8.30.1` and `GOBIN`), and a failing `go` produces a WARN.
  - Update S25 and the Global Constraints to match.
- **A2, PR ① order.** The pre-commit fix (Task 3) becomes PR ①'s first commit, ahead of the ADRs. The plan says why (F2).
- **A3, NUL-separated staged paths.** The hook uses `git diff --cached --name-only --diff-filter=ACMR -z`, and `staged-secrets.mjs` splits on NUL. The test stages `café/.env` and expects a refusal; the fixture table gains a non-ASCII row.
- **A4, guard inputs are one list each.**
  - `policy.mjs` also checks Grep `glob` and Glob `pattern`, blocking when the glob matches any `secret` fixture name. The fixture table doubles as the probe set.
  - `policy.mjs` exports `GUARDED_TOOLS`; check-workspace requires the settings matcher to equal it.
  - Lockfile names move into a `[edit-only]` section of `secret-paths.txt`, read by the policy and checked against the settings Edit denies.
- **A5, cloud-safe GitHub calls.**
  - The session-start ledger reads `gh api "repos/{owner}/{repo}/issues?state=open&per_page=10"` over REST, dropping pull requests, and gets a stub-gh test of the working path.
  - `/checkpoint` and `issue-tracker.md` gain the REST forms, plus: "In cloud sessions use the built-in GitHub tools; `gh issue …` uses GraphQL, which the cloud proxy may refuse (its 403 names the REST fallback)."
- **A6, CI gates the plan promises.**
  - `universal` runs `shellcheck -S style` on every tracked shell file. FACT: the Ubuntu 24.04 runner ships shellcheck 0.9.0, pipx 1.16.7 and jq 1.7. Local is 0.11.0. INFERENCE: code that is clean under 0.11 should be clean under 0.9; LOW risk, and CI shows it on PR ①.
  - check-workspace asserts every tracked `.sh` is covered, and that `all-green.needs` lists every job except dependency-review.
  - The `.github/scripts/*.test.mjs` runs move into the Node 22/24 matrix.
- **A7, desired state as data (your choice).** The repo settings per visibility live in one file that both `protect-repo.sh` apply and `--check` read. Tests compare the apply payload with what check expects, and cover the ruleset "differs" branch and `--check` on a private repo.
- **A8, small items.**
  - Build `session-start` (Task 12) before `settings.json` (Task 11).
  - The bootstrap reports gitleaks and pnpm failures separately.
  - Every non-home `secret` fixture must be ignored (`git check-ignore --no-index`), and the fallback regex must match every env fixture.
  - The frontmatter parser accepts quoted and folded (`>`) descriptions, or the lint fails loudly on them.
- **A10, one test runner (your choice).** `scripts/test.sh [group]` holds the list of test paths (`all`, `hooks`, `ci`). CI, `/checkpoint` and CLAUDE.md all call it, and `testsWired` checks the runner instead of `ci.yml`. Delete it and the list reappears in four places, so it earns its keep.
- **A11, Definition of Done (your choice).** A short DoD section in `CLAUDE.md`, and `/checkpoint` refuses to finish while any line is unmet:
  1. a test that failed first now passes, with output;
  2. every check in `scripts/test.sh` green;
  3. maintainer ACK;
  4. one logical change, signed commit;
  5. an ADR when a contract changed;
  6. the ledger updated (issue comment with evidence);
  7. nothing left only on this machine.
  Taken from the ship list's biggest gap, and from firstmate's script-rendered DoD.
- **A12, state that survives compaction.** `/checkpoint` writes `.claude/state/active.md` (current task, next command, open decisions; gitignored). `session-start.sh` prints it when it exists, including on `compact`, so a compacted session resumes from the file rather than from memory. CCGS's `active.md` pattern, without their PreCompact hook, whose output never reaches context (FACT).
- **A13, plugin inventory honesty.** `docs/agents/plugins.md` records for semgrep: an 18 MB binary on every Write, Edit and Bash call, strings naming `scanner.semgrep.ai`, and that it may send written code to Semgrep's cloud (INFERENCE, to be confirmed by R14's cloud observation).
- **A9, execution mechanics.**
  - After each `gh pr create`, bind the PR with the desktop app's PR tools (`bind_pr`, `get_status`, `set_monitor`) instead of `gh pr checks --watch`; keep the `check-runs` read-back as app-id evidence.
  - Reviews per PR: `maintainer` (ACK/NACK); `pr-review-toolkit:silent-failure-hunter` on PR ② to hunt fail-open paths; `pr-test-analyzer`. Before publishing (Task 22), an optional `claude-security` scan.

### P2: context sync
- **C1, memory.**
  - Update `agent-workspace-template-foundation` (pre-flight done, amendments, build-session folder, plan location) and `cowork-isolated-sandbox` (the skills-plugin route still leaks).
  - Add reference memory `cloud-environment-facts`: release-asset 403, pinned GraphQL, Go proxy allowed, Node 20–22, no shellcheck, setup-script cache ~7 days, user hooks don't run in the cloud; with doc URLs.
  - Update `MEMORY.md`.
- **C2, core files.** As P0-7.
- **C3, persist the plans [ASK].** Commit the spec (this file) and the implementation plan to private `homelab` under `docs/plans/agent-workspace-template/` via a PR. Memory points to the repo copy; `~/.claude/plans/` stays the working copy.
- **C4, artifacts.** Read every line first, then republish to the same URL so links and pins survive.
  - **Kernel and Fleet** (public link):
    - Part 3 "installed here" lists the template's gates and agents.
    - Part 5's ladder shows Semgrep, gitleaks, actionlint, zizmor and the workspace lint (no CodeQL).
    - Part 8 shows agent-workspace-template, a private homelab repo, cloud-first, a thin `~/.claude`, and no installer.
    - The homelab hardware and tailnet line becomes "a private homelab repo" (R16).
    - Add "last verified" with a date.
  - **Claude Setup Review** (private, pinned):
    - A status banner: historical, superseded by ADR-0003 and the Foundation plan.
    - A status on each blocker: done, superseded or open, and where it's tracked.
    - Its refuted and reversed claims corrected.
    - Its release-asset warning kept, marked verified.
  - **while(true)** is a game with no workspace content; unchanged.
- **C5, old plans.**
  - Add a one-line status header to `fullstack-…-reflective-melody.md` (superseded where it conflicts with this spec) and to `playful-toasting-toucan.md` (Slate 7 work, tracked in homelab).
  - New homelab `workstation` issue: move the Slate 7 deliverables out of `~/.claude/projects/slate7-tailnet/` into git.

- **C6, ship list.** Once refined (appendix below):
  - commit it with the plans to homelab (C3);
  - publish it as a private artifact "Ship list", linked from Kernel and Fleet's pipeline part;
  - name it on the Sub-project B issue as B's input. Every **gap** row becomes a B design question or a stack add-on item.
- **C7, nothing lost to compaction.** Five carriers, in order of durability:
  1. git: plans committed (C3), issues and PR comments by `/checkpoint`;
  2. memory, never swept: C1, plus a one-line `MEMORY.md` pointer to the resume block;
  3. this file's Resume state block, re-attached after every compaction; updated at each stage boundary (P0/P1/P2/Task n);
  4. the implementation plan's checkboxes, ticked as tasks finish;
  5. a small orchestrator context: subagent-driven execution, one fresh subagent per task, with `mark_chapter` at each PR.
  A PreCompact hook is not used, because its output never reaches context (FACT).

### P3: tools of value (automation-recommender lens)
- **Use:**
  - the desktop app's PR tools, with Auto-fix offered on CI failures;
  - Agent `isolation: "worktree"`, which needs P0-4's repo folder;
  - the pr-review-toolkit agents;
  - `claude-code-guide` for Claude Code doc questions;
  - context7 for library docs;
  - the built-in browser to open the GitHub pages for your manual steps (Claude App install, rulesets);
  - `mark_chapter` once per PR.
- **Later (Sub-project B):**
  - a PostToolUse hook that shellchecks edited `.sh` files, turning the shell rule into a gate;
  - a Stop-hook reminder to run `/checkpoint`.
- **Skip:**
  - `anthropic-skills:setup-claude`: Cowork onboarding with connectors, which contradicts your connectors-off decision;
  - the Workflow tool, unless you say "use a workflow";
  - hosted reviewers on private repos;
  - `claude-security` in CI, which is token-heavy and on-demand only.

### Architecture candidates (improve-codebase-architecture)
| # | Candidate | Strength | Default |
|---|---|---|---|
| 1 | Staged paths NUL-separated, so the encoding stays out of the matcher's interface | Strong | in plan (A3) |
| 2 | Guard tool, lockfile and glob lists: one source each, checked by the lint | Strong | in plan (A4) |
| 3 | CI runs every promised gate (shellcheck, Node 22, `all-green` coverage) | Strong | in plan (A6) |
| 4 | Repo settings as data, shared by protect-repo apply and `--check` | Strong | ask (A7) |
| 5 | One test runner (`scripts/test.sh <group>`) that CI, `/checkpoint` and CLAUDE.md all call; `testsWired` checks the runner. Delete it and the list reappears in 4 places | Worth exploring | ask |
| 6 | The fixture table checks `.gitignore` and the fallback regex | Worth exploring | in plan (A8) |
| 7 | session-start and bootstrap success paths tested end to end | Worth exploring | in plan (A5, A1) |
| 8 | Deeper frontmatter and test-wiring parsers; `settingsNames` leaking into the matcher's interface | Speculative | partly (A8) |

Deletion-test verdicts: the `guard.mjs`/`policy.mjs` split and `staged-secrets.mjs` earn their keep. `decide`'s `list` parameter is a hypothetical seam (one adapter), left as it is.

### Resolution ledger: every finding fixed at the root, proven, and kept fixed

Rules for this ledger:
- Findings are worked **in severity order**, one at a time.
- A finding is **resolved** only when its proof has been produced in that session and pasted into the issue. Not "should be fine", not "will be covered later".
- Every resolution names the thing that stops it coming back. A fix with no gate is not durable, and counts as unresolved.
- If a proof fails, the fix is redone. Nothing is waived, and no finding is carried into the next one.

| # | Durable fix (root cause) | Proof | Stays fixed by |
|---|---|---|---|
| F1 | Cloud installs gitleaks through the Go module proxy, which the Trusted list allows; the release download disappears | Stub-`go` test asserts `@v8.30.1` and `GOBIN`; C2 in a real cloud session shows a fake token refused | Lint rule: no `releases/download` URL in any committed script |
| F2 | The hook fix becomes PR ①'s first commit, so the repo is never in a state where its own gate blocks it | That commit succeeds with the gate on; `git log --show-signature` verifies it | The pre-commit test drives a real `git commit` |
| F3 | Both plans and the ship list are committed to private homelab; `~/.claude/plans` becomes a working copy | The homelab PR is merged and the files open from the repo | DoD line 7: nothing left only on this machine |
| F4 | The commit gate reads staged paths NUL-separated, so path encoding leaves the matcher's interface | A staged `café/.env` is refused, in the test output | A fixture row plus the test, run by CI |
| F5 | One list per concept: `GUARDED_TOOLS` exported by the policy, lockfiles in the shared list, globs checked against the fixtures | `Grep glob=".env"` blocked; lint fails when the matcher and the tool list differ | check-workspace equality rules |
| F6 | Ledger and checkpoint use REST, which the cloud proxy allows; docs name the fallback | Stub-gh test shows the REST endpoint; C2 shows the ledger listing real issues in the cloud | The stub test pins the endpoint shape |
| F7 | CI runs every gate the plan promises, on the Node versions sessions use | shellcheck step green; hooks matrix green on 22 and 24 | Lint: every tracked `.sh` covered; `all-green` needs every gating job |
| F8 | Bypass disabled and the plugin set cut to the build profile; the repo's own settings re-assert it for build sessions | `jq` shows the setting and 8 plugins; a fresh session shows none of the injected blocks | Repo `settings.json` carries `disableBypassPermissionsMode` into every session |
| F9 | Build sessions open in the clone, so repo context and gates apply and worktree isolation works | `git rev-parse --show-toplevel` is the clone; the guard blocks a canary read there | Resume state block names the folder; protocol step 0 checks it |
| F10 | Both artifacts rewritten to current truth, with a "last verified" date | A grep of the republished pages finds no `dev-setup`, `CodeQL` or `Slate 7` | Memory records the artifact URLs and that each sub-project ends by refreshing them |
| F11 | Cowork/Desktop plugins disabled at the source, not worked around | `session_connectors_status` shows no desktop-commander and no unused connectors | Protocol step 0 runs that check at the start of every build session |
| F12 | Allowed-signers file configured, so signatures verify locally | `%G?` prints `G` on a signed commit | The per-PR audit checks every commit is signed and verified |
| F13 | Desired repo settings become one data file that apply and `--check` both read | Test compares the apply payload with what check expects; the "differs" branch is covered | The shared file; drift shows up as a failing `--check` |
| F14 | Each small gap fixed at its source (order, messages, fixtures, parser) | Their tests pass in the extended verify run | The tests and lint rules added with them |
| F15 | One credential path with visible scopes, if the first push is refused | `gh auth status` lists `workflow`; the push succeeds | Recorded in memory, so it is known, not rediscovered |
| F16 | Same as F11: fixed in the Desktop host, with the CLI as the fallback | Same connector check, in the build session | Protocol step 0 |
| F17 | Interfering plugins off; the two the template keeps are documented with their real behaviour | A build session runs a write, an edit and a commit with no extra hook output | `plugins.md` records hooks and MCP servers, reviewed on every update |

### Runtime decision for the gate code (measured 2026-09-22)

The guard, the commit-gate matcher and the CI scripts stay plain Node `.mjs`, with no build step and no TypeScript.

| Option | Startup | Where it runs |
|---|---|---|
| Node `.mjs` (chosen) | 110 ms per guarded call measured; bare Node startup is 59 ms of that, and `git status` is 46 ms | Preinstalled in cloud images (20, 21, 22), on this machine, and on GitHub runners |
| Go binary | ~5 ms (INFERENCE) | Needs building and distributing per platform; a cloud session cannot fetch another repository's release assets, so binaries would have to be committed into a public template: bloat, and gates nobody can read in a diff |
| Deno | fast | Not in the cloud image at all (FACT: zero mentions in the cloud docs) |
| Bun | fast | Present in the cloud image, but its docs flag proxy compatibility problems; not installed locally |

- TypeScript for the gates is rejected: native type stripping needs Node ≥ 22.18 and the cloud minor is unpinned, so a `.ts` gate might not start there. A build step would put unreviewable output in the repo.
- `tsc --checkJs` over the gate code was tried and found **no real defects**, only missing Node type definitions; wiring it up needs global installs in a repo that deliberately has no `package.json`. Rejected as friction without gain. The safety net stays the tests, on Node 22 and 24.
- Node is this template's requirement, not Claude Code's: the CLI is a standalone binary. The README says so.
- If per-call latency ever matters, the escape hatch is to build a binary in CI and publish it to **this repository's own** releases, which an attached cloud session may download.

### Zero-trust execution protocol (your rule: never skip, never assume, audit before moving on)

Applies to every task in the implementation plan, and to P0–P2 here.

0. **Session preflight, before any work in a session.** Confirm the folder is the clone (`git rev-parse --show-toplevel`), the commit gate is on (`git config core.hooksPath`), the connector list is clean (no desktop-commander, no unused connectors), and the plugin count is the build profile. A failed preflight is fixed before anything else; it is never worked around.
1. **One task at a time, in plan order.** No task starts while an earlier one is unaudited. Tasks that a step depends on are named in that step. A fix is made at its source: no patch that leaves the cause in place, and no "note it for later" in place of a fix.
2. **Evidence or it didn't happen.** Every "done" carries the command and its real output in the same turn. No claim from memory, no "should work".
3. **Independent audit before moving on.** A read-only `auditor` subagent re-runs the task's verification, inspects the diff, and returns **PASS / CONCERNS / FAIL** with `file:line` (CCGS's vocabulary, strictest verdict wins). The builder never audits itself.
4. **Chain of verification.** The audit answers five challenges, at least two of them by running a tool, not by reading: does the test fail without the fix; does the gate block the bad case; is the output from this run.
5. **CONCERNS or FAIL blocks.** FAIL returns to the builder. CONCERNS is fixed or recorded as a named follow-up issue before the next task, never carried silently.
6. **Tracked in three places, always in this order:** the implementation plan's checkbox, the issue checkbox with the evidence comment, then the commit. Anything unticked is unfinished by definition.
7. **Decisions are held, not dropped.** An open question becomes a `needs-decision` note on the issue with a key, and stays open until a matching `resolved` comment lands (firstmate's pattern).
8. **Nothing is "landed" until it is merged.** A worktree is removed only after the branch is merged and the content is on `main` (firstmate's landed test).
9. **Per-PR completion audit.** Before the PR is opened: `scripts/test.sh all`, the workspace lint, and a check that every task checkbox has evidence. The PR body carries the outputs.
10. **Gate context is not orchestrator context.** A reviewing agent never takes over the build, and the maintainer's NACK is final until fixed.

### Appendix: ship list, ground zero to market

Every task, in order. The tag says who carries it:
- **A:** this Foundation template (✓ = already in the plan);
- **B:** Sub-project B (orchestration layer);
- **S:** a stack add-on or the product repo;
- **O:** an owner decision or manual step;
- **W:** workstation or private homelab.

Gaps are marked **gap**.

**0. Operator and workstation**
- 0.1 Accounts with 2FA/passkeys; noreply email (O ✓).
- 0.2 Signing key with a passphrase, running agent, allowed signers (W, P0-1).
- 0.3 Toolchain installed and pinned (W ✓ verified).
- 0.4 CLIs signed in by device flow; no tokens in env (W ✓ ADR-0002).
- 0.5 AI workspace trimmed: plugins, connectors, bypass off (W, P0).
- 0.6 Cloud environment and GitHub App scope (O, Task 23).
- 0.7 Config backup and restore (W).
- 0.8 Readiness check of versions, auth and PATH (W, P0 verification).

**1. Discovery**
- 1.1 Problem and target user, job to be done (O; brainstorming).
- 1.2 Market and competitor scan (O; research).
- 1.3 Value proposition; north-star and guardrail metrics (O).
- 1.4 Constraints: budget, time, legal, platform (O).
- 1.5 Riskiest assumptions, answered by spikes in `prototypes/` (O; A ✓ rule).
- 1.6 Go/no-go recorded as an ADR (O; A ✓).

**2. Product definition**
- 2.1 Personas and user journeys (O).
- 2.2 User stories with acceptance criteria (B).
- 2.3 Non-functional requirements: performance, SLO targets, scale, accessibility, i18n, privacy, security, cost (B; **gap**).
- 2.4 MVP cut (O).
- 2.5 Domain glossary, `CONTEXT.md` (A ✓).
- 2.6 Acceptance-test outline (B).
- 2.7 Spec approved: human gate (A ✓ flow).

**3. Architecture**
- 3.1 System context, C4 level 1 (B).
- 3.2 Quality attributes that drive the design (B).
- 3.3 Containers and deployment topology (B/S).
- 3.4 Data model, data flows, ownership (S).
- 3.5 Interface contracts and versioning policy (S).
- 3.6 Stack choice by ADR (A ✓).
- 3.7 Threat model: STRIDE, trust boundaries, abuse cases (B; **gap**).
- 3.8 Data classification and retention (B/O).
- 3.9 Capacity and cost model (S).
- 3.10 Failure modes, resilience, disaster recovery (RPO/RTO) (S).
- 3.11 Build-vs-buy and third-party risk (O).
- 3.12 Architecture review: human gate plus ADRs (A ✓).

**4. Planning**
- 4.1 Vertical, testable slices (A ✓ writing-plans).
- 4.2 Issues, labels and milestones in the ledger (A ✓).
- 4.3 Dependencies and critical path (B).
- 4.4 Release cadence: feature window → fixes only → release (B).
- 4.5 Definition of Ready and Definition of Done (B; **gap**).
- 4.6 Risk register (A ✓ pattern).

**5. Repo foundation (this sub-project)**
- 5.1 Create from the template; choose visibility (A ✓).
- 5.2 Ruleset: PR required, `all-green`, signed commits, merge commits only (A ✓).
- 5.3 Dependabot, secret scanning, push protection, private vulnerability reporting (A ✓).
- 5.4 README, LICENSE, SECURITY (A ✓); CONTRIBUTING, CODEOWNERS (**gap**, low for a solo dev).
- 5.5 Agent context: CLAUDE.md, CONTEXT.md, rules, agents, skills (A ✓).
- 5.6 Agent gates: permissions, guard, pre-commit, session start (A ✓).
- 5.7 CI: universal + stack jobs + all-green (A ✓).
- 5.8 Issue and PR templates (A ✓).
- 5.9 `.gitignore` and `.gitattributes` (A ✓); `.editorconfig` (**gap**, trivial).
- 5.10 Workspace lint (A ✓).

**6. Dev environment**
- 6.1 Reproducible environment: version files, `packageManager` (S; **gap**: `.node-version`).
- 6.2 Local services such as a compose DB (S).
- 6.3 Formatter, linter, type checker (S).
- 6.4 Commit gate switched on automatically (A ✓).
- 6.5 Editor/LSP (S).
- 6.6 Seed data and fixtures (S).
- 6.7 Env contract: `.env.example` and a platform secret store (A ✓).
- 6.8 Standard script names (A ✓ CI contract).

**7. Build**
- 7.1 A branch or worktree per task; small signed commits (A ✓).
- 7.2 Test first (A ✓).
- 7.3 Keep contracts (A ✓).
- 7.4 Feature flags for unfinished work (S).
- 7.5 Error-handling and logging conventions (S).
- 7.6 Accessibility and i18n (S web).
- 7.7 Performance budgets (S).
- 7.8 Run it and look at it before claiming done (A ✓ rule; browser senses in B).
- 7.9 Review: maintainer ACK plus specialists (A ✓, A9).
- 7.10 Checkpoint: commit, push, PR, ledger (A ✓).

**8. Testing**
- 8.1 Unit tests (S; A ✓ rule).
- 8.2 Integration and contract tests (S).
- 8.3 End-to-end tests (S web).
- 8.4 Test data (S).
- 8.5 A regression test for every bug (A ✓ rule).
- 8.6 Performance and load tests (S).
- 8.7 Accessibility tests (S).
- 8.8 Browser and device matrix (S).
- 8.9 Security tests: SAST, secrets, dependency review (A ✓); DAST (S; **gap**).
- 8.10 Flaky-test and mutation checks (B).
- 8.11 User acceptance sign-off: human gate (O).

**9. Security and compliance**
- 9.1 Threat model kept current (B; **gap**).
- 9.2 Dependency updates and pinning (A ✓); SBOM (**gap**).
- 9.3 Supply chain: SHA-pinned actions, zizmor, signed commits (A ✓); build provenance attestations (**gap**).
- 9.4 Secrets in platform stores (A ✓); rotation (O).
- 9.5 AuthN/AuthZ review (S).
- 9.6 Headers, CSP, input validation (S web-security rule).
- 9.7 Vulnerability disclosure (A ✓).
- 9.8 Dependency license compliance (S; **gap**).
- 9.9 Privacy law: GDPR/CCPA, consent, data-subject rights (O/S).
- 9.10 Audit logging (S).
- 9.11 Pre-launch security review or pen test (O).

**10. CI/CD and release**
- 10.1 Required gates, `all-green` (A ✓).
- 10.2 Reproducible, cached builds (S).
- 10.3 A preview deploy per PR (S).
- 10.4 SemVer and changelog (B; **gap**).
- 10.5 Tags, release notes, release-candidate cadence (B; **gap**).
- 10.6 Staging → production with environment protection rules (S).
- 10.7 Rollback and kill switches (S).
- 10.8 Migrations in the pipeline, expand then contract (S).
- 10.9 Post-deploy smoke tests (S).

**11. Infrastructure**
- 11.1 Environments: dev, preview, staging, production (S).
- 11.2 Infrastructure as code, planned in CI (S).
- 11.3 DNS and TLS (S/O).
- 11.4 Least-privilege access (S).
- 11.5 Cost budgets and alerts (S/O).
- 11.6 Backups and restore drills (S).
- 11.7 Secrets per environment (S; ADR-0002).

**12. Data**
- 12.1 Schema and migrations (S).
- 12.2 Retention and deletion (S/O).
- 12.3 Analytics event plan (S).
- 12.4 Backups verified (S).

**13. Observability and reliability**
- 13.1 Structured logs (S).
- 13.2 Metrics and dashboards (S).
- 13.3 Tracing (S).
- 13.4 Error tracking (S).
- 13.5 SLIs, SLOs, error budgets (S).
- 13.6 Alerts and notifications (S/O).
- 13.7 Runbooks and incident process (B; homelab has runbooks).
- 13.8 Uptime checks and status page (S).
- 13.9 Blameless postmortems that feed issues and ADRs (B).

**14. Launch**
- 14.1 Go/no-go checklist: human gate (B; **gap**).
- 14.2 Legal: terms, privacy policy, cookie consent (O).
- 14.3 Pricing, billing, tax (O/S).
- 14.4 User, API and onboarding docs (S).
- 14.5 SEO, Core Web Vitals, social previews (S web).
- 14.6 Analytics and feedback channels (S).
- 14.7 Support channel (O).
- 14.8 Site, announcement, changelog, roadmap (O).
- 14.9 Capacity and rate limits (S).
- 14.10 Final security sign-off (O).
- 14.11 Production deploy, verify, rehearse rollback (S).

**15. Operate and iterate**
- 15.1 Watch SLOs, errors and cost (S).
- 15.2 Triage feedback into the ledger (B).
- 15.3 Weekly Dependabot (A ✓).
- 15.4 Security patches and advisories (A ✓ partial).
- 15.5 Release cadence (B).
- 15.6 Experiments with guardrails (S).
- 15.7 Tech-debt budget and architecture reviews (B; improve-codebase-architecture).
- 15.8 Deprecation policy, never breaking userspace (A ✓ rule).
- 15.9 Access and secret reviews (O).
- 15.10 Template improvements reach existing repos by PR (A ✓ ADR-0003).

**16. Governance and knowledge (continuous)**
- 16.1 ADRs (A ✓).
- 16.2 Keep `CONTEXT.md` current (A ✓).
- 16.3 Ledger and memory hygiene; checkpoints (A ✓).
- 16.4 README first screen as the onboarding page (A ✓).
- 16.5 Delivery metrics: lead time, change failure rate, MTTR (DORA) (B; **gap**).
- 16.6 Retrospectives (B/O).

**Tasks the two reference repos surfaced, folded into the phases above**
- 1.7 Brownfield entry: reverse-document an existing codebase and migrate rather than replace (B; CCGS `/adopt`).
- 4.7 Traceability IDs from requirement to ADR to task, never renumbered (B; CCGS `tr-registry.yaml`).
- 4.8 Definition of Ready beside the Definition of Done (B; DoD itself now A, via A11).
- 4.9 Delivery mode and merge authority kept separate, per task (A ✓ ask rules and ruleset; per-task modes in B; firstmate).
- 7.11 Status verbs on agent work: working, needs-decision, blocked, paused, done, failed, appended to the issue (B; firstmate).
- 7.12 Worker isolation asserted before writing: a worker in the primary checkout stops (B; firstmate).
- 8.12 Test-evidence matrix by change type, blocking vs advisory (B; CCGS story-done).
- 8.13 Tests for skills and agents themselves (B; CCGS skill-test).
- 10.10 A CI attestation bound to the head SHA, proving the pipeline ran (B; firstmate `no-mistakes-required.yml`).
- 10.11 A repo-invariants CI job: personal state untracked, pointer files intact (A, partly, via check-workspace; firstmate `ci.yml`).
- 12.5 Post-mortem template feeding issues and ADRs (B).
- 14.12 Go/No-Go per area before launch (B; CCGS `/launch-checklist`).
- 15.11 Hotfix path: severity, branch, fix, QA re-entry, deploy, verify (B; CCGS `/hotfix`).
- 15.12 Patch notes and changelog for users (B).
- 16.7 A machine-readable phase catalog with artifact checks, powering both help and gate-check (B; CCGS `workflow-catalog.yaml`).
- 16.8 Review intensity modes, full / lean / solo, overridable per run (B; CCGS).
- 16.9 Model tiering per skill and agent (B; CCGS `coordination-rules.md`).
- 16.10 Session state file and resume after compaction (A ✓ via A12; CCGS `active.md`).

**Adopt from the references (evidence-backed)**
- Scripts own mechanics, agents own judgment (firstmate VISION.md).
- A Definition of Done rendered by a script, not prose (firstmate `fm-dod-lib.sh`) → A11.
- Evidence is not authorization; escalations carry requirement, proposed expansion, smallest compliant alternative, consequences, recommendation (firstmate AGENTS.md §7).
- Teardown refuses unlanded work (firstmate `fm-teardown.sh`) → protocol rule 8.
- Keyed `needs-decision` / `resolved`, with `paused` distinct from `blocked` (firstmate) → protocol rule 7.
- PASS / CONCERNS / FAIL, strictest verdict wins (CCGS `director-gates.md`) → protocol rule 3.
- Chain-of-verification with at least two tool actions (CCGS `gate-check`) → protocol rule 4.
- Phase catalogue with artifact globs and `min_count` (CCGS `workflow-catalog.yaml`) → 16.7, Sub-project B.
- Path-scoped rules (CCGS `.claude/rules/`) → A ✓ already.

**Avoid (with reasons)**
- CCGS's 49-agent, three-tier org chart and 15 engine agents: role theatre and token cost.
- CCGS's advisory-only gates with no CI: nothing deterministic enforces the pipeline (INFERENCE from its own docs' contradictions).
- CCGS's per-write "May I write this?" approval: incompatible with parallel agents; gate at merge instead.
- firstmate's 13 harnesses, 7 hook directories, 6 backends, 200+ scripts and ~60 state file kinds: this template targets one harness.
- firstmate's nautical vocabulary tables: tokens on every turn.
- Coupling to private toolchains (no-mistakes, the various `*-axi` tools).

**Readout.** Foundation (A) covers phases 5–7 and the gates of 8–10, and now also the Definition of Done (A11), one test runner (A10) and repo settings as data (A7), which you chose. Remaining **gaps** are Sub-project B's inputs, and none is added to Foundation silently:
- non-functional requirements (2.3);
- the threat model (3.7, 9.1);
- release engineering (10.4–10.5, 10.10);
- launch Go/No-Go (14.1, 14.12);
- supply-chain extras: SBOM, attestations, licenses;
- DORA metrics (16.5);
- the phase catalogue and review modes (16.7–16.9).

`.editorconfig` was offered and not chosen, so it stays out.

### Verification of the pre-flight
- **P0:**
  - `%G?` prints `G`;
  - `jq` shows `disableBypassPermissionsMode`, no `@inline` entries, and the kept plugin set;
  - in the new build session, the startup context is visibly smaller (`/context`) and `git rev-parse --show-toplevel` is the clone.
- **P1:** `bash scratchpad/verify-plan.sh` reports `0 failed`, including the new cases:
  - `café/.env` refused;
  - `Grep glob=".env"` blocked;
  - the stub `go` install;
  - the REST ledger stub;
  - the shellcheck and matcher-equality lint rules;
  - `all-green` coverage.
- **P2:**
  - memory files read back;
  - the homelab PR merged;
  - both artifacts republished;
  - a grep of the new Kernel and Fleet shows no `dev-setup`, `CodeQL` or `Slate 7`.

## Context

**Goal (your words):** a bulletproof AI workspace for orchestrating multi-agent workflows, an AI-framework masterclass that every future repo starts from. It's grounded in your Kernel & Fleet operating model, and in Claude-Code-Game-Studios (CCGS) as a reference: adopt its machinery, not its 49-agent org chart (Kernel & Fleet, Part 9).

**Decomposition (S22):** **A. Foundation** covers the gates, CI, lock-down, docs and scaffold, and is this plan. **B. Orchestration layer** covers roles, pipeline skills, saved multi-agent workflows, senses, agent and skill evals, and the operating-model doc. B gets its own grilling → spec → plan once A's CI is green, because agents are only trustworthy on top of deterministic gates.

**How we got here:**
- The previous session's workspace audit, then grilling rounds 0–5 in this session (S1–S22).
- Four lens reviews of the drafts.
- Three adversarial audits of this plan (correctness / process / docs). I verified every load-bearing claim myself: 2 claims were refuted, 1 critical bug confirmed.
- A final byte-by-byte pass: my own (12 defects fixed) plus two fresh auditors.

**Day-one success criteria (S1):**
1. CI is green on the first push.
2. Claude follows the rules in a cloud session.
3. One command locks down GitHub.
4. A hiring manager understands it in 60 seconds.

## Decisions

| # | Decision |
|---|---|
| S2 | One universal template, any stack; stacks plug in by manifest (Node now) |
| S3 | Lock-down = `scripts/protect-repo.sh` (plan → ask → apply; `--check` drift; **no `--yes`**, so an agent can't skip the ask; tests pipe `y`); ruleset only in `.github/rulesets/main.json` |
| S24 | **Rule-5 permission set in both shells** (FACT: `PowerShell(...)` rules share Bash's shape, aliases canonicalized). **Ask:** `ssh`, `scp`, `tailscale set/up/down/serve/funnel/file`, `git branch -D`, `git push --delete`, `git clean`, **`gh pr merge`**, `gh api *merge*` (FACT: `gh` is pre-installed and authenticated in cloud, so an agent could merge its own PR with your credentials, and only a permission rule stops that; D7 = you merge). **Deny:** `git push --force*`, `git push -f*`, `git push * +*`, `git reset --hard`, `rm -rf`, `rm -fr`, `tailscale logout/lock`. `check-workspace` fails if any entry lacks its `Bash(...)` or `PowerShell(...)` twin. **One rule per subcommand** (`/` in this table is shorthand only); `check-workspace` rejects `\|` in rule strings. Push denies also cover trailing flags: `git push * --force*`, `git push * -f`. Prefix rules remain speed bumps (`rm -fr` variants); R13 covers the limit |
| S25 | **The repo bootstraps itself in the cloud**; no cloud setup script is required, because one would live outside the repo and break principle 1. The SessionStart hook runs the bootstrap when `CLAUDE_CODE_REMOTE=true`: it sets `core.hooksPath`, installs **gitleaks from the Go module proxy** (`github.com/zricethezav/gitleaks/v8@v8.30.1`, integrity checked against sum.golang.org), and runs `pnpm install` when a package.json exists, reporting each outcome separately. A GitHub release download is impossible in the cloud: release-asset requests for unattached repositories get a 403 (FACT, cloud-environments docs). The cloud environment only sets the network level (Trusted); an optional cached setup-script line may pre-install gitleaks for speed, and the repo never depends on it |
| S4 | Acceptance test: a **public** throwaway repo from the template + one cloud session, then archived (a private repo can't show rulesets on Free) |
| S5 | Each repo's CLAUDE.md carries the 7 non-negotiables + "tests first or NACK" + "API/config/schema change needs an ADR + migration first" |
| S6 / S20 | Secret gates, one owner per blind spot. **One pattern list** `.claude/hooks/secret-paths.txt` (`.env*` minus example/sample/template, `.envrc`, `~/.ssh` and below, `*.pem`, `*.key`, `~/.claude/.credentials.json`; blocks read **and** write) read by the guard **and** pre-commit. Lockfiles live in the same list under `[edit-only]`, so the policy's regex and the settings Edit denies cannot drift apart. **Grammar (written down, implemented once):**
- `#` starts a comment.
- `!` marks an exception; the **last match wins**.
- A pattern **without `/` matches the basename** at any depth; `~/` means the home directory, normalized to an absolute path.
- Comparison is **lowercase on both sides** (Windows folds case, bash doesn't; FACT).
- One node matcher (`.claude/hooks/paths.mjs`) serves the guard **and** pre-commit. Pre-commit pipes the staged list **NUL-separated** (`git diff --cached -z`) into `staged-secrets.mjs`, because git quotes paths containing non-ASCII bytes and a quoted name would defeat matching; if node is missing, it falls back to a minimal built-in regex and says so loudly.
- One fixture table (path → verdict) runs on Windows and in Linux CI.
- A `[settings]` section names the known files; each gets a `Read(//**/<name>)` deny (works even if node breaks). `check-workspace` asserts exactly that section. The guard is an entry file (`guard.mjs`, no exports, so it can never silently no-op) over a pure decision (`policy.mjs`), which exports `GUARDED_TOOLS`; the lint requires the settings matcher to equal that set. Today it is `Read|Edit|Write|MultiEdit|NotebookEdit|Grep|Glob|Bash|PowerShell`. Path fields: `file_path`, `notebook_path`, `path`; Grep's `glob` and Glob's `pattern` are checked against the fixture names too, so `Grep glob=".env"` is blocked. Shell field: `command`. pre-commit at commit. CI gitleaks + push protection as backstop. Self-tests assert the settings denies cover every listed name and that the matcher matches the tool set |
| S7 | LICENSE MIT |
| S8 | README: pitch + gate-layer diagram; **no status badges** (a badge hardcodes the repo slug, so every derived repo would show the template's status, which breaks S18; this is audit-driven, so revert at approval if you want them); links, never copies; `check-doc-refs` checks **relative markdown links only** (resolved via `git ls-files`; skips URLs, `<placeholders>`, `docs/adr/`) |
| S9 / S26 | Rename **once** to **`agent-workspace-template`** (Q22), description "gated · multi-agent · Claude Code". Done **before PR ④**, so the README ships with the final name (GitHub redirects the old URLs) |
| S11 | 3 ADRs, **written fresh** for the template (fixing the contradictions the audit found: no CodeQL/wizard claims; guard scope as S6): 0001 security baseline, 0002 no secrets on disk, 0003 gates travel with the repo |
| S12 | Ruleset: PR required (0 approvals), merge only, signed commits, required check **`all-green` pinned to `integration_id: 15368`** (GitHub Actions app id, FACT via `gh api apps/github-actions`, so no other app can spoof the status), conversations resolved, no force-push/deletion, no bypass. Plus a PR template |
| S13 | maintainer · `/checkpoint` (definition of done, branch + PR + issue comment over REST, and `.claude/state/active.md` so a compacted session resumes from a file) · SessionStart ledger (matcher `startup\|resume\|compact`; worktree-safe; sets `core.hooksPath` if unset and says so; prints `active.md`; reads issues over REST because the cloud proxy may refuse GraphQL; S25 cloud bootstrap) · `/deep-audit` (user-only) · read-only `auditor` |
| S14/S15 | Evolve `project-template` in **4 PRs**, each one concern (the maintainer's own "is it one change?" rule), renamed before PR ④ (S26). The maintainer and `/checkpoint` ship in PR ①, so every later commit gets a repo-local ACK |
| S16 | You write `isSecretCommand(toolName, command, isSecret)` (the tool name lets PowerShell differ; `isSecret` is the shared matcher, already bound to the session's working directory, so the function stays pure and testable); tests first. It's a **tripwire**, not a sandbox |
| S17 | dev-setup: unpushed commit via PR → parts moved → Gist → PR #1 closed → archived |
| S18 | README true for every derived repo; the spec lives in PR ③'s description, **scrubbed of workstation security details** |
| S19 | Cloud plugins come only from the claude.ai account (FACT, cloud-environments docs): account core = superpowers + semgrep. The repo's `enabledPlugins` serves local sessions only |
| S23 | GitHub Apps are least privilege: **Claude GitHub App = "Only select repositories"**, adding each repo worked on in cloud sessions (template, template-smoke, apps, homelab if wanted). **CodeRabbit = public repos only, never homelab** (third party + private topology). The grant is a manual click (the `gh` token can't manage installations; 403), so `protect-repo.sh` ends by printing the settings link as a reminder. Your recommendation request, recorded as the default |
| S21 | Template `enabledPlugins` = hook-free plugins (mattpocock-skills, claude-md-management, commit-commands, code-review, pr-review-toolkit, context7, project-artifact) **plus two audited exceptions**: superpowers (a SessionStart hook) and semgrep (a Pre/PostToolUse binary on `Write\|Edit\|Bash`, shipped for linux-amd64 and windows-amd64). ADR-0003 records the *policy*. The living hook inventory is `docs/agents/plugins.md`, because ADRs are never edited and plugins change. Dropped: security-guidance, claude-security. learning-output-style → **your user settings** (a 5th user key). CodeRabbit → GitHub App only |

Carried from the workspace plan (reject at approval if you disagree): cloud-first, one repo per cloud session, repos isolated and copied once, homelab private, Semgrep SAST, SHA-pinned actions, clones in `Downloads/repos` (your global CLAUDE.md's `C:/Users/dev/repos` line gets fixed or removed in the `~/.claude` cleanup).

## Foundation scaffold

Principles: (1) everything a session needs is committed; (2) one owner per blind spot; (3) gates are small and colocated with their tests, and CI calls each test by **explicit path or quoted glob**, never claiming `tests/` or `src/`; (4) docs point, not copy; (5) stacks plug in by manifest; (6) scripts run on Git Bash and Linux.

```
<repo>/
├── README.md · CLAUDE.md · CONTEXT.md · SECURITY.md · LICENSE · .env.example · .gitignore · .gitattributes
├── .claude/
│   ├── settings.json            path denies · rule-5 asks/denies · hooks · plugins · disableBypass (under permissions)
│   ├── hooks/                   guard.mjs (entry, no exports) + policy.mjs (pure decide) + guard.test.mjs · paths.mjs + staged-secrets.mjs (NUL-separated entry) · secret-command.mjs (owner-written) + its test · secret-paths.txt + secret-paths.fixtures.txt · session-start.sh + cloud-bootstrap.sh + session-start.test.sh · hook-command.test.sh (node missing → exit 2)
│   ├── state/active.md          gitignored; written by /checkpoint, printed at session start so a compacted session resumes from a file
│   ├── agents/                  maintainer.md · auditor.md (tools: Read, Grep, Glob)
│   ├── skills/                  checkpoint/ · deep-audit/ (disable-model-invocation: true)
│   └── rules/                   adr · shell · tests · prototypes (path-scoped, stack-neutral; server/ui/web-security move to a documented web add-on, like the web plugins)
├── .githooks/                   pre-commit + pre-commit.test.sh
├── .github/
│   ├── workflows/ci.yml         universal · node (self-enabling, setup-node 24) · dependency-review (public, not aggregated) · all-green = needs [universal, node], if: always(), fails unless both succeed (required)
│   ├── scripts/                 check-package.mjs · check-doc-refs.mjs · check-workspace.mjs (+ *.test.mjs each)
│   │                            check-workspace = the AI-workspace lint: settings denies ⊇ [settings] names · settings matcher = policy's GUARDED_TOOLS ·
│   │                            lockfile denies = the list's [edit-only] section · ruleset check contexts ⊆ ci.yml job ids · all-green needs every gating job ·
│   │                            every tracked test runs through scripts/test.sh (a missing path exits 1, an empty glob exits 0; FACT) · every tracked .sh is shellchecked ·
│   │                            hooks are 100755 · every "secret" fixture is git-ignored · CLAUDE.md ≤ 150 lines ·
│   │                            read-only agents have no Write/Edit/Bash in `tools` · side-effect skills set disable-model-invocation
│   ├── rulesets/main.json · repo-settings.json (desired GitHub settings, read by apply and --check) · dependabot.yml · pull_request_template.md · ISSUE_TEMPLATE/task.yml
├── scripts/                     test.sh (one runner: all · hooks · ci) · protect-repo.sh + protect-repo.test.sh (stub gh on PATH)
└── docs/adr/ (TEMPLATE, 0001–0003) · docs/agents/ (issue-tracker: `gh` only, with /triage and /wayfinder sections trimmed · domain · plugins.md = living hook inventory)
```

## Risk register: what could hurt every future repo

| # | Risk | Likelihood / impact | Mitigation in this plan | Detection |
|---|---|---|---|---|
| R1 | A CI invocation bug turns `universal` red forever (FACT: `node --test <dir>` exits 1 on Node 24) | High / critical | Quoted globs; setup-node 24 in `universal`; CI self-tests run in the template's own PRs | PR ① CI must be green |
| R2 | A hook fails **open** (non-2 exit = the tool runs; FACT) | Med / high | `\|\| exit 2` wrapper; try/catch → exit 2 | `hook-command.test.sh` runs the exact settings command with node removed from PATH → expects exit 2; guard "throw" test; S4 probe |
| R3 | Secret names outside a list leak (`.envrc`, `.env.staging`) | High / high | One shared pattern list with a written grammar + settings-coverage self-test | fixture table; `check-workspace` test |
| R4 | A failing app test merges anyway | Med / high | `all-green` aggregate required check | ruleset read-back |
| R5 | The commit gate is off in fresh clones and cloud | High / med | SessionStart sets `hooksPath` locally and in cloud (S25; no separate setup script) | session-start test; C2 `git config core.hooksPath` |
| R6 | `protect-repo.sh` half-applies on private repos, or keeps reporting drift | High / med | Capability table per visibility; find-by-name + PUT; jq projection diff; continue-and-summarize | protect-repo tests with stub gh |
| R7 | Third-party plugin hooks beside the gates | Med / med | Hook-free list + documented exceptions (S21) | `docs/agents/plugins.md` inventory, reviewed on each plugin update |
| R8 | Docs claim things that don't exist | High / low | Links-only doc-refs check; README points instead of copying | CI |
| R9 | Template-only content leaks into every derived repo (spec, posture details) | Med / med | S18: README true for all; spec only in the PR body, scrubbed | review of PR bodies |
| R10 | Semgrep registry outage blocks all merges (unpinned `p/default`, no bypass) | Low / med | Accepted. Documented escape: the owner sets the ruleset's enforcement to "Disabled" in the GitHub UI, merges, re-enables, and `protect-repo.sh --check` confirms it | CI failure message |
| R11 | Cloud gaps: context7 remote MCP blocked by Trusted egress; repo plugins not installed | Certain / low | S19 account core; senses design deferred to Sub-project B with network allowlists | S4 |
| R12 | Agent commits fail if the signing key gets a passphrase (FACT: `ssh-agent` is STOPPED **and DISABLED**; git signs with its bundled `ssh-keygen`, which probably can't reach the Windows agent) | Med / med | Gist: set the service to Automatic, `gpg.ssh.program = C:/Windows/System32/OpenSSH/ssh-keygen.exe`, `ssh-add` the passphrase-protected key | `git commit --allow-empty` **with the passphrase set** + `git log --show-signature` |
| R13 | Guard is bypassable (`awk 1 .env`, `git show HEAD:.env`) | Certain / med | Stated as a tripwire; gitleaks + push protection backstop; sandbox evaluated in Sub-project B (cloud Linux) | S4 notes |
| R14 | The semgrep hook needs a token in cloud (unverified; a linux binary ships) | Med / low | Account-synced plugin; its failure mode is observed in S4, not assumed | S4 |
| R15 | A renamed CI job silently blocks every merge (the required context vanishes) | Med / high | `check-workspace` asserts ruleset contexts ⊆ ci.yml job ids | CI |
| R16 | Workstation or homelab posture leaks through public issues or PRs | Med / high | Deferred workstation/homelab issues go to private `homelab` (Q21); template issues and PRs stay generic; all issue and PR text reviewed before the public flip | pre-flip review (`gh issue/pr list --json body`) |

## Implementation

**Step 0: ledger first (Y1), split by visibility (R16).**
- **Template repo (will be public):** one issue per PR with the S1 checkboxes, one for the rename decision (template-only, so no inherited ADR), and one for Sub-project B. The text stays generic, with nothing about this workstation.
- **Private repo = `homelab`, label `workstation` (Q21, decided):** one issue per deferred workstation or homelab item, each with an owner and a trigger: homelab HL-03, the `~/.claude` cleanup with a fresh zip, Desktop settings incl. critic-04, disabling Cowork's other plugins (your click; keep superpowers + semgrep per S19), the Kernel & Fleet artifact, Gist items, lychee, tailnet drift.

Every commit: small and SSH-signed, with a maintainer ACK recorded in the PR (user-level maintainer for PR ①'s first commit; repo-local from then on), CI green, and you merge.

**PR ① `adr-ci-review`:**
- **Contents:** ADRs 0001–0003 (fresh text); `ci.yml` (universal with quoted globs; a hooks-test step on **Node 22 and 24**, since cloud has 22 (FACT); node; dependency-review; `all-green`; `cancel-in-progress` on PRs only); `check-package.mjs` + test; the pre-commit fix (`ACMR`, rename/typecheck/hadolint/gitleaks tests, `+x`); `.gitattributes`; `.gitignore` with `.claude/worktrees/`; `.claude/agents/maintainer.md` + `.claude/skills/checkpoint/`.
- **Tools the runner lacks** print a visible `SKIP <tool missing>`. "Tool missing" tests build a **minimal PATH from stubs**, because on ubuntu-latest gh/node share `/usr/bin` with bash. The pre-commit keeps its built-in regex until PR ②.
- **Exec bit:** `git update-index --chmod=+x .githooks/pre-commit` (FACT: `core.filemode=false`, so `chmod` records nothing). CI asserts mode `100755`, and one test goes through a real `git commit`.
- **Wiring:** each PR adds its own explicit test lines to `ci.yml`; `check-workspace` fails on any test file not named there.
- **Scripts parse jq with `jq -b` or `gh api --jq`** (FACT: jq on Windows emits `\r\n`).
- **Verify:** all tests + actionlint + zizmor + shellcheck locally → CI green → read `check-runs` for the context names.

**PR ② `gates`:**
- **Tests first:**
  - shell cases (Bash + PowerShell), path cases (`.envrc`, `.env.staging`, Grep `path`)
  - relative paths resolved against the input's `cwd`: subdirectory, worktree, subagent call (`agent_id`)
  - "node missing" via `hook-command.test.sh`, "throw", unparseable input
  - the secret-paths fixture table (one node matcher), run on Windows locally and on Linux in CI
  - session-start (incl. S25 behind `CLAUDE_CODE_REMOTE`)
  - `check-workspace`
- **Then:** scaffold `policy.mjs` and the `guard.mjs` entry (the matcher loads `secret-paths.txt` from its own directory) → **pause for your `isSecretCommand(toolName, command, isSecret)`** → green.
- **Also:** `settings.json` (S6/S20/S21/S24); `secret-paths.txt`; pre-commit switched to the shared list; `session-start.sh`.

**PR ③ `agent-tooling-docs`:** `auditor` agent, `/deep-audit` skill, stack-neutral rules (the `tests.md` paths now also cover `*.test.mjs` and `*.test.sh`), CLAUDE.md (S5, with rule 6's full "none skipped" wording), CONTEXT.md, docs/agents (trimmed issue-tracker, plugins.md). The PR description carries the scrubbed spec.

**PR ④ `lockdown-readme`:** `protect-repo.sh` + test (stub gh: plan output, y/N abort via piped input, private-repo capability skips, find-by-name + PUT, `--check` exit codes, final S23 reminder) + `rulesets/main.json` + `check-doc-refs.mjs` + test + README (S8/S18, the first screen = everything above the second heading) + LICENSE + SECURITY + PR template + issue template.

**After ④ (each asked at the time):**
1. `gh issue list --state all --json body` + `gh pr list --state all --json body`, reviewed for posture details, and the gitleaks history scan.
2. Public flip → `protect-repo.sh` on the template → `--check` = 0 → `isTemplate`. (The rename to `agent-workspace-template` already happened before PR ④, per S26.)

**S4 prerequisites (your clicks):** cloud environment (Trusted; no setup script, per S25) · Claude GitHub App access to `template-smoke` (S23) · superpowers + semgrep on the account.

**S4 sequence:** public `template-smoke` → `protect-repo.sh` (asked) → `--check` = 0 → first PR (README project line) → cloud session with the C2 probes → temporarily enable squash (asked) to prove the ruleset refuses it → archive.

**Then:** S17 and the deferred issues. **Sub-project B starts when the C1–C4 evidence is posted** in the template issue. The B issue names the deferred seams: `.claude/workflows/`, SubagentStart/Stop observability, PreCompact handling (its stdout doesn't reach context; FACT), agent/skill evals, senses with network allowlists, and the sandbox for cloud.

## Verification (evidence goes into each PR and issue)

Expected results are written into the template issue **before** each probe runs, so a mismatch is a visible failure.

- **C1:** the first PR in template-smoke shows `all-green` = success via `gh pr checks <n> -R git-commit-duke/template-smoke`. (The template-generated commit may not trigger Actions; the docs don't say.)
- **C2 (cloud, behavioural, not just "rules loaded"):**
  - Blocked: `Read .env`, `Read .env.staging`, `Grep KEY .env`, `cat .env`. A **canary `.env`** holding a known marker string is planted first; each probe must show the guard's block message, and the marker must never appear (otherwise "blocked" can't be told apart from "file not found").
  - Denied: `git push -f`.
  - Asks: `gh pr merge`.
  - Maintainer NACK: a code change with no test.
  - `/checkpoint` runs end to end, with the PR and issue-comment URLs pasted.
  - The ledger lists the real open issues.
  - `git config core.hooksPath` = `.githooks`.
  - A fake token committed is refused by gitleaks (S25).
  - superpowers + semgrep present, others absent; the semgrep hook runs or degrades (R14).
  - `gh api repos/…/commits/<sha> --jq .commit.verification.verified` = true.
- **C3:** `protect-repo.sh --check` exits 0; the ruleset is read back via `gh api …/rulesets/<id>`; with squash enabled at repo level, `gh pr merge --squash` is refused **with an error naming the merge method**, and `--merge` on the same PR then succeeds (so the refusal wasn't for another reason).
- **C4:** an answer key (what / why / how, written first); a cold session given **only** the README's first screen must match all three, and any mismatch fails.
- **R2:** `hook-command.test.sh` with node removed from PATH → exit 2.
- **Local, uncontaminated, as soon as PR ② merges** (the gates exist only from then on): `claude --setting-sources project,local` (FACT: the flag exists) opened in a fresh clone runs the same canary path/shell probes, including PowerShell `Get-Content .env`. It doesn't wait for the `~/.claude` cleanup.

## Awaiting approval (in execution order; each asked at the moment of action)

- [ ] **Pre-flight first:** P0 workstation core files, P1 plan amendments (re-verified), P2 context sync. Each [ASK] item in that section is asked at the moment of action, under the zero-trust protocol
- [ ] Create the Step 0 issues: public-safe ones in the template; workstation ones in private `homelab` under `workstation`
- [ ] Copy `template-drafts.patch` next to the backup zips in Downloads (the only copy is session Temp), then remove the superseded draft worktrees (listed first), before PR ①
- [ ] Rename `project-template` → `agent-workspace-template` (before PR ④)
- [ ] Review issue and PR text, then make the template public; apply the ruleset and baseline; mark it a template
- [ ] Enable superpowers + semgrep on your claude.ai account; create the cloud environment; grant the Claude GitHub App access to `template-smoke` (your clicks, before S4)
- [ ] Create public `template-smoke`; run `protect-repo.sh` on it; temporarily enable squash for the C3 test; archive it
- [ ] Push dev-setup `28356b4` via PR; close PR #1; archive dev-setup
- [ ] Publish the Gist; install the CodeRabbit GitHub App on public repos only (S23)
- [ ] Add learning-output-style to your user settings
