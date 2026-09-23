#!/usr/bin/env bash
# Rebuilds the implementation plan's final repository state in a scratch repo and runs every check it claims.
# Blocks are matched by content signature, so the script survives edits that move them.
# Scratch-only: the isSecretCommand body below is a sample proving the owner's tests are satisfiable.
set -uo pipefail
S="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
P="C:/Users/dev/.claude/plans/2026-09-22-foundation-implementation.md"
V="$S/verify-final"
rm -r -f "$V"; mkdir -p "$V" "$S/blocks"
cd "$V" || exit 1
git init -q && git config user.email t@example.invalid && git config user.name t && git config commit.gpgsign false

node "$S/extract-blocks.mjs" "$P" "$V" \
 '# ADR-0001: GitHub-native::docs/adr/0001-security-baseline.md' \
 '# ADR-0002: No secrets on disk::docs/adr/0002-no-secrets-on-disk.md' \
 '# ADR-0003: Gates travel::docs/adr/0003-gates-travel-with-the-repository.md' \
 '# Exercises .githooks/pre-commit::.githooks/pre-commit.test.sh' \
 '# Pre-commit gate. SessionStart enables it::.githooks/pre-commit' \
 'accepts a pinned pnpm with a test script::.github/scripts/check-package.test.mjs' \
 '// CI contract for repositories with a package.json::.github/scripts/check-package.mjs' \
 'group: ci-${{ github.ref }}::.github/workflows/ci.yml' \
 '# The one place that knows which tests exist::scripts/test.sh' \
 'package-ecosystem: github-actions::.github/dependabot.yml' \
 '# LF everywhere::.gitattributes' \
 'node_modules/::.gitignore' \
 'name: maintainer::.claude/agents/maintainer.md' \
 'name: checkpoint::.claude/skills/checkpoint/SKILL.md' \
 "# Files whose contents must never enter an agent's context::.claude/hooks/secret-paths.txt" \
 'secret .env::.claude/hooks/secret-paths.fixtures.txt' \
 'every fixture gets its expected verdict::.claude/hooks/paths.test.mjs' \
 '// Secret-path matcher shared by the guard::.claude/hooks/paths.mjs' \
 '// Pre-commit entry: reads staged paths::.claude/hooks/staged-secrets.mjs' \
 'path tools are blocked on secret files::.claude/hooks/guard.test.mjs' \
 '// Decides whether a tool call may run::.claude/hooks/policy.mjs' \
 '// PreToolUse entry. Registered as::.claude/hooks/guard.mjs' \
 '// Decides whether a shell command would put::.claude/hooks/secret-command.mjs' \
 'Bash commands that read secret files are blocked::.claude/hooks/secret-command.test.mjs' \
 'settings must deny every::.github/scripts/check-workspace.test.mjs' \
 '// The AI-workspace lint::.github/scripts/check-workspace.mjs' \
 '# Runs the exact PreToolUse command from settings.json::.claude/hooks/hook-command.test.sh' \
 '"$schema": "https://json.schemastore.org/claude-code-settings.json"::.claude/settings.json' \
 '# Exercises session-start.sh and cloud-bootstrap.sh::.claude/hooks/session-start.test.sh' \
 '# SessionStart hook: puts the ledger::.claude/hooks/session-start.sh' \
 '# Cloud-session bootstrap::.claude/hooks/cloud-bootstrap.sh' \
 'name: auditor::.claude/agents/auditor.md' \
 'name: deep-audit::.claude/skills/deep-audit/SKILL.md' \
 '"name": "main"::.github/rulesets/main.json' \
 '# Exercises scripts/protect-repo.sh against a stub gh::scripts/protect-repo.test.sh' \
 '# Locks a GitHub repository to this::scripts/protect-repo.sh' \
 'relative links to tracked files and directories pass::.github/scripts/check-doc-refs.test.mjs' \
 '// Fails on relative markdown links::.github/scripts/check-doc-refs.mjs' \
 '# agent-workspace-template::README.md' \
 'MIT License::LICENSE' \
 '# Security policy::SECURITY.md' \
 '# <project name>::CLAUDE.md' \
 '# CONTEXT: <project name>::CONTEXT.md' \
 '# Issue tracker: GitHub::docs/agents/issue-tracker.md' \
 '# Plugins, their hooks and MCP servers::docs/agents/plugins.md' \
 '# Web add-on::docs/addons/web/README.md' || { echo "BLOCK EXTRACTION FAILED"; exit 1; }

