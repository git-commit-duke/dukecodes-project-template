#!/usr/bin/env bash
# Exercises .githooks/pre-commit in a throwaway repository. Run: bash .githooks/pre-commit.test.sh
set -euo pipefail
hook="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/pre-commit"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
repo="$tmp/repo"
git init -q "$repo"
cd "$repo"
git config user.email test@example.invalid
git config user.name test
git config commit.gpgsign false
fails=0

# expect <exit-code> <description> [VAR=value ...]: runs the hook against what is staged now.
expect() {
  local want="$1" desc="$2" got=0
  shift 2
  env "$@" bash "$hook" >"$tmp/out" 2>&1 || got=$?
  if [[ "$got" == "$want" ]]; then
    echo "ok   $desc"
  else
    echo "FAIL $desc: want exit $want, got $got"
    sed 's/^/     /' "$tmp/out"
    fails=$((fails + 1))
  fi
}
# saw <text>: the last hook run printed <text>.
saw() { grep -F -- "$1" "$tmp/out" >/dev/null || { echo "FAIL expected output: $1"; fails=$((fails + 1)); }; }
unstage_all() { git read-tree --empty; }
# stage <path> [content]: writes the file and force-adds it (the .gitignore would hide most of these).
stage() { mkdir -p "$(dirname "$1")"; printf '%s\n' "${2:-x}" > "$1"; git add -f "$1"; }
no_tools=(GITLEAKS_BIN=/nonexistent/gitleaks HADOLINT_BIN=/nonexistent/hadolint PNPM_BIN=/nonexistent/pnpm)
# The shared matcher, copied in the way the repository holds it.
src_hooks="$(dirname "$hook")/../.claude/hooks"
mkdir -p .claude/hooks
cp "$src_hooks/paths.mjs" "$src_hooks/staged-secrets.mjs" "$src_hooks/secret-paths.txt" .claude/hooks/

expect 0 "nothing staged" "${no_tools[@]}"
stage plain.txt hello
expect 0 "a plain file" "${no_tools[@]}"
saw "SKIP gitleaks"
stage todo.txt "x = 1 # TODO later"
expect 0 "a new TODO only warns" "${no_tools[@]}"
saw "new TODO/FIXME"
for f in .env.example app/.env.sample .env.template; do
  unstage_all; stage "$f" "A="
  expect 0 "$f is allowed" "${no_tools[@]}"
done
for f in .env app/.env.local .env-prod .envrc .ENV.Production "café/.env"; do
  unstage_all; stage "$f" "A=1"
  expect 1 "$f is refused" "${no_tools[@]}"
done

unstage_all; rm -f .env; stage .env.example "A="
git commit -q -m base
git mv .env.example .env
expect 1 "renaming .env.example to .env is refused" "${no_tools[@]}"
git reset -q; git checkout -q -- .env.example; rm -f .env

unstage_all; stage Dockerfile "FROM alpine"
expect 0 "a Dockerfile without hadolint is skipped, visibly" "${no_tools[@]}"
saw "SKIP hadolint"

for f in certs/server.pem config/tls.KEY id_rsa; do
  unstage_all; stage "$f"
  expect 1 "$f is refused by the shared list" "${no_tools[@]}"
done
unstage_all; stage .env "A=1"
mv .claude/hooks/staged-secrets.mjs "$tmp/staged-secrets.mjs"
expect 1 "without the matcher, the built-in check still refuses .env" "${no_tools[@]}"
saw "minimal built-in env-file check"
mv "$tmp/staged-secrets.mjs" .claude/hooks/staged-secrets.mjs
if command -v gitleaks >/dev/null 2>&1; then
  unstage_all
  # Split so this file never holds a token-shaped string. It must look random: gitleaks ignores sequential fakes like abc…xyz.
  suffix="R8x2Kq9Lm4Tz7Wv1""Nc5Bp3Hs6Jd0Fg2Yk8Qe"
  stage leak.txt "token = \"ghp_${suffix}\""
  expect 1 "gitleaks refuses a staged token" HADOLINT_BIN=/nonexistent/hadolint PNPM_BIN=/nonexistent/pnpm
else
  echo "SKIP gitleaks-present case (gitleaks not installed here)"
fi

# Through a real git commit, as a session would run it.
unstage_all; stage .env "A=1"
mkdir -p "$tmp/hooks"; cp "$hook" "$tmp/hooks/pre-commit"; chmod +x "$tmp/hooks/pre-commit"
git config core.hooksPath "$tmp/hooks"
before=$(git rev-parse HEAD)
if GITLEAKS_BIN=/nonexistent/gitleaks git commit -q -m "should be refused" >/dev/null 2>&1; then
  echo "FAIL git commit let .env through"; fails=$((fails + 1))
else
  echo "ok   git commit runs the hook and refuses .env"
fi
[[ "$(git rev-parse HEAD)" == "$before" ]] || { echo "FAIL HEAD moved"; fails=$((fails + 1)); }

if (( fails == 0 )); then echo "pre-commit tests: all passed"; else echo "pre-commit tests: $fails failed"; exit 1; fi
