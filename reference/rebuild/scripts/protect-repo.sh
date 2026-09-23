#!/usr/bin/env bash
# Locks a GitHub repository to this template's baseline: security features, merge settings, and the
# ruleset in .github/rulesets/main.json.
#   scripts/protect-repo.sh <owner/repo>          show the plan, ask, apply (continues past a failed step)
#   scripts/protect-repo.sh --check <owner/repo>  report drift; exit 0 in sync, 1 on drift
# GitHub Free: private repositories get no ruleset, secret scanning or private vulnerability reporting;
# those steps are skipped with a message. Tested by scripts/protect-repo.test.sh.
set -euo pipefail
usage() { echo "usage: $0 [--check] <owner/repo>" >&2; exit 2; }
mode=apply
if [[ "${1:-}" == "--check" ]]; then mode=check; shift; fi
[[ $# -eq 1 && "$1" == */* ]] || usage
repo="$1"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ruleset_file="$root/.github/rulesets/main.json"
name=$(jq -r '.name' "$ruleset_file" | tr -d '\r')
g() { gh "$@" | tr -d '\r'; }

visibility=$(g api "repos/$repo" --jq '.visibility')
public=false
if [[ "$visibility" == public ]]; then public=true; fi
ruleset_id() { g api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$name\") | .id" | head -n1; }

# The live ruleset covers the file when every field the file sets matches; defaults GitHub adds are ignored.
# shellcheck disable=SC2016 # $want, $live and $k are jq variables
covers_filter='def canon: {name, target, enforcement, conditions, bypass_actors: (.bypass_actors // []), rules: ((.rules // []) | map({type, parameters}) | sort_by(.type))};
def covers($want; $live):
  if ($want | type) == "object" then ($live | type) == "object" and all($want | keys[]; . as $k | ($live | has($k)) and covers($want[$k]; $live[$k]))
  elif ($want | type) == "array" then ($live | type) == "array" and ($want | length) == ($live | length) and all(range(0; $want | length); covers($want[.]; $live[.]))
  else $want == $live end;
covers($want | canon; $live | canon)'

if [[ "$mode" == check ]]; then
  drift=0
  report() { echo "drift: $1"; drift=1; }
  read -r merge squash rebase del < <(g api "repos/$repo" --jq '"\(.allow_merge_commit) \(.allow_squash_merge) \(.allow_rebase_merge) \(.delete_branch_on_merge)"')
  [[ "$merge" == true ]] || report "allow_merge_commit is $merge (want true)"
  [[ "$squash" == false ]] || report "allow_squash_merge is $squash (want false)"
  [[ "$rebase" == false ]] || report "allow_rebase_merge is $rebase (want false)"
  [[ "$del" == true ]] || report "delete_branch_on_merge is $del (want true)"
  gh api "repos/$repo/vulnerability-alerts" >/dev/null 2>&1 || report "Dependabot alerts are off"
  [[ "$(g api "repos/$repo/automated-security-fixes" --jq '.enabled' 2>/dev/null || true)" == true ]] || report "Dependabot security updates are off"
  if $public; then
    [[ "$(g api "repos/$repo" --jq '.security_and_analysis.secret_scanning.status')" == enabled ]] || report "secret scanning is off"
    [[ "$(g api "repos/$repo" --jq '.security_and_analysis.secret_scanning_push_protection.status')" == enabled ]] || report "push protection is off"
    [[ "$(g api "repos/$repo/private-vulnerability-reporting" --jq '.enabled' 2>/dev/null || true)" == true ]] || report "private vulnerability reporting is off"
    id=$(ruleset_id)
    if [[ -z "$id" ]]; then
      report "ruleset '$name' is missing"
    else
      live=$(g api "repos/$repo/rulesets/$id")
      same=$(jq -n --argjson want "$(tr -d '\r' < "$ruleset_file")" --argjson live "$live" "$covers_filter" | tr -d '\r')
      [[ "$same" == true ]] || report "ruleset '$name' differs from .github/rulesets/main.json"
    fi
  else
    echo "note: $repo is private; GitHub Free offers no ruleset or secret scanning there."
  fi
  if (( drift )); then exit 1; fi
  echo "in sync: $repo matches the template baseline"
  exit 0
fi

echo "Plan for $repo ($visibility):"
echo "  - Dependabot alerts and security updates on"
echo "  - merge commits only; delete branches on merge"
if $public; then
  echo "  - secret scanning, push protection, private vulnerability reporting on"
  echo "  - ruleset '$name' from .github/rulesets/main.json"
else
  echo "  - skipped: secret scanning, push protection, private vulnerability reporting and the ruleset (not available on private repositories on GitHub Free)"
fi
read -r -p "Apply these changes to $repo? [y/N] " answer || answer=""
if [[ ! "$answer" =~ ^[Yy]$ ]]; then echo "aborted; nothing changed"; exit 1; fi

failures=()
step() {
  local desc="$1"
  shift
  if "$@" >/dev/null; then echo "ok   $desc"; else echo "FAIL $desc"; failures+=("$desc"); fi
}
step "Dependabot alerts" gh api -X PUT "repos/$repo/vulnerability-alerts"
step "Dependabot security updates" gh api -X PUT "repos/$repo/automated-security-fixes"
step "merge settings" gh api -X PATCH "repos/$repo" -F allow_merge_commit=true -F allow_squash_merge=false -F allow_rebase_merge=false -F delete_branch_on_merge=true
if $public; then
  step "secret scanning and push protection" gh api -X PATCH "repos/$repo" -f 'security_and_analysis[secret_scanning][status]=enabled' -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
  step "private vulnerability reporting" gh api -X PUT "repos/$repo/private-vulnerability-reporting"
  id=$(ruleset_id || true)
  if [[ -n "$id" ]]; then
    step "ruleset '$name' (update)" gh api -X PUT "repos/$repo/rulesets/$id" --input "$ruleset_file"
  else
    step "ruleset '$name' (create)" gh api -X POST "repos/$repo/rulesets" --input "$ruleset_file"
  fi
else
  echo "skipped: secret scanning, push protection, private vulnerability reporting and the ruleset are not available on private repositories on GitHub Free"
fi
echo
echo "Last step is yours: give only the GitHub Apps this repository needs access to it"
echo "(Claude for cloud sessions; CodeRabbit on public repositories only): https://github.com/settings/installations"
if (( ${#failures[@]} )); then echo "${#failures[@]} step(s) failed: ${failures[*]}"; exit 1; fi
echo "done: $repo matches the template baseline"
