#!/usr/bin/env bash
# Exercises session-start.sh and cloud-bootstrap.sh in throwaway repositories. Run: bash .claude/hooks/session-start.test.sh
set -euo pipefail
src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
fails=0
check() { local desc="$1"; shift; if "$@"; then echo "ok   $desc"; else echo "FAIL $desc"; fails=$((fails + 1)); fi; }
not() { ! "$@"; }
# start <project-dir> [VAR=value ...]: runs the hook as Claude Code would; outside the cloud unless told otherwise.
start() { local dir="$1"; shift; env -u CLAUDE_CODE_REMOTE CLAUDE_PROJECT_DIR="$dir" GH_BIN=/nonexistent/gh "$@" bash "$dir/.claude/hooks/session-start.sh"; }

repo="$tmp/repo"
git init -q "$repo"
cd "$repo"
git config user.email t@example.invalid
git config user.name t
git config commit.gpgsign false
mkdir -p .githooks .claude/hooks
: > .githooks/pre-commit
cp "$src/session-start.sh" .claude/hooks/
printf '#!/usr/bin/env bash\necho stub bootstrap ran\n' > .claude/hooks/cloud-bootstrap.sh
git add -A
git commit -q -m base

out=$(start "$repo")
check "prints the ledger" grep -q "^## Ledger at session start" <<< "$out"
check "turns the commit gate on" test "$(git config --get core.hooksPath)" = .githooks
check "says it turned the gate on" grep -q "commit gate: core.hooksPath set" <<< "$out"
check "names a missing gh" grep -q "WARN: gh not found" <<< "$out"
check "no bootstrap outside the cloud" not grep -q "cloud bootstrap" <<< "$out"
out=$(start "$repo" CLAUDE_CODE_REMOTE=true)
check "bootstraps in the cloud" grep -q "cloud bootstrap: ok" <<< "$out"

git config --unset core.hooksPath
git worktree add -q "$tmp/wt" -b wt
out=$(start "$tmp/wt")
check "prints the ledger inside a worktree" grep -q "^## Ledger at session start" <<< "$out"
check "turns the gate on from a worktree" test "$(git config --get core.hooksPath)" = .githooks

home="$tmp/home"
mkdir -p "$home"
export GO_LOG="$tmp/go.log"
# shellcheck disable=SC2016 # the stub's own variables, expanded when the stub runs
printf '#!/usr/bin/env bash\necho "GOBIN=$GOBIN go $*" >> "$GO_LOG"\nexit "${GO_EXIT:-0}"\n' > "$tmp/go"
chmod +x "$tmp/go"
bootstrap() { env HOME="$home" GO_BIN="$tmp/go" GITLEAKS_BIN=/nonexistent/gitleaks PNPM_BIN=/nonexistent/pnpm "$@" bash "$src/cloud-bootstrap.sh" >/dev/null 2>&1; }
: > "$GO_LOG"
check "bootstrap installs gitleaks when it is missing" bootstrap
check "it installs the pinned module into ~/.local/bin" grep -q "GOBIN=$home/.local/bin go install github.com/zricethezav/gitleaks/v8@v8.30.1" "$GO_LOG"
check "a failing install is reported, not swallowed" not bootstrap GO_EXIT=1
check "no GitHub release download can come back" not grep -q "releases/download" "$src/cloud-bootstrap.sh"

if (( fails == 0 )); then echo "session-start tests: all passed"; else echo "session-start tests: $fails failed"; exit 1; fi
