#!/usr/bin/env bash
# Runs the exact PreToolUse command from settings.json. Claude Code lets a tool call run on any exit code
# other than 2, so a missing node must still produce 2. Run: bash .claude/hooks/hook-command.test.sh
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
native_root="$(cygpath -m "$root" 2>/dev/null || printf '%s' "$root")"
cmd=$(node -e 'const s = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); const e = s.hooks.PreToolUse.find((x) => x.matcher.split("|").includes("Bash")); process.stdout.write(e.hooks[0].command)' "$root/.claude/settings.json")
node_dir="$(dirname "$(command -v node)")"
fails=0
# check <want> <description> <PATH> <event-json>
check() {
  local want="$1" desc="$2" p="$3" json="$4" got=0
  printf '%s' "$json" | CLAUDE_PROJECT_DIR="$root" PATH="$p" "$BASH" -c "$cmd" >/dev/null 2>&1 || got=$?
  if [[ "$got" == "$want" ]]; then echo "ok   $desc"; else echo "FAIL $desc: want $want, got $got"; fails=$((fails + 1)); fi
}
readme='{"tool_name":"Read","tool_input":{"file_path":"README.md"},"cwd":"'"$native_root"'"}'
secret='{"tool_name":"Read","tool_input":{"file_path":".env"},"cwd":"'"$native_root"'"}'
check 2 "a missing node blocks every call" "/nonexistent" "$readme"
check 0 "an ordinary read passes" "$node_dir:$PATH" "$readme"
check 2 "a secret read is blocked" "$node_dir:$PATH" "$secret"
if (( fails == 0 )); then echo "hook-command tests: all passed"; else echo "hook-command tests: $fails failed"; exit 1; fi
