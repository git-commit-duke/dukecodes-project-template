#!/usr/bin/env bash
# SessionStart hook: puts the ledger into context and keeps the commit gate on.
# Its stdout becomes context, so it stays short. It degrades loudly: a missing tool is named, never hidden.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -d .githooks && "$(git config --get core.hooksPath || true)" != ".githooks" ]]; then
  git config core.hooksPath .githooks && echo "commit gate: core.hooksPath set to .githooks"
fi

if [[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]]; then
  log="${TMPDIR:-/tmp}/claude-cloud-bootstrap.log"
  if bash "$here/cloud-bootstrap.sh" >"$log" 2>&1; then
    echo "cloud bootstrap: ok"
  else
    echo "WARN: cloud bootstrap failed; see $log. The commit gate's secret scan may be missing."
  fi
fi

branch=$(git branch --show-current 2>/dev/null)
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "## Ledger at session start"
echo "branch ${branch:-detached}, $dirty uncommitted path(s). Last commits:"
git log --oneline -3 2>/dev/null | sed 's/^/  /'
if upstream=$(git rev-parse --abbrev-ref '@{upstream}' 2>/dev/null); then
  ahead=$(git rev-list --count "$upstream..HEAD" 2>/dev/null || echo "?")
  if [[ "$ahead" != "0" ]]; then echo "WARN: $ahead commit(s) not pushed to $upstream."; fi
fi
gh_bin="${GH_BIN:-gh}"
if command -v "$gh_bin" >/dev/null 2>&1; then
  if issues=$("$gh_bin" issue list --assignee @me --state open --limit 5 --json number,title --jq '.[] | "  #\(.number) \(.title)"' 2>/dev/null); then
    if [[ -n "$issues" ]]; then
      echo "open issues assigned to me:"
      echo "$issues"
    else
      echo "no open issues assigned to me; claim one with: gh issue edit <n> --add-assignee @me"
    fi
  else
    echo "WARN: gh could not list issues (not signed in, or no GitHub remote)."
  fi
else
  echo "WARN: gh not found; the issue ledger is unavailable in this session."
fi
exit 0