node "$S/extract-blocks.mjs" "$P" "$S/blocks" \
 '  # The hook code runs on whatever node a session has::hooks-job.yml' \
 '      - name: Workspace lint::lint-step.yml' \
 '# The shared matcher, copied in the way::b52.sh' \
 'is refused by the shared list::b53.sh' \
 'the secret-file check failed::b54.sh' \
 '  run node --test .claude/hooks/paths.test.mjs::hooks-first-test.sh' >/dev/null || { echo "FRAGMENT EXTRACTION FAILED"; exit 1; }

results=()
run() { local name="$1"; shift; if "$@" >"$S/last.out" 2>&1; then results+=("PASS  $name"); else results+=("FAIL  $name"); sed 's/^/      /' "$S/last.out" | tail -15; fi; }
not() { ! "$@"; }

# PR 1 state: the v1 hook passes its tests; the original hook fails them.
run "pre-commit v1 tests (v1 hook)" bash .githooks/pre-commit.test.sh
cp .githooks/pre-commit "$S/v1-hook"
MSYS_NO_PATHCONV=1 git -C "C:/Users/dev/Downloads/repos/project-template" show origin/main:.githooks/pre-commit > .githooks/pre-commit
run "pre-commit v1 tests are red on the original hook" not bash .githooks/pre-commit.test.sh
cp "$S/v1-hook" .githooks/pre-commit

