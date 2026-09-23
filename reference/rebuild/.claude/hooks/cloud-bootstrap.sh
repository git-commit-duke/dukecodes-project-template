#!/usr/bin/env bash
# Cloud-session bootstrap, run by session-start.sh only when CLAUDE_CODE_REMOTE=true.
# Installs gitleaks for the commit gate, then the Node dependencies.
# gitleaks comes from the Go module proxy, not from a GitHub release: the cloud's GitHub proxy answers
# release-asset requests for repositories that are not attached to the session with 403 (FACT, the
# cloud-environments docs). proxy.golang.org and sum.golang.org are on the Trusted list, and Go verifies
# every module download against the checksum database, so the download is still integrity-checked.
# Each step reports its own outcome, so one failure is never blamed on the other.
# Tool seams for tests: GO_BIN, GITLEAKS_BIN, PNPM_BIN.
set -uo pipefail
GITLEAKS_MODULE=github.com/zricethezav/gitleaks/v8@v8.30.1
go_bin="${GO_BIN:-go}"
pnpm_bin="${PNPM_BIN:-pnpm}"
status=0
have_gitleaks() {
  if [[ -n "${GITLEAKS_BIN:-}" ]]; then [[ -x "$GITLEAKS_BIN" ]]; return; fi
  command -v gitleaks >/dev/null 2>&1 || [[ -x "$HOME/.local/bin/gitleaks" ]]
}
if have_gitleaks; then
  echo "gitleaks: already installed"
elif ! command -v "$go_bin" >/dev/null 2>&1; then
  echo "WARN: gitleaks is missing and go was not found; the commit gate's secret scan will SKIP here."
  status=1
elif GOBIN="$HOME/.local/bin" "$go_bin" install "$GITLEAKS_MODULE"; then
  echo "gitleaks installed from $GITLEAKS_MODULE (checksum database verified)"
else
  echo "WARN: installing gitleaks from $GITLEAKS_MODULE failed; the commit gate's secret scan will SKIP here."
  status=1
fi
if [[ -f package.json ]]; then
  corepack enable >/dev/null 2>&1 || true
  if "$pnpm_bin" install --frozen-lockfile; then
    echo "dependencies installed"
  else
    echo "WARN: pnpm install failed; this repository's own tests may not run here."
    status=1
  fi
fi
exit "$status"
