# agent-workspace-template: Tasks 2–3 execution plan (cloud-first Kernel)

## Context

**Why.** This session set out to resume the Foundation plan. Instead it found four things:
- the plan's execution model was local-first and cannot run in cloud sessions;
- the planned gate code has 91 confirmed defects (17 high);
- the template on GitHub is broken today;
- the only copies of the plans and the rebuild sit on this PC in swept or auto-cleaned folders.

The owner then set the direction:
- cloud sessions are the only build surface;
- rules and handoffs live in each repo;
- the design is Kernel (one writer per session, read-only reviewers, deterministic fail-closed gates, GitHub Issues as the ledger), with up to 2–3 sessions on separate issues.

**Task 1 (research and roster) is complete and verified:**
- 607/607 raw-text quotes pass a deterministic check; 330/330 headings covered;
- 5 critic gates; all refutations upheld 12/12.

**Outcome of Tasks 2–3:**
- Nothing is local-only; this PC holds no Claude sprawl.
- The Kernel roster and gates are specified as tested GitHub issues for cloud sessions to build.
- The core files (global CLAUDE.md, memory) match the new workflow.
- Every change carries proof.

## Execution rules (set by the owner)

1. **Strict order.** One batch at a time. Nothing is marked done until it is verified with real command output.
2. **Greenlight per batch.** Each batch is first shown as a manifest (exact paths and actions) and runs only after an explicit yes. Approving this plan does **not** approve any batch.
3. **Deleting** means moving to the Recycle Bin (reversible); the owner empties it. In git, removal is a commit.
4. **Read-only audit agents get no Bash** (the claude-code-guide type). Mechanical checks run in the orchestrator's own scripts.
5. **Template code is built only in cloud sessions**, from issues. This local session only does durability, local config, the ledger setup and the core files.

## Decisions (final)

| # | Decision |
|---|---|
| D1 | Plugins: the owner trims the claude.ai account and Desktop (desktop-commander, gitkraken and Cowork plugins off); Claude restores the 87 explicit `false` entries |
| D2 | Rules, agents and skills live in each repo; the template ships the starting copy |
| D3 | Handoff = an issue or PR comment, written at session close and read at SessionStart |
| D4 | PC-only setup → a "workstation" section of the homelab runbook |
| D5 | Local-only work → one push to a never-merged `reference/wip-2026-09-22` branch |
| D6 | No launcher folder; cloud sessions start from Desktop (Cloud) or claude.ai/code |
| D7 | Kernel, up to 2–3 concurrent cloud sessions (soft limit: it warns, never blocks) |

## Task 2: implement the workflow and process changes (each batch greenlit)

**2.0 Preflight (read-only).** Checks:
- `git status` in the clone;
- `gh auth status` (does the token carry the `workflow` scope?);
- `verify-final` and `verify-plan.sh` still exist;
- no new strays.

**2.1 Durability push (D5; GitHub write).** Make a throwaway clone in `%TEMP%`, then:
1. Create `reference/wip-2026-09-22` containing:
   - the 52-file rebuild;
   - `reference/` with the 5 plans, the handoff, `verify-plan.sh`, `extract-blocks.mjs`;
   - one cited research write-up, `reference/research-2026-09-22.md` (mattpocock research format: the Task 1 appendix, roster and proof table).
2. Commit signed and push.
3. Verify: the branch exists via `gh api`, and the file count and sha256 of each plan file match local.
4. Recycle the throwaway clone.

- [x] **2.0 done (2026-09-23).**
  - main = origin = `d1eddf0`; 0 issues; private; not a template.
  - `gh` token scopes `repo, gist, read:org, admin:public_key, admin:ssh_signing_key` (**no `workflow` scope**).
  - SSH signing is on (`id_ed25519.pub`); the salvage sources are present; gitleaks 8.30.1.
- [x] **2.1 done (2026-09-23; owner greenlit, with the Slate 7 plan excluded and sent to homelab in 2.4).**
  - Branch `reference/wip-2026-09-22` at `46329dd`; GitHub reports `verified: true, reason: valid`.
  - 64 files under `reference/`.
  - The rebuild's 52 files match the `verify-final` blob hashes.
  - sha256 of the plans, handoff, drafts and harness match the originals, both locally and on GitHub.
  - gitleaks: no leaks in 865 KB.
  - main is untouched (`d1eddf0`).
  - The throwaway clone is in the Recycle Bin.
  - Note: a PowerShell quoting slip in the confirmation step caused harmless "command not found" noise and no changes; re-checked correctly.

**2.2 Stray cleanup (local).** Move to the Recycle Bin:
- this session's 7 strays (listed in the appendix);
- the previous session's `x`, `.x`, `.x_live_true`, `nul_should_not`.

Verify with `find` that none remain.

- [x] **2.1 audit:** CONCERNS, then closed. The fourth plan's GitHub copy hashes `3046ca4a…` (57,239 B), equal to the local plan minus the 2.1 tick block. The quoting slip is judged unable to change the outcome.
- [x] **2.2 done (2026-09-23; owner greenlit A+B+C, all 34).**
  - Planned 34, moved 34, still present 0.
  - The Recycle Bin lists all 34 with their original folders.
  - `git status` in the clone is clean.

**2.3 Local Claude config (D1).**
1. Restore the 87 explicit `false` entries (39 `@inline`, 48 official) into `~/.claude/settings.json` `enabledPlugins`, taken from `Downloads/claude-settings-2026-09-22.json`. The 8 `true` entries stay.
2. Verify: the JSON parses, and the counts are 8 true / 87 false.

Owner actions follow: the account trim, Desktop connectors off, and the Claude GitHub App set to "Only select repositories". Then the owner opens a fresh session, where `session_connectors_status` must show no desktop-commander and no unwanted connectors.

- [x] **2.2 audit:** PASS.
- [x] **2.3 done (2026-09-23; owner greenlit 87 false entries + pr-review-toolkit off).**
  - `~/.claude/settings.json` parses; `enabledPlugins` has 95 entries: 7 true, 88 false.
  - Restoring the original 8-line block reproduces the pre-change sha `a187bf122071d572` exactly, so only `enabledPlugins` changed.
  - New sha `92f04d56bdb36923`, 9,667 B.
  - Rollback: remove the 87 added false keys and set pr-review-toolkit back to true.
  - Still to come: the owner's clicks (account, Desktop, GitHub App), then the fresh-session check.

**2.4 Ledger setup (GitHub write).** Create the labels, then these issues in project-template. Each issue body carries: context, acceptance criteria written as failing tests, files, salvage pointers into the reference branch, and dependencies. The issue text is shown in the manifest before creation.

| Issue | Scope | Depends on |
|---|---|---|
| #1 Baseline repair | pre-commit TODO abort; mode 100755; red CI; `.gitignore` for worktrees; the README create-repo path | — |
| #2 Kernel settings + guard | settings baseline (effortLevel high, env pins, `Agent(fork\|general-purpose\|claude)` denies, no `fallbackModel`, `@synced:false` list, `crossSessionInbound` refuse); subagent tool allowlist on `agent_id`, fail-closed, SessionStart canary; the 17 high secret-guard defects | #1 |
| #3 Roster + rituals | the 6 agents with model, effort, tools, disallowedTools and maxTurns; the review-package script; `/checkpoint` (BLOCKED semantics); `/session-close` → issue comment; SessionStart orientation (REST ledger, claim warning) | #2 |
| #4 Workspace lint + CI | posture lint rules; base-branch lint for gate PRs; required `all-green`; pinned actions; gitleaks, zizmor, actionlint, semgrep | #2 |
| #5 Docs | CLAUDE.md spine (Kernel, parallelism policy, `/batch` ban); CONTEXT.md; `docs/gates.md` (catalogue, maxTurns policy); ADR 0001–0003 (0003 folds in the cloud-first evidence); the research doc | #3, #4 |
| #6 Protect + publish | data-driven protect-repo; rename to agent-workspace-template; template flag; visibility; delete the reference branch before going public | #5 |