# Task 9: the owner's tests are red on the scaffold, then satisfiable in a few lines.
run "secret-command tests are red on the scaffold" not node --test .claude/hooks/secret-command.test.mjs
cat > .claude/hooks/secret-command.mjs <<'EOF'
// SCRATCH-ONLY sample body proving the owner's tests are satisfiable. Not part of the plan.
export function isSecretCommand(toolName, command, isSecret) {
  const words = command.split(/[\s;&|<>()'"`]+/).filter(Boolean);
  const hit = words.find((w) => isSecret(w));
  return hit ? `${toolName} command names the secret file ${hit}.` : null;
}
EOF

# Task 13: pre-commit v2, applied exactly as the plan describes.
node -e '
const fs=require("fs"); const [t,h,b52,b53,b54]=process.argv.slice(1); const rd=(f)=>fs.readFileSync(f,"utf8");
let test=rd(t); const a1=test.match(/^no_tools=\(.*\)\n/m)[0]; test=test.replace(a1,()=>a1+rd(b52));
const a2="if command -v gitleaks >/dev/null 2>&1; then\n"; if(!test.includes(a2)) throw "anchor2"; test=test.replace(a2,()=>rd(b53)+a2); fs.writeFileSync(t,test);
let hook=rd(h); const env=hook.match(/^if printf .*\n(?:.*\n)*?^fi\n/m)[0]; hook=hook.replace(env,()=>rd(b54));
const hdr="# Blocks: staged env files, staged secrets (gitleaks), a failing typecheck, Dockerfile lint errors."; if(!hook.includes(hdr)) throw "hdr";
hook=hook.replace(hdr,()=>"# Blocks: staged secret files (.claude/hooks/secret-paths.txt), staged secrets (gitleaks), a failing typecheck, Dockerfile lint errors.");
fs.writeFileSync(h,hook);' .githooks/pre-commit.test.sh .githooks/pre-commit "$S/blocks/b52.sh" "$S/blocks/b53.sh" "$S/blocks/b54.sh"

# Final ci.yml and test runner: the hooks job, the lint step, and every test each task adds.
node -e '
const fs=require("fs"); const [ci,hooksJob,lintStep]=process.argv.slice(1); const rd=(f)=>fs.readFileSync(f,"utf8");
let y=rd(ci); const must=(s)=>{ if(!y.includes(s)) throw new Error("anchor missing: "+s); };
const dr="  # GitHub offers dependency review"; must(dr);
y=y.replace(dr,()=>rd(hooksJob)+"\n"+dr);
must("needs: [universal, node]"); y=y.replace("needs: [universal, node]",()=>"needs: [universal, node, hooks]");
const exec="      - name: Git hooks are executable\n        run: test \"$(git ls-files -s .githooks/pre-commit | cut -c1-6)\" = 100755\n"; must(exec); y=y.replace(exec,()=>rd(lintStep));
fs.writeFileSync(ci,y);' .github/workflows/ci.yml "$S/blocks/hooks-job.yml" "$S/blocks/lint-step.yml"
node -e '
const fs=require("fs");
let t=fs.readFileSync("scripts/test.sh","utf8");
t=t.replace("  : # the first hook test arrives with the matcher in PR ②\n", () => [
  "  run node --test .claude/hooks/paths.test.mjs",
  "  run node --test .claude/hooks/guard.test.mjs",
  "  run node --test .claude/hooks/secret-command.test.mjs",
].join("\n")+"\n");
t=t.replace("  run node --test .github/scripts/check-package.test.mjs\n", () => [
  "  run node --test .github/scripts/check-package.test.mjs",
  "  run node --test .github/scripts/check-workspace.test.mjs",
  "  run node .github/scripts/check-workspace.mjs",
  "  run bash .claude/hooks/hook-command.test.sh",
  "  run bash .claude/hooks/session-start.test.sh",
  "  run bash scripts/protect-repo.test.sh",
  "  run node --test .github/scripts/check-doc-refs.test.mjs",
  "  run node .github/scripts/check-doc-refs.mjs",
].join("\n")+"\n");
fs.writeFileSync("scripts/test.sh",t);'

# The web add-on's rules exist only after Task 16 moves them; create the folder the README points at.
mkdir -p docs/addons/web/rules && printf -- '---\npaths:\n  - "src/server/**"\n---\n\n# Server\n\nPlaceholder in the scratch rebuild; the real file is moved by Task 16.\n' > docs/addons/web/rules/server.md
mkdir -p .claude/rules && printf -- '---\npaths:\n  - "prototypes/**"\n---\n\n# Prototypes\n\nPlaceholder in the scratch rebuild.\n' > .claude/rules/prototypes.md
printf 'A=\n' > .env.example
mkdir -p docs/agents && printf '# Domain\n\nPlaceholder in the scratch rebuild.\n' > docs/agents/domain.md
mkdir -p .github/ISSUE_TEMPLATE && printf 'name: Task\ndescription: A slice of work one session can finish\nbody:\n  - type: textarea\n    id: outcome\n    attributes:\n      label: Outcome\n' > .github/ISSUE_TEMPLATE/task.yml
printf '## Why\n\n<!-- placeholder in the scratch rebuild -->\n' > .github/pull_request_template.md

git add -A && git update-index --chmod=+x .githooks/pre-commit scripts/protect-repo.sh scripts/test.sh && git commit -q -m final

run "the whole runner (hooks + ci groups)" bash scripts/test.sh all
run "pre-commit v2 tests" bash .githooks/pre-commit.test.sh
run "workspace lint" node .github/scripts/check-workspace.mjs
run "doc links" node .github/scripts/check-doc-refs.mjs
run "shellcheck every shell file" shellcheck -S style .githooks/pre-commit .githooks/pre-commit.test.sh .claude/hooks/session-start.sh .claude/hooks/cloud-bootstrap.sh .claude/hooks/session-start.test.sh .claude/hooks/hook-command.test.sh scripts/protect-repo.sh scripts/protect-repo.test.sh scripts/test.sh
run "actionlint" actionlint
run "zizmor (offline)" zizmor --offline .github/
run "semgrep p/default --error" semgrep scan --config p/default --error --metrics=off --quiet
run "gitleaks over the history" gitleaks git . --no-banner --redact
printf '%s\n' "${results[@]}"
fails=$(printf '%s\n' "${results[@]}" | grep -c '^FAIL' || true)
echo "$fails failed of ${#results[@]}"
exit $(( fails > 0 ? 1 : 0 ))
