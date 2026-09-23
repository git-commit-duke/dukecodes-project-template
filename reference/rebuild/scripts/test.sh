#!/usr/bin/env bash
# The one place that knows which tests exist.
#   scripts/test.sh          every group
#   scripts/test.sh hooks    the gate tests; CI runs this group on each Node version a session may use
#   scripts/test.sh ci       everything else
# Non-interactive and idempotent: it takes no input, changes nothing, and exits 0 only when every group passed.
set -uo pipefail
status=0
run() { echo "== $*"; "$@" || status=1; }

group_hooks() {
  run node --test .claude/hooks/paths.test.mjs
  run node --test .claude/hooks/guard.test.mjs
  run node --test .claude/hooks/secret-command.test.mjs
}

group_ci() {
  run bash .githooks/pre-commit.test.sh
  run node --test .github/scripts/check-package.test.mjs
  run node --test .github/scripts/check-workspace.test.mjs
  run node .github/scripts/check-workspace.mjs
  run bash .claude/hooks/hook-command.test.sh
  run bash .claude/hooks/session-start.test.sh
  run bash scripts/protect-repo.test.sh
  run node --test .github/scripts/check-doc-refs.test.mjs
  run node .github/scripts/check-doc-refs.mjs
}

case "${1:-all}" in
  hooks) group_hooks ;;
  ci) group_ci ;;
  all) group_hooks; group_ci ;;
  *) echo "usage: scripts/test.sh [all|hooks|ci]" >&2; exit 2 ;;
esac
exit "$status"