A homelab issue is also filed for D4 (the "workstation" runbook section).

- [x] **2.3 audit:** PASS. The auditor inferred that `@inline` is obsolete; the raw docs refute that for `--plugin-dir` plugins (plugins-reference.md:436: `@inline` is "the identity that `--plugin-dir` plugins use", which is the Desktop injection route). Account plugins use `@synced` (:432, :447).
- [x] **2.4 done (2026-09-23; owner greenlit as listed).**
  - Labels `foundation`, `gates`, `risk:high` and `needs-decision` in project-template; `workstation` in homelab.
  - Issues project-template #1–#7, all with the correct labels and no missing sections (read back via API).
  - homelab #1 embeds the Slate 7 plan verbatim (sha `bbfcb2cebe459a8b`, matching the local file).

- [x] **2.4 audit:** CONCERNS, resolved:
  - (1) The Files section was missing from #5 and #6, a deviation from the manifest. Fixed; all six now have all six sections (re-verified).
  - (2) Infrastructure detail in homelab #1: accepted; homelab is private, and the text scanned clean. If homelab goes public, that body goes first.
  - (3) Label order: refuted (GitHub sorts labels alphabetically).
  - (5) Salvage paths: 27 checked against the branch tree, 0 missing.
  - (4) Acceptance-criteria testability and (6) #7 content depth are **filed to Task 3**.

**2.5 Core files (local).**
- Rewrite `~/.claude/CLAUDE.md` (≤150 lines, writing-for-agents style) to cover: cloud-only build, no local build, greenlight per batch, the no-sprawl rule, a cloud preflight (account plugins and connectors), Kernel pointers, and handoff via issue comment.
- Memory:
  - fix `agent-workspace-template-foundation` (the false homelab claim, the old decisions);
  - update `cloud-environment-facts` with the verified raw-line facts;
  - update `zero-trust-protocol` (handoff by issue comment);
  - update `cowork-isolated-sandbox`;
  - add feedback memories `no-sprawl-single-source` and `greenlight-before-file-changes`.
- Post the session handoff as a comment on a "Foundation: resume state" issue, then recycle `~/.claude/handoffs/…md`.

- [x] **2.5a done (2026-09-23; greenlit).**
  - Commit `3781017` on the reference branch (`verified: true`) adds `reference/user-claude/`: CLAUDE.md (pre-rewrite), rules ×2, maintainer, checkpoint, session-close, hooks ×2. All 8 are sha-SAME on GitHub; 72 files under `reference/`; gitleaks clean.
  - The throwaway clone is in the Recycle Bin.
  - `settings.json` is posted on homelab #1 (comment 5800453862); the posted sha `92f04d56…` equals the local file.
- [x] **2.5b done (2026-09-23; greenlit text written exactly).** `~/.claude/CLAUDE.md` now:
  - 78 lines; 0 of 7 stale claims; 10 sections; diff vs the preserved old version +57/−37; sha `1acc5b10…`.
  - Five old lines were not carried over (Vercel default, path-scoped `rules/` pointer, which gate tools the cloud lacks, "strictest verdict wins", `/checkpoint` per slice). They are proposed in the next manifest.
- [x] **2.5a/b audit:** CONCERNS. Three more dropped items (Explore >3 files, gates deterministic, `file:line`) were folded into the CLAUDE.md additions.
- [x] **2.5 second round done (2026-09-23; all greenlit).**
  - **CLAUDE.md +8 points:** 81 lines, each point present once, sha `926af24f…`.
  - **2.5c memory:**
    - 3 duplicates recycled: plain-language-grilling, tools-before-web-search, zero-trust-protocol. Their content lives in CLAUDE.md.
    - 3 rewritten: the Foundation pointer, cloud facts, Desktop injection.
    - `MEMORY.md` is down to 3 lines; the links resolve; no stale claims.
  - **2.5d:** README row committed as `41f7a69` (verified); handoff comment 5800670721 on #7 with 5 of 5 sections.
  - **2.5e:** 5 copies were sha-SAME with GitHub immediately before recycling. The 4 plans and the `handoffs` folder are recycled; `~/.claude/plans` holds only this live plan.
  - **Observed, not ours:** `ebook-code-modernization-playbook.pdf` left Downloads at 15:42:08 (Recycle Bin); no command of this session named it.

**2.6 Change report.** A full, detailed outline of every change: path, before, after, and proof. It is posted on the resume-state issue and shown to the owner.

## Task 3: critical re-audit and core-file update

- **Independent no-Bash critics plus deterministic checks** review this plan, the issues created and the updated core files. Lenses:
  - raw-docs correctness;
  - Linus/Yegge;
  - security;
  - sprawl and staleness;
  - completeness against **every owner request this session** (a listed checklist).

  Each decision is written up with its reasoning, sources and proof.
