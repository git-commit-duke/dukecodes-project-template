#!/usr/bin/env bash
# Exercises scripts/protect-repo.sh against a stub gh that logs its calls and serves canned JSON.
# Run: bash scripts/protect-repo.test.sh
set -euo pipefail
script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/protect-repo.sh"
ruleset="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.github/rulesets/main.json"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin"
export GH_LOG="$tmp/gh.log" STUB_RULESET_FILE="$ruleset"
cat > "$tmp/bin/gh" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$GH_LOG"
shift
method=GET; endpoint=""; jqexpr=""
while (($#)); do
  case "$1" in
    -X) method="$2"; shift 2 ;;
    --jq) jqexpr="$2"; shift 2 ;;
    -F|-f|--input) shift 2 ;;
    *) [[ -z "$endpoint" ]] && endpoint="$1"; shift ;;
  esac
done
if [[ -n "${STUB_FAIL:-}" && "$method $endpoint" == "$STUB_FAIL" ]]; then exit 1; fi
[[ "$method" != GET ]] && exit 0
case "$endpoint" in
  repos/o/r) json=$(printf '{"visibility":"%s","allow_merge_commit":true,"allow_squash_merge":%s,"allow_rebase_merge":false,"delete_branch_on_merge":true,"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}' "${STUB_VISIBILITY:-public}" "${STUB_SQUASH:-false}") ;;
  repos/o/r/vulnerability-alerts) exit 0 ;;
  repos/o/r/automated-security-fixes|repos/o/r/private-vulnerability-reporting) json='{"enabled":true}' ;;
  repos/o/r/rulesets) if [[ "${STUB_HAS_RULESET:-yes}" == yes ]]; then json='[{"id":7,"name":"main"}]'; else json='[]'; fi ;;
  repos/o/r/rulesets/7) json=$(jq -c '. + {id: 7, source: "o/r", _links: {}} | .rules |= map(if .type == "pull_request" then .parameters += {automatic_copilot_code_review_enabled: false} else . end)' "$STUB_RULESET_FILE") ;;
  *) echo "stub gh: unexpected $method $endpoint" >&2; exit 3 ;;
esac
if [[ -n "$jqexpr" ]]; then printf '%s' "$json" | jq -r "$jqexpr"; else printf '%s\n' "$json"; fi
STUB
chmod +x "$tmp/bin/gh"
export PATH="$tmp/bin:$PATH"
fails=0
# t <want> <description> <stdin> <args...>
t() {
  local want="$1" desc="$2" input="$3" got=0
  shift 3
  : > "$GH_LOG"
  printf '%s\n' "$input" | bash "$script" "$@" >"$tmp/out" 2>&1 || got=$?
  if [[ "$got" == "$want" ]]; then echo "ok   $desc"; else echo "FAIL $desc: want $want, got $got"; sed 's/^/     /' "$tmp/out"; fails=$((fails + 1)); fi
}
logged() { grep -F -- "$1" "$GH_LOG" >/dev/null || { echo "FAIL expected gh call: $1"; fails=$((fails + 1)); }; }
not_logged() { if grep -F -- "$1" "$GH_LOG" >/dev/null; then echo "FAIL unexpected gh call: $1"; fails=$((fails + 1)); fi; }
said() { grep -F -- "$1" "$tmp/out" >/dev/null || { echo "FAIL expected output: $1"; fails=$((fails + 1)); }; }

t 2 "a usage error without a repo" "" --check
t 0 "--check passes when in sync, tolerating extra live defaults" "" --check o/r
STUB_SQUASH=true t 1 "--check reports squash drift" "" --check o/r
said "allow_squash_merge is true"
STUB_HAS_RULESET=no t 1 "--check reports a missing ruleset" "" --check o/r
said "ruleset 'main' is missing"
t 1 "answering n changes nothing" "n" o/r
not_logged "-X PUT"; not_logged "-X PATCH"; not_logged "-X POST"
STUB_HAS_RULESET=no t 0 "answering y applies everything and creates the ruleset" "y" o/r
logged "-X PUT repos/o/r/vulnerability-alerts"; logged "-X PATCH repos/o/r"; logged "-X POST repos/o/r/rulesets"; said "settings/installations"
t 0 "an existing ruleset is updated in place" "y" o/r
logged "-X PUT repos/o/r/rulesets/7"; not_logged "-X POST"
STUB_VISIBILITY=private t 0 "private repos skip what GitHub Free lacks" "y" o/r
said "not available on private repositories"; not_logged "rulesets"
STUB_FAIL="PUT repos/o/r/automated-security-fixes" t 1 "a failed step is reported and the rest still runs" "y" o/r
said "1 step(s) failed"; logged "-X PATCH repos/o/r"
if (( fails == 0 )); then echo "protect-repo tests: all passed"; else echo "protect-repo tests: $fails failed"; exit 1; fi
