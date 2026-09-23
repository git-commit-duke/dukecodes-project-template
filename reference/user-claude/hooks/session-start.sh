#!/usr/bin/env bash
# Claude Code SessionStart hook. Stdout becomes context, so this stays short.
# Puts the ledger in front of the orchestrator on startup, resume, and after compaction.
# Worktree-safe: a worktree's .git is a file, so the directory test used before stayed silent there.
# Issues are read over REST, because the cloud GitHub proxy serves only pinned GraphQL operations.
set -u
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
branch=$(git branch --show-current 2>/dev/null)
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "## Ledger at session start"
echo "branch ${branch:-detached}, $dirty uncommitted path(s). Last commits:"
git log --oneline -3 2>/dev/null | sed 's/^/  /'
if [[ -f .claude/state/active.md ]]; then
  echo "resume from .claude/state/active.md:"
  head -12 .claude/state/active.md | sed 's/^/  /'
fi
if command -v gh >/dev/null 2>&1 && git remote get-url origin >/dev/null 2>&1; then
  issues=$(gh api "repos/{owner}/{repo}/issues?state=open&per_page=10" \
    --jq '.[] | select(.pull_request | not) | "  #\(.number) \(.title)"' 2>/dev/null || true)
  if [[ -n "$issues" ]]; then
    echo "open issues:"
    echo "$issues"
  else
    echo "no open issues; pick one from the ledger before starting"
  fi
fi
exit 0