- **Carried items to resolve:**
  - the PreCompact-reminder conflict;
  - whether `autoMemoryDirectory` writes hit protected-path prompts;
  - the `claude.exe` PATH entry, which names the file;
  - the signing key regenerated without a passphrase;
  - the Recycle Bin's 76 items;
  - keep or remove Cowork;
  - the 4 orphaned homelab lessons;
  - dev-setup archive and its 28356b4 commit;
  - archiving old sessions (the owner deletes);
  - emptying the local clone once this session ends (it is this session's working folder);
  - `Downloads` backups and drafts, recycled once durability is proven;
  - the plugin caches (4.7 GB).
- Fixes run as further greenlit batches, and a final report with proofs follows.

## Verification (end-to-end)

- **2.1:** `gh api repos/git-commit-duke/project-template/branches/reference/wip-2026-09-22` exists, and the file list and sha256 of each plan match local.
- **2.2:** `find` shows none of the listed strays.
- **2.3:** a node count gives 8 true / 87 false. After the owner's clicks, `session_connectors_status` in a fresh session shows no desktop-commander.
- **2.4:** `gh api …/issues` lists #1–#6 with their acceptance criteria; the labels exist.
- **2.5:** `wc -l ~/.claude/CLAUDE.md` ≤ 150; a grep finds none of the stale claims ("Desktop Code tab", "copied into private homelab", "handoffs/"); `MEMORY.md` is consistent with its files.
- **After this session:** the owner starts cloud session #1. Its `/checkpoint` shows a maintainer verdict line and CI turns green.

## Critical files

- **Local:** `~/.claude/settings.json`, `~/.claude/CLAUDE.md`, `~/.claude/projects/C--Users-dev--claude/memory/*.md`, `~/.claude/handoffs/2026-09-22-agent-workspace-template.md`.
- **GitHub:** `git-commit-duke/project-template` (reference branch, labels, issues); `git-commit-duke/homelab` (one issue).
- **Salvage source:** `%TEMP%/claude/C--Users-dev--claude/3b17c90b…/scratchpad/verify-final` (52 files) and `verify-plan.sh`.

## Owner-only actions

- claude.ai Customize: trim plugins, skills and connectors to the build list.
- Desktop: turn off the injected connectors and Cowork plugins (desktop-commander and gitkraken first).
- github.com/settings/installations: set the Claude App to "Only select repositories".
- Empty the Recycle Bin when satisfied; delete old sessions after they are archived.

---

# Appendix A: session evidence log (history; superseded detail kept for the audit trail)

## Original context

The 2026-09-22 handoff asked this session to finish amendments A5–A9, A11–A13 and A15–A18, re-verify the plan with `verify-plan.sh`, sync context (P2), then ask before Task 0.

This session's preflight **failed**. The Desktop host injects 9 claude.ai connectors and about 25 Cowork plugins; desktop-commander (26 tools) and gitkraken (31 tools, including push, PR and issue creation) are live. The owner chose: **clean up, then restart**.

The owner also set a new requirement (2026-09-22):
- build work runs in **cloud sessions** through the GitHub repo;
- the local folder only ever holds uncommitted work, and is emptied once that work is committed ("temp throwaway worktree only");
- move and rename the local folder as the recommendation says.

The never-committed draft ADR-0004 (`template-drafts-2026-09-22/adr-cloud-first/docs/adr/0004-…`) already argued the same model.

## Facts established this session (FACT, with evidence)

- The clone sits at `C:/Users/dev/Downloads/repos/project-template`: main `d1eddf0`, equal to `origin/main`, 16 tracked files, no stash.
- The `.githooks` commit gate is on (`core.hooksPath` is set).
- Six worktrees exist under `.claude/worktrees/`, which git ignores. Five hold uncommitted drafts; `gates-in-repo` is clean.
- Every draft file is preserved. 14 are byte-identical loose copies in `Downloads/template-drafts-2026-09-22/`. The other two, `check-package.mjs` and `tests/pre-commit.test.sh`, exist only inside `combined-reviewed.patch`.
- The user settings (`~/.claude/settings.json`) hold the 8-plugin build profile, with bypass disabled.
- The spec's Resume state block is stale: it lists A4 and A10 as unfinished, while the newer handoff says both are done.

## Owner decisions, round 2 (2026-09-22)

| # | Decision | Choice |
|---|---|---|
| D1 | Plugins and tools | **Account + Desktop + settings fix.** The owner trims claude.ai account plugins, skills and connectors to the build list, and turns off desktop-commander, gitkraken and the Cowork plugins in Desktop. Claude restores the 87 explicit `false` entries (with a greenlight). A fresh session re-runs the preflight |
| D2 | Rules | **Inside each repo**, tailored to it and evolving with it. The template ships the starting copy. The owner's cross-repo rules (GATE 0, plain language) ship in the template |
| D3 | Handoffs | **Issue or PR comment** in the repo, written by the end-of-session skill over REST and read back at SessionStart |
| D4 | PC-only setup | **homelab runbook, "workstation" section.** Covers the minimal `~/.claude`, the plugin inventory, Zed and shell notes |
| D5 | Transfer | **One push to a never-merged reference branch** in project-template (private), after the owner approves the exact file list. It carries the 52-file rebuild, `verify-plan.sh` plus `extract-blocks.mjs`, the plans and the research results. The rebuild commit `42dbc40` is unsigned and has an unrelated root. Pushed with `git push <remote> HEAD:refs/heads/reference/wip-2026-09-22` from a throwaway clone. Deleted before the repo goes public |
| D6 | Launcher | **Not needed as a folder.** Cloud sessions start from Desktop (Cloud → repo) or claude.ai/code. `~/.claude/handoffs` retires once D3 exists |
| — | Design spine | Pending Task 1 (the Kernel recommendation stands) |

## Owner task list (strict order; nothing is marked done until verified)

1. **Task 1:** research and synthesis of the CCGS README (entire) and the docs pages large-codebases, agents, sub-agents, agent-view, agent-teams, cross-session-messaging, workflows and worktrees. Output: gap analysis, recommendations, and the subagent roster with the right model and effort per use case. **Running as wf_3b9228e2-f1b.**
2. **Task 2:** implement the workflow and process changes (greenlight per batch), with a full, detailed outline of what changed.
3. **Task 3:** re-audit the plan critically, showing every decision's reasoning, sources and hard proof, and update the core files.

## Task 1 status: COMPLETE, verified at the design level (2026-09-22)

**Evidence:**
- **10 sources:** 607/607 quotes pass the deterministic raw-text check; 330/330 headings covered.
- **Five critic gates:** FAIL → CONCERNS → CONCERNS → FAIL → **CONCERNS with 1 PASS, and all 4 refutations upheld 12/12**. Every FAIL was either refuted with raw-doc proof or fixed.
- **Residual concerns, filed:**
  - The guard.mjs rejection paths and fail-closed behaviour are **Task 2 acceptance criteria** (a failing test first for each).
  - Lint and canary timing were already specified in gates 3 and 4.
  - Soft vs hard parallel-session limit is an **owner decision**.
- **Carried to Task 3:** the synthesis item "PreCompact reminder" conflicts with the prior verified fact that PreCompact stdout never reaches context. Drop or replace it.

**Themes** (number of independent sources supporting each):
1. One writer, fresh-context read-only reviewers (6).
2. Only committed config reaches cloud sessions (6).
3. GitHub Issues are the only ledger (7).
4. Deterministic, fail-closed gates (6).
5. Right specialist = model and effort chosen by risk and backstops (4).
6. Lean always-loaded context (5).
7. Surface silent model and effort drift (3).
8. Parallelism bounded by issues, not agents (5).
9. Agent view, Projects and worktrees solve problems Kernel avoids (4).
10. A closed messaging posture (2).
11. From CCGS: borrow the gates, not the org chart (2).

## Task 1 history (superseded detail kept for the audit trail)

**Run 1** (wf_3b9228e2-f1b, 28 agents) kept 418 practices and dropped 78. **It failed verification where the roster depends on it:** sub-agents 4/40 and agent-view 2/25; model-config lost 14/27.
- Cause: agents quoted WebFetch's model-rewritten rendering, not the raw page.
- The critic found 25 gaps: no per-source coverage; large-codebases, worktrees, agent-view, messaging and the CCGS README were missing from the synthesis; a misattributed quote; unsourced items; 3 model-config sections unread; an unresolved judge split.

**Run 2** (wf_a3995ba4-f40, running) fixes this at the source:
- one appendix row per heading for each of the 10 sources, from **raw** markdown;
- a **deterministic** quote check (fetch, normalise, substring), run on Haiku as mechanical work;
- a reconciled roster with a proof table, and a critic gate.

**Run 2 result:**
- The Haiku checker agents failed to run on sub-agents (returned 1 result of 110) and agent-view (1 of 91), and misreported model-config (48 of 73).
- The **orchestrator's deterministic local check** (Node fetch of the raw `.md`; strip markdown links, backticks and emphasis; collapse whitespace; lower-case; substring test) gives **607/607 quotes PASS and 330/330 headings covered** across all 10 sources.
- The run's critic returned **FAIL**. Its first 3 gaps came from the checker failure and are now cleared. Still open:
  - split 8 (reviewer Bash) is unresolved;
  - `fallbackModel` (opus-4-8 → sonnet-5) also applies to subagents and can silently downgrade the Opus reviewers;
  - "read raw" line citations are unverified;
  - maxTurns values have no rationale;
  - minor citation hygiene.
- **Lesson (design input):** mechanical checks belong in a script, not an LLM agent. That is Kernel's deterministic-gates principle again.

**Task 1 deliverable (DRAFT until the critic gate wf_3021dc09-166 passes). Reconciled subagent roster:**

| Agent | Job | Model | Effort | Tools | maxTurns | Proof |
|---|---|---|---|---|---|---|
| main session | only writer: plan, TDD, `/checkpoint` | account default (Opus 5.5), not committed | commit `effortLevel: "high"`; owner may `/effort xhigh` on hard planning turns; never `max` | full, bounded by settings | — | settings.md:748 (project settings read in cloud); model-config.md:538, 589, 592, 609 |
| Explore (built-in) | read-only search | inherit, capped at Opus | inherits | built-in read-only | — | sub-agents.md:39, 45. Haiku override deferred until `/usage` shows the need |
| Plan (built-in) | plan-mode research | inherit | inherits | built-in read-only | — | sub-agents.md:55 |
| maintainer | gate on every slice: spec, correctness, contract, one change, tests, taste | opus | high | Read, Grep, Glob (no Bash) | 20 | costs.md:240 ("multi-step reasoning") |
| security-reviewer | path-triggered and release go/no-go | opus | xhigh | Read, Grep, Glob | 25 | model-config.md:591 |
| test-reviewer | do the tests prove the behaviour | sonnet (opus via per-invocation on risk:high) | high | Read, Grep, Glob | 20 | costs.md:240 |
| delivery-reviewer | CI, rulesets, deploy; release go/no-go | opus | high | Read, Grep, Glob | 20 | costs.md:240 |
| auditor | research, deep audit, load-bearing claims | opus | high | Read, Grep, Glob, WebFetch, WebSearch | 40 | rare, so cost is bounded |
| triager | CI or observe log reduction | haiku | none (Haiku has no effort levels) | Read, Grep, Glob | 8 | costs.md:240; model-config.md:528–530 |
| fork, general-purpose, claude | — | — | — | **denied** (`permissions.deny Agent(...)`) | — | sub-agents.md:77, 1194 |

- **Critic gate 1** (wf_3021dc09-166): strictest **FAIL** (critic 2); CONCERNS from critics 1 and 3.
  - **Refuted with raw evidence:**
    - "`max` accepted": model-config.md:609 says `max` "isn't accepted" in `effortLevel` or `modelSettings`.
    - "line 303 isn't about plugins": raw 303 is the `permissionMode` row, "Ignored for plugin subagents".
    - "Sonnet effort `high` invalid": :529 lists Sonnet 5 with low–max.
    - "`Agent(fork)` not a valid deny": sub-agents.md:1202 and :85.
  - **Confirmed from local files:** all 6 pr-review-toolkit agents have no `tools:` line (so they inherit Edit and Write); code-reviewer and code-simplifier run on opus.
  - **Valid, fixed:**
    - (a) every reviewer gets an explicit tools allowlist without Bash **and** `disallowedTools: Bash, Edit, Write, NotebookEdit`;
    - (b) enforcement = a CI workspace lint, plus a test proving it rejects a reviewer with Bash or write tools and a settings file missing `Agent(fork|general-purpose|claude)` denies (**Task 2 acceptance criterion**);
    - (c) the `EnterWorktree`/`ExitWorktree` deny and the `/batch` ban are **design decisions**, not doc recommendations. Reason: `/batch` splits one change into 5–30 worktree-isolated writing subagents, which breaks single-writer;
    - (d) the test-reviewer's risk:high → opus switch is **advisory** (a skill instruction), labelled so; the maintainer on opus is the enforced backstop;
    - (e) the 7 stray files came from **this orchestration session's workflow agents** (Explore and Plan types, which include Bash), not from roster agents;
    - (f) no documented per-session cost cap setting exists. The guards are maxTurns per agent, partial = BLOCKED, `workflowSizeGuideline`, and `/usage` attribution.
- **Critic gate 2** (wf_1eac753a-46d): **CONCERNS** (critics 1 and 3 PASS; critic 2 CONCERNS; no FAIL). All five concerns resolved:
  1. **The built-in Explore and Plan still have Bash** (FACT: this build's agent listing gives them everything except Edit, Write and NotebookEdit; sub-agents.md Plan tab: "read-only tools; Write and Edit are denied"). A project override is documented only for Explore (sub-agents.md:45).
     - ⇒ **Single-writer enforced at the hook:** the guard blocks any tool call that carries `agent_id` (every subagent: built-in, plugin, workflow, custom) when the tool is Bash, PowerShell, Monitor, Edit, Write, MultiEdit or NotebookEdit.
     - Proof: hooks.md:267 (settings hooks "also run inside subagents … the input carries the `agent_id` and `agent_type`") and hooks.md:767–768.
     - Test-first in Task 2. It supersedes per-agent Bash allowlists.
  2. **Cost:** no per-session cost-cap setting is documented. Guards:
     - the lint requires `maxTurns` on every agent, capped per role (reviewers ≤ 25, auditor ≤ 40, triager ≤ 8);
     - partial = BLOCKED;
     - `/session-close` records the `/usage` summary in the handoff comment.
  3. **Lint scope:**
     - The writer = the main session (no agent file).
     - The lint scans committed `.claude/agents/*.md` and `.claude/settings.json`. It fails on:
       - a tools list containing Bash, PowerShell, Monitor, Edit, Write or NotebookEdit;
       - a missing `disallowedTools` set;
       - a `model` outside {sonnet, opus, haiku, fable, inherit, full ID};
       - `effort` on haiku, or `max` anywhere;
       - a missing or over-cap `maxTurns`;
       - settings missing the `Agent(fork|general-purpose|claude)` denies;
       - any `fallbackModel`;
       - any `CLAUDE_CODE_EFFORT_LEVEL`;
       - agent teams not `"0"`.
     - Each rule gets a failing fixture test.
  4. **Parallelism** (2–3 sessions) is **owner policy** in CLAUDE.md, not a gate; the owner starts cloud sessions.
  5. **The Kernel spine** is an owner decision, asked next.
- **Critic gate 3** (wf_5d2fd262-512): **CONCERNS**, no FAIL.
  - Refuted again: `Agent(fork)` validity (sub-agents.md:1202, :85, :77); "disallowedTools is documentation only" (it is framework-enforced: sub-agents.md:301, 475).
  - **Resolved:**
    1. **Hook rule inverted to an allowlist** (it closes the MCP-write hole). A tool call carrying `agent_id` is allowed **only** for Read, Grep, Glob, LSP, WebFetch or WebSearch. Everything else is blocked by default, including `mcp__*`, Agent (no nesting), Skill, Monitor ("Runs a command in the background": tools-reference.md:39), Bash, PowerShell, Edit, Write, MultiEdit and NotebookEdit. An unknown or new tool is blocked, not missed.
    2. **Nesting cost:** subagents cannot call Agent, so they cannot nest. `maxTurns` is per invocation (sub-agents.md:304).
    3. **Lint timing:** a required CI job inside `all-green`, and in pre-commit. For PRs touching `.claude/**`, `.githooks/**`, `.github/**` or `scripts/**`, CI **also runs the base branch's lint** against the PR tree, so a PR cannot rewrite the gate that judges it. The maintainer reviews gate diffs against main's version.
    4. **Lint content:** `disallowedTools` must contain the full set {Bash, Edit, Write, NotebookEdit}, not just exist. Workflow-inline agents are not linted; the runtime hook allowlist covers them.
    5. **BLOCKED defined:** no verdict line, a maxTurns partial marker, or a failed or API-error reviewer means `/checkpoint` does not commit or push, posts "BLOCKED: <reason>" on the issue, and retries once.
    6. **Parallelism:** a claim is derived from state (draft PR from `claude/issue-<n>-<slug>`); SessionStart warns when the issue already has an open `claude/*` branch or PR. The "Parallelism" section in CLAUDE.md is owner policy.
    7. **`/usage` in the handoff: dropped.** It is unverified that an agent can run `/usage`. Checking usage is the owner's manual practice.
    8. The maxTurns caps are documented as project policy in `docs/gates.md` with their rationale (INFERENCE budgets).
- **Critic gate 4** (wf_c502c2cb-947): **FAIL**, evaluated item by item:
  - **Refuted:**
    - "the allowlist contradicts the documented subagent tool set": docs list what is *available*; restricting it is the purpose of hooks and permissions. sub-agents.md:86: "To prevent Claude from delegating to any subagent, deny the `Agent` tool itself".
    - "banning nesting contradicts the depth limit": the same line; the limit is a maximum.
    - "agent_id could be spoofed": the harness builds the hook input (hooks.md:767 "Present only when the hook fires inside a subagent call").
    - "parallel sessions overwrite each other": a cloud `git push` works only on the session's own branch (cloud-environments.md:231), so there are two PRs, not a silent overwrite.
  - **Accepted and applied:**
    - **Fail-closed hook**, backed by hooks.md:850 ("Any other exit code doesn't block") and :861 ("A hook that can't start … leaves the gate silently disabled"):
      - command `node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard.mjs" || exit 2` with `"shell": "bash"`;
      - guard.mjs uses try/catch, so any error exits 2; malformed input exits 2; a watchdog runs under the hook timeout;
      - tests prove that missing node, a crash and bad input each give 2;
      - **a SessionStart canary** runs the guard on a known-bad call and warns loudly unless it gets 2.
    - Retry exhausted: no commit or push; "BLOCKED: retry exhausted" on the issue; the session stops for the owner.
    - The lint scans `.claude/agents/**/*.md` recursively.
    - The session limit is **soft** (it warns and never blocks), stated plainly.
- **Split 8, resolved:** reviewers have **no Bash**. A deterministic script writes the review package (diff, log, raw test output) and reviewers read it.
  - sub-agents.md:475: a `disallowedTools` specifier removes the whole tool.
  - hooks.md:767–768: an `agent_type` allowlist is possible later, test-first.
- **Split 1, resolved:** the writer runs at `high`. The owner's priority is quality; Opus 5.5's default `medium` trades intelligence for cost.
- **Splits 2, 3 and 5:** quality-first for the gates (opus). **Split 6:** auditor on opus (rare runs). **Split 7:** Explore unchanged until measured.
- **Settings:**
  - `effortLevel: high`;
  - `env.CLAUDE_CODE_SUBAGENT_MODEL: sonnet` (a default only; sub-agents.md:389);
  - `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "0"` (claude-code-on-the-web.md:243);
  - **no `fallbackModel`** (it applies to subagents and would silently downgrade them; model-config.md:468);
  - never `CLAUDE_CODE_EFFORT_LEVEL`;
  - `"<plugin>@synced": false` for unwanted account plugins (plugins-reference.md:448); pr-review-toolkit off;
  - deny `EnterWorktree` and `ExitWorktree`;
  - `crossSessionInbound: refuse`;
  - workflows only for read-only research and audits; `/batch` is forbidden.
- **Parallelism:** 2–3 owner-started cloud sessions, one issue each; read-only reviewer subagents inside a session; no agent teams (about 7× tokens, costs.md:324); no agent view for build work (agents.md:43).
- **maxTurns:** INFERENCE budgets, tuned from observed turn counts after the first issues.

**Incident (disclosed):** read-only agents wrote files during plan mode (via Bash), the same failure class as the previous session.

| Stray | Size | Born (local) | Origin |
|---|---|---|---|
| `project-template/C:Users…scratchpadquotes.json` (repo root, untracked) | 6,688 B | 19:38:11 | wf_a3995ba4 checker (a Git Bash path mangle) |
| `%TEMP%/check.py` | 556 B | 19:38:39 | same |
| `%TEMP%/verify.js` | 565 B | 19:41:42 | same |
| `%TEMP%/model-config.md` | 111,862 B | 19:41:58 | same (raw docs copy) |
| `%TEMP%/doc.txt` | 111,862 B | 19:43:21 | same (raw docs copy) |
| `%TEMP%/simple.json` | 32 B | 19:45:29 | same |
| `%TEMP%/quotes.json` | 131 B | 19:45:33 | same |

- Not ours: `.ses` (born 09-01) and `cv_debug.log` (born 09-19).
- **Cleanup:** Recycle Bin, **after the owner's greenlight**.
- **Root-cause fix:** read-only agents get tool lists without Bash (e.g. claude-code-guide: Read, Grep, Glob, WebFetch, WebSearch); deterministic checks run in the orchestrator's own scripts. The same principle goes into the template: reviewers are read-only by `tools` and `disallowedTools`, never by prompt.

**Proof table** (orchestrator, raw `curl` of the docs, line numbers):

| Fact | Source |
|---|---|
| Subagent `model`: `sonnet`, `opus`, `haiku`, `fable`, a full ID, or `inherit` | sub-agents.md:302 |
| Subagent `effort`: overrides session; `low`…`max`; depends on model | sub-agents.md:311 |
| `permissionMode`, `mcpServers` and `hooks` are **ignored for plugin subagents** ⇒ template agents must be committed project agents | sub-agents.md:303, 306, 307 |
| Explore inherits the main model, capped at Opus; a project `Explore` with `model: haiku` overrides it | sub-agents.md:39, 45 |
| Explore and Plan skip CLAUDE.md and git status; they are one-shot and cannot be resumed | sub-agents.md:33, 1081 |
| Effort levels by model (Haiku is absent ⇒ no effort field for Haiku) | model-config.md:528–530 |
| Default effort is `high`, except **Opus 5.5 `medium`** and Opus 4.7 `xhigh` | model-config.md:538 |
| When to use each level: low (scoped, latency-sensitive, not intelligence-sensitive), medium (cost-sensitive), high (balance), xhigh (deeper), max (overthinking; test first) | model-config.md:588–592 |
| `max` is not accepted in `effortLevel` or `modelSettings` | model-config.md:609 |
| "Sonnet handles most coding tasks well … Reserve Opus for complex architectural decisions or multi-step reasoning … For simple subagent tasks, specify `model: haiku`" | costs.md:240 |
| Agent teams: Sonnet teammates, keep small, off by default; ~7× tokens in plan mode | costs.md:211–215, 324 |

## Owner decisions this session

- Preflight: clean up, then restart.
- Workflows: yes; ultracode is the opt-in.
- Local role: **launcher only**. Local Claude Code opens only in `~/.claude/handoffs`, with its directory access restricted. All repo work runs in cloud sessions.
- Folder question: where does a local clone belong, per a verified official source? Answered below: nowhere in `~/.claude`, and none is needed.

## Verified facts (fetched from code.claude.com or GitHub this session)

- **Clone location** (claude-directory page):
  - No official page recommends a location for repository clones.
  - `~/.claude` is config plus data Claude Code writes; transcripts are "not encrypted at rest"; `plans/` is swept after `cleanupPeriodDays`.
  - `handoffs/` is not a documented folder. It appears in neither retention list.
  - Two research agents fabricated a "keep repos out of ~/.claude" quote. Discarded.
- **Worktrees** (worktrees page):
  - Default path `<repo>/.claude/worktrees/<name>/`, branch `worktree-<name>`; "Add `.claude/worktrees/` to your `.gitignore`".
  - The path changes only through a `WorktreeCreate` hook. `~/.claude/worktrees/` appears only in an SVN hook example.
- **Cloud commits are signed** (GitHub API):
  - dev-setup `4f84633`, branch `claude/happy-gauss-5ribii`, author and committer "Claude": `verified: true`, `reason: valid`.
  - Consequence: cloud commits are authored as "Claude", not the owner.
- **Local restriction** (permissions, sandboxing and managed-settings pages; adversarially confirmed):
  - A session can reach its folder, subfolders, `additionalDirectories` and its temp folder; anything else prompts first.
  - Deny rules use `//c/...` paths and apply to the file tools and to the Bash commands Claude Code recognises; indirect reads are not covered.
  - **No Bash sandbox on native Windows** (WSL2 only).
  - Managed settings at `C:\Program Files\ClaudeCode\managed-settings.json` cannot be overridden by user or project settings. Only the owner installs them; it is a system setting.
- **Cloud "What carries over" table** (cloud-environments, verbatim):
  - Repo `CLAUDE.md`, `.claude/rules`, `skills`, `agents` and `commands` load: Yes.
  - Repo `.claude/settings.json` hooks and permissions, and `.mcp.json`: "Yes, in a session with one repository". Multi-repo sessions "don't read them".
  - Repo `enabledPlugins` and `extraKnownMarketplaces`: **No**. "Enable the plugin for your claude.ai account instead."
  - User `~/.claude` CLAUDE.md, skills, agents, commands and plugins: **No**. "Cloud sessions automatically load skills you enable on claude.ai."
  - So the cloud build profile = repo `.claude/` + the claude.ai account's plugins and skills. **The account's ~25 Cowork plugins will load in cloud sessions too.**
- **Attribution** (cloud-environments:324): "Commits … include a `Claude-Session: <url>` git trailer, and PR bodies include the session URL". This is omitted with `attribution.sessionUrl: false`.
- **Push** (cloud-environments:231): "`git push` works only against the session's current working branch".
- **Release assets** (cloud-environments:232): assets from repositories not attached to the session return 403.
- **Desktop** (desktop page):
  - "Worktrees are stored in `<project-root>/.claude/worktrees/` by default. You can change this … under 'Worktree location'."
  - Cloud sessions start from Desktop by selecting **Cloud** instead of **Local**.
- **Launcher limit:** "Continue in cloud" and teleport need the local folder to be a git repo with at least one commit. A launcher in `~/.claude/handoffs` therefore starts new cloud sessions instead of moving one.

## Context carried from the previous session (Opus 5, transcript 3b17c90b…)

- **The owner's GATE 0 protocol applies to all output:**
  - labels FACT, INFERENCE, ASSUMPTION or UNVERIFIED, with HIGH/MED/LOW confidence;
  - five reasoning steps, including a tournament of at least two hypotheses and a self-critique;
  - tables for comparisons;
  - destructive actions wait for approval;
  - anti-patterns: confidence theater, completeness theater, reframe-as-findings, abstract-only diagnosis.
- **Question style** (memory `plain-language-grilling`): a plain-language table first, then 2–4 questions, each with a recommended answer.
- **Standing owner decisions,** consistent with today's:
  - "no repos should be on localhost, all should be on github";
  - "Nothing lives ONLY local"; "Cloud should be primary";
  - one repo per session; the template is a starting point; PC setup stays outside the template;
  - homelab is a guide and runbook only;
  - "keep repo clones at downloads/repos".
- **The owner's objective:** "a bulletproof ai workspace for orchestrating multi agentic workflows … AI framework masterclass", referencing Kernel and Fleet and CCGS. A recurring question: "what is the rec dir scaffold outline?"
- **The owner writes `isSecretCommand`** (learning-mode contribution). Never write it for them.

## The owner's reference model: Kernel and Fleet (saved copy, 637 lines, extracted by a read-only agent)

- **Roles (8):** You (intent and irreversible approvals), Orchestrator (plans, delegates, integrates; never bulk-reads), Explorers (read-only), Builders (the only writers; one issue per task; tests first), Reviewers (read-only, NACK blocks), Gates (deterministic), Senses (MCP: browser, docs), Ledger (issues, ADRs, CONTEXT.md, memory).
- **Separation rule:** "An agent that wrote a change does not review it, and an agent that reviewed it does not merge it."
- **Pipeline:** Brainstorm → Spec (the human decides both) → Plan → Build (machine gate) → Review → Merge (machine) → Ship → Observe, which loops back to Plan.
- **Context layers:**
  - Always loaded: under 150 lines, and procedures go in skills.
  - On demand.
  - Isolated: subagents for any search over three files; 3–5 in parallel.
  - Durable: git, issues, ADRs, CONTEXT.md, memory.
- **Anti-patterns:** CCGS's 49-agent org chart ("take the three specialist prompts that are good; leave the hierarchy"); approval per write; an unbounded CLAUDE.md; secrets in context; autonomy without gates; star counts as evidence.
- **Stale under cloud-first:** core config lives in `~/.claude`; dev-setup and its installer; a projects-root folder; CodeQL; homelab hardware; a user-level ledger hook; local-only senses and signing.
- **Internal inconsistencies:** 7 vs 8 roles; a 150- vs 60-line CLAUDE.md cap; the shift-left ladder's figure has 7 rungs and its table 9.

## False or stale durable context found this session (to fix after approval)

- **Memory `agent-workspace-template-foundation`** says the plans "are copied into private `homelab`". FALSE: `gh api repos/git-commit-duke/homelab/contents/docs/plans` returns 404. The plans exist only in `~/.claude/plans/`, which is swept after 30 days.
- **The spec's Resume state block** is older than the handoff (A4 and A10 status).
- **The handoff** says the drafts can be removed "without regenerating anything". Two drafts exist only inside `combined-reviewed.patch`, not as loose copies. This is harmless, since the plan rewrites both.
- **Memory `cloud-environment-facts`** and the old summary state that a repo's `enabledPlugins` is "NOT installed in cloud". ADR-0004's draft implies otherwise. Re-verify.
- **Previous session:** a verifier agent wrote three stray Temp files during plan mode. This session's research agents (Explore and Plan) also have Bash, so check for strays after the runs.

## Where Claude Code keeps things on this machine (FACT, inspected 2026-09-22)

| Location | Role | Movable into `~/.claude`? |
|---|---|---|
| `C:\Users\dev\.claude\` | Claude Code config and state. No `CLAUDE_CONFIG_DIR` override is set | It is the home |
| `C:\Users\dev\.claude.json` (66 KB) | Claude Code state file (MCP, trust, account); named in the docs | No |
| `C:\Users\dev\.claude\.claude.json` (423 B, 2026-09-19) | **Anomaly**: a nested state file; audit it | Investigate |
| `C:\Users\dev\.local\bin\claude.exe` | The CLI | No |
| `%APPDATA%\Claude\` | Desktop app data: Code-tab sessions, Cowork (`local-agent-mode-sessions`, whose `rpm/` holds the synced plugin copies this session loads), extensions | No |
| `%TEMP%\claude\` | Session scratch from 10+ past working folders, plus stray `hk.js`, `scan.js`, `sz.js`, `sz2.js` | No; clean it |
| `C:\Program Files\ClaudeCode\managed-settings.json` | Absent | n/a |

**Project vs personal `.claude`** (claude-directory, verbatim):
- "Project-scope files live in your repo under `.claude/` (or at the root for `CLAUDE.md`, `.mcp.json`, and `.worktreeinclude`)."
- The global folder is personal configuration that is "never committed to any repository".
- `~/.claude/projects/`: "Each project gets its own memory directory keyed by the repository path."
- The page does not recommend a name or location for the code folder.

Consequences:
- A repo's `.claude\` lives inside that repo, whether in GitHub, a cloud clone or a local clone. It never lives under `C:\Users\dev\.claude`.
- Do not rename `Downloads\repos` to `projects`: that clashes with `~/.claude\projects\`. Keep it, or retire it if the audit finds nothing local-only (owner decision).

**Audit Task 2 must re-verify every row of this table** (the owner asked for this).

**Session records vs working folder** (FACT, `ls ~/.claude/projects`):

| Folder | Belongs to | Memory |
|---|---|---|
| `C--Users-dev--claude` | Sessions opened in `~/.claude` (Opus 5 `3b17c90b`, earlier `dd45129f`) | 7 files |
| `C--Users-dev-Downloads-repos-project-template` | This session (`4c3b0f00`) | empty |
| `C--Users-dev--claude-handoffs` | Does not exist yet | n/a |

- Neither `~/.claude` nor `handoffs` is a git repo (FACT). The launcher therefore gets a new, empty memory folder (INFERENCE from the naming pattern; confirm on first launch).
- **Migration step:** fix the stale memories, copy them into the launcher's memory folder, and verify they load.
- Never move a repo or working folder into `~/.claude/projects/`. It is Claude Code's automatic record store, and old transcripts are swept after `cleanupPeriodDays`.

**Launcher working folder:** open in `~/.claude/handoffs`, not `~/.claude`. Permissions docs, verified: the working folder and its subfolders are freely accessible. A session in `~/.claude` has `.credentials.json`, `settings.json`, hooks and plaintext transcripts in that zone. Windows has no sandbox, so the hook is the only guard.

## Sessions inventory (list_sessions, read-only)

| Session | cwd | State |
|---|---|---|
| Foundation plan resume (this one) | `Downloads\repos\project-template` | running, plan mode, Remote Control on |
| DevOps frameworks and agentic orchestration (Opus 5) | `C:\Users\dev\.claude` | active, idle |
| Fullstack dev plugins | `C:\Users\dev\repos` (the folder is gone) | archived |
| slate7-tailscale | `C:\Users\dev\repos\homelab` (the folder is gone) | archived |

Cowork (one store under `local-agent-mode-sessions\e0303c21…`) and claude.ai/code cloud sessions are not in this list.

**Owner request:** "delete and reset all other claude desktop-cowork sessions".
- Permanent deletion is prohibited for Claude. The owner deletes.
- The plan offers: persist the plans and handoff to git first, then **archive** (reversible) with a fresh yes, then the owner deletes.
- Risk: deleting Cowork's store may remove the `rpm/` plugin copies until the account re-syncs them (INFERENCE).

## Skills loaded this session and how each is used

| Skill | Use here | When |
|---|---|---|
| superpowers:brainstorming | Architectural path: explore → questions → 2–3 approaches → sectioned design → spec → writing-plans | Now, through the spec |
| mattpocock-skills:grilling (via grill-me) | Design-tree rounds: the whole answerable frontier, numbered, with a recommended answer each; plain-language tables first | After research and audit |
| mattpocock-skills:codebase-design | Vocabulary: module, interface, depth, seam, adapter, leverage, locality; the deletion test | Architecture review |
| mattpocock-skills:improve-codebase-architecture | Find deepening candidates in the gate code and the setup. Its HTML report goes to %TEMP% **after** plan mode ends | Audit → report |
| mattpocock-skills:research | Primary-source findings → one cited Markdown file, in the durable location the owner picks | After plan mode ends |
| mattpocock-skills:wizard | A bash wizard for the owner's manual transition stages (below) | After stages are confirmed |
| mattpocock-skills:ask-matt | Cannot be model-invoked (`disable-model-invocation`). The owner runs it | Owner's choice |

## Draft wizard stages: the owner's manual transition (to confirm in the grilling round)

| # | Stage | Where (URL or app) | Value captured | Secret? |
|---|---|---|---|---|
| 1 | Trim the claude.ai account's plugins, skills and connectors to the build profile (these load in cloud sessions) | claude.ai → Customize | none (action); the resulting list is recorded | no |
| 2 | Turn off Desktop-injected connectors and Cowork plugins (desktop-commander first) | Desktop settings | none | no |
| 3 | Claude GitHub App: "Only select repositories", including project-template | github.com/settings/installations | the repo list | no |
| 4 | Cloud environment: network Trusted, no setup script (or the chosen one), no secrets | claude.ai/code → environment | the environment id | no |
| 5 | (Decision) allowed-signers: still needed under launcher-only? | local git config | the signing public key path | no (public key) |
| 6 | (Optional, admin) managed-settings.json with deny rules for the launcher | C:\Program Files\ClaudeCode\ | none | no |
| 7 | Confirm emptying the local folder, after the inventory proves nothing is only-local | local | none | no |

Later admin stages (rename, rulesets, template flag, visibility) run at their plan tasks, because the Claude GitHub App has no Administration permission.

## Task 2 result: byte-by-byte audit (wf_e16da548-459: 36 agents; coverage check: 0 unaccounted entries)

**Inventory:**
- Drafts: 15 files, all hashed and read.
- repos: 606 files.
- `~/.claude`: 315,528 files, all hashed except the never-open list; 49 config files read in full.
- Plugins: 310,944 files, integrity-checked; enabled plugins read.
- `%TEMP%\claude`: 1,266 files.
- gitleaks: no leaks in the drafts or repos. 156 hits in `%TEMP%\claude`, mostly vendor docs.

**Findings:** 111 kept (10 high, 34 medium, 43 low, 24 info).

**Narrow security re-run of the WIP gate code:** 91 confirmed defects (17 high). The guard ignores the Monitor and MCP tools; it treats globs as literal names; it misses `$HOME` and `/c/` spellings; there is no symlink or realpath check; the hook has no `"shell": "bash"`, so it runs under PowerShell on Windows; there are fail-open paths (process substitution, a timeout, a malformed event, an empty list); `--no-verify` bypasses the local hook and nothing enforces the name check in CI.
⇒ The gate code is salvaged as a *starting point* only. Each defect becomes a failing test first.

**Live-repo facts:**
- The committed `.githooks/pre-commit` aborts silently on any commit without a TODO line.
- It is stored as mode 100644, so Linux (cloud) skips it (INFERENCE; probe in the first cloud session).
- CI on main has been red since the first push.
- Dependabot runs are all cancelled.
- Both routes for creating a repo from the template are broken (`cp -r` carries `.git`; `is_template=false`).
- The repo is private with an unprotected main.

**Location map, row by row:**
- Confirmed: `~/.claude`, `~/.claude.json`, managed settings absent, the not-git status, and the projects keys.
- `~/.claude/.claude.json`: an orphan from one start with `CLAUDE_CONFIG_DIR=~/.claude` on 19 Sep.
- `claude.exe` is 2.1.278 and **not on PATH** (the PATH entry names the file); sessions run the Desktop-bundled CLI.
- `%APPDATA%\Claude` is an MSIX-redirected view; the real ~16 GiB lives under `Packages\Claude_pzs8sxrjxfjjc\LocalCache` (Cowork VM 9.7 GiB, npm cache 5.5 GiB).
- `%TEMP%`: about 21 stray files from earlier sessions in the Temp root. These include `x`, `.x_live_true`, `nul_should_not`, `.x`, a **Tailscale status dump `ts.json`**, and homelab `.bak` copies. The previous session's "planned for deletion" never happened.

**Security, new:**
- **desktop-commander was used**: 8 calls on 2026-09-22 between 12:30 and 14:43 UTC, listing `~`, `~/.claude/plugins` and hooks, and reading `checkpoint/SKILL.md` and `known_marketplaces.json`.
  - Its config: `allowedDirectories: []` (unrestricted), `telemetryEnabled: true`, and it stores every call's output in `~/.claude-server-commander/tool-history.jsonl`.
- `history.jsonl` records that a signing key was regenerated without a passphrase.
- Plugins write state into the home folder (`~/.semgrep`, `~/.fioritools`, `~/.convex`).

**Only-local and at risk:**
- The 52-file rebuild and `verify-plan.sh` sit in `%TEMP%`. The critic found Windows is already deleting from Temp outside Claude's sweep ⇒ **most urgent**.
- The six worktree drafts: 16 files.
- Five plans (280 KB) and the handoff.
- Seven memory notes, plus 4 homelab lessons that survive only in orphaned file-history.
- The two keep-sessions (4c3b0f00 at 116 MB, 3b17c90b at 30 MB) become sweep-eligible on 2026-10-22.
- dev-setup's unpushed 28356b4.
- The live launcher settings.
- **Recycle Bin: 76 items, 3.17 GB.** It includes 9 old transcripts and `repos.zip`.

**Architecture (codebase-design vocabulary):**
- Top: one committed home for ledger access and the end-of-work ritual. Six drifting copies hold three different answers, and they rely on GraphQL `gh issue`, which the cloud refuses.
- Strong: move shell-command detection behind `decide`'s interface (the seam has one adapter, and no test crosses the real composition).
- Worth exploring: secret-list knowledge restated outside `paths.mjs`; the workspace lint's interface; protect-repo's baseline stated three times.

**Audit side effect (disclosed):**
- Plain `git status` refreshed `.git/index` in 9 marketplace clones and in `verify-final`.
- No tracked content changed.
- Future audits use `git --no-optional-locks status`.

## Downloads audit (wf_54fa2324-bb1: 10 agents, verified)

| Item | FACT | Disposition |
|---|---|---|
| `claude-settings-2026-09-22.json` (13 KB, sha 3186160d…) | Pre-cut settings: 76 true, 87 false. No secrets. Byte-identical copies sit in file-history, which gets swept | Commit the plugin inventory to git, then recycle |
| `cowork-memory-backup-2026-09-22.zip` (331 B) | Holds one 1-byte `CLAUDE.md`. The 3,677-byte GATE-0 memory was emptied at 09:06 local, before the zip | Recycle. GATE-0 survives as the claude.ai account's `conversation_preferences` field |
| `claude-config-backup-2026-09-22.zip` (1 MB, 349 entries) | Stale pre-cut snapshot; no `.credentials.json`; 6 `.claude.json` account-data rotations (not opened); `ts.json`/`ts2.json` Tailscale dumps (PII, addresses); 3 unique metadata files | Archive offline, or recycle once the unique metadata is captured |
| `ebook-code-modernization-playbook.pdf` (27 pp) | Anthropic marketing. Practices are partly used; it conflicts on self-generated tests; its sample code has errors | Recycle (owner's call) |
| Downloads sweep | No other Claude items. `Mobile Devices/` and `pwsh.md` unknown. **The Recycle Bin already holds 74 items** (33 from Downloads) | Owner reviews |

**HIGH findings:**
- **The plugin cut removed 87 explicit `false` entries** (39 `@inline`). Evidence: 32 `@inline` plugins load after the cut (transcripts dd45 vs 4c3b); 13 `rpm/` plugins were never suppressed.
  - Fix, with a greenlight: restore the `@inline: false` entries from the backup, **plus** turn off the `rpm/` plugins at the Desktop or account level.
  - Verify in a fresh terminal `claude` session and a fresh Desktop session.
- **Nothing backs up the current 8-plugin settings.**
- **Live `.credentials.json`** (30 KB, INFERENCE: includes MCP OAuth tokens) is guarded only by `Read(~/.claude/.credentials.json)`. Windows has no sandbox. Mitigations: the launcher's working folder stays outside `~/.claude`, `blockReadsOutsideWorkingDirectories`, and PowerShell deny twins.
- **`ts.json` and `ts2.json`** in live `~/.claude` hold tailnet PII and endpoints within agent reach. Recycle with a greenlight.

## Owner rule (2026-09-22): no sprawl, no stale data

The owner's words: "files that superseeded should be overwritted modified and deleted … keep all dir files and folders organized neatly and following consistently naming conventions/format/saving-location … no stale data".

**Approval gate (the owner, 2026-09-22):** "files can be updated, modified, overwritten, appended, deleted, renamed, relocated as required but only after my verbal greenlight/approval".
- Every file-changing batch is shown as a manifest first: the exact path and action for each file.
- Execution starts only after an explicit yes **for that batch**. Approving this plan does not approve its batches.
- Save as a feedback memory after approval: "greenlight-before-file-changes".

**Mechanics within Claude's limits:**
- **Rewrite in place** once the file's unique content has moved to its single home.
- **In git:** delete by commit; history is the record.
- **Outside git:** move to the **Windows Recycle Bin** (reversible). The owner empties it; permanent deletion is prohibited for Claude.
- **Irreversible git housekeeping** (branch deletes): a listed manifest and one yes.

**Settings that make it possible** (settings-reference, verbatim):
- `plansDirectory`: "Choose where plan mode writes plan files".
- `autoMemoryDirectory`: "Store auto memory in a directory you choose".
- `cleanupPeriodDays`.
- There is no transcript-location setting.

**Draft convention** (to confirm in the grilling round; `<launcher>` is still an owner decision):

| Kind | Home | Name | Replacement |
|---|---|---|---|
| Claude Code config | `~/.claude/` (CLAUDE.md, settings.json, rules, agents, skills, hooks only) | fixed | in place; no `.bak` files |
| Launcher handoff | `<launcher>/handoffs/` | `YYYY-MM-DD-<topic>.md`, one per topic | newest replaces older |
| Plans | `<launcher>/plans/` (`plansDirectory`), then git | `YYYY-MM-DD-<topic>.md` | rewrite |
| Memory | `<launcher>/memory/` (`autoMemoryDirectory`) | `<kebab-slug>.md` + `MEMORY.md` | fix or remove the same day |
| Project knowledge | each repo: `docs/adr/NNNN-*.md`, `docs/specs/`, `docs/research/YYYY-MM-DD-*.md`, `CONTEXT.md` | as shown | commit |
| Build progress | GitHub issues and PR comments | issue number | always current |
| Downloads, %TEMP% | nothing Claude-related after migration | n/a | recycled |
| Local clones | none while idle; a throwaway while work is uncommitted | `Downloads/repos/<repo>` | recycled after push |

**Enforcement:** `/session-close` rewrites the handoff and memory in place, and fails if it finds a Claude file outside this table.

**Save as a feedback memory after approval:** "no-sprawl-single-source".

## Research results (workflow wf_9bef6daa-085: 39 agents, verbatim-checked)

- **Numbers:**
  - 237 principles kept, 9 dropped as unquotable.
  - 77 audit findings confirmed, 4 disputed: 4 critical, 18 high, 31 medium, 19 low, 5 info.
  - The **hooks security audit was blocked** by a safety classifier and is not a clean result. It is re-run narrowly in Task 2.
- **Candidates:**
  - **Kernel:** Linus-minimal. One writer, deterministic gates, read-only reviewers, state in GitHub.
  - **Platform:** Yegge throughput. Ledger graph, parallel workers, merge queue.
  - **Studio:** a CCGS role hierarchy.
- **Judges** (security, solo operability, portfolio): Kernel won 3/3, scoring 8 each time; Platform scored 4–5 and Studio 3–5.
  - Grafts: an agent_id write-guard (Studio), "Discovered-from #n" issues plus a ready list at SessionStart (Platform), and a deterministic observe loop (Platform).
- **Synthesizer recommendation:**
  - Kernel as the spine, with GitHub Issues as the only ledger.
  - Parallelism means separate cloud sessions on separate issues, 2–3 at most.
  - One gate catalogue (docs/gates.md).
  - Salvage the rebuild's gate code, fix the confirmed findings, and **replace the 3,108-line plan with issues**.
- **Critical findings:**
  1. The WIP execution model is local-centric and contradicts cloud-first.
  2. The plan and spec live only on the workstation.
  3. The whole workflow lives in user-level `~/.claude`, which never reaches the cloud.
  4. (Critic) **A PR can rewrite the CI gate that judges it**: on `pull_request`, all-green comes from the PR's own workflow.
- **High findings (selection):**
  - The series is not bisectable: `scripts/test.sh` is never staged.
  - session-start overwrites a derived repo's `core.hooksPath`.
  - The ledger uses GraphQL `gh issue`.
  - Review evidence is self-reported; it is not tied to the head SHA.
  - The auditor cannot run tools, yet the protocol requires it to.
  - Plugins cannot be "moved into the template"; they are account-synced in the cloud.
  - session-close writes to the local disk in the cloud VM, so the handoff is lost.
  - Several files still say "build locally".
  - Admin operations cannot run in the cloud (the App has no Administration permission).
  - The single-writer rule is not enforced (forks and general-purpose agents can write).
  - Build sessions keep WebFetch and MCP egress (Rule of Two).
- **Launcher (FACT, permission-modes docs):**
  - `.claude` is a **protected directory** ("except for `.claude/worktrees`").
  - Writes there are "never auto-approved": prompted in default and acceptEdits, **denied in dontAsk**.
  - "`permissions.allow` rules … do not pre-approve protected-path writes."
  - The only bypass is a session-wide "allow Claude to edit its own settings", which also opens `settings.json` and hooks.
  - `permissions.blockReadsOutsideWorkingDirectories` exists and fences the file tools in every mode.
  - PowerShell rules use the same shape as Bash rules, but they are separate rules.
  - ⇒ A launcher *inside* `~/.claude` either prompts on every handoff write or unlocks its own config. **Owner decision:** keep `~/.claude/handoffs` or move it to e.g. `C:\Users\dev\launcher\handoffs`.

## Pending (research workflow wf_2872568b-75c)

- Cloud-session facts, each checked adversarially:
  - which config loads;
  - hooks and setup scripts;
  - network access and tools;
  - multi-repo sessions;
  - commit signing, branch rules, PR and issue APIs.
- Anthropic's recommendation on clone and worktree location.
- A line-level sweep of the implementation plan for local assumptions, and where each amendment lands.
- Harness portability.
- ADR-0004 reconciliation.
