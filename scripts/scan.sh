#!/usr/bin/env bash
# Local mirror of the CI scan job. Fails closed: a scanner that can't run is a failure.
set -euo pipefail

echo "== semgrep (SAST)"
rc=0
out=$(uvx semgrep@1.182.1 scan --config p/default --metrics off --json --time --quiet .) || rc=$?
rules=$(printf '%s' "$out" | jq -e '.time.rules | length' 2>/dev/null) || rules=0
findings=$(printf '%s' "$out" | jq -e '.results | length' 2>/dev/null) || findings=-1
if ! [[ "$rules" =~ ^[0-9]+$ ]] || (( rules == 0 || findings < 0 )); then
  echo "FAIL: semgrep loaded no rules (exit $rc). Allow semgrep.dev in the network policy." >&2
  exit 1
fi
echo "semgrep: $rules rules, $findings finding(s)"
if (( findings > 0 )); then
  printf '%s' "$out" | jq -r '.results[] | "\(.path):\(.start.line) \(.check_id)"'
  exit 1
fi

echo "== trivy (deps, secrets, IaC misconfig)"
if ! command -v trivy >/dev/null; then
  echo "FAIL: trivy not installed. Install a version outside 0.69.4-0.69.6 (malicious builds)." >&2
  exit 1
fi
trivy fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --exit-code 1 .
