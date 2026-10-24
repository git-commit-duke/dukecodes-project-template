#!/usr/bin/env bash
# Rename the template package and metadata for a new project. Run once.
set -euo pipefail
name="${1:-}"
if [[ ! "$name" =~ ^[a-z][a-z0-9-]{1,48}$ ]]; then
  echo "usage: make init NAME=my-project  (lowercase, digits, dashes)" >&2
  exit 1
fi
[[ -d src/app ]] || { echo "init already ran (src/app missing)" >&2; exit 1; }
pkg="${name//-/_}"
git mv src/app "src/$pkg"
sed -i.bak "s/^name = \"app\"/name = \"$name\"/" pyproject.toml && rm pyproject.toml.bak
sed -i.bak "s/from app import/from $pkg import/" tests/test_smoke.py && rm tests/test_smoke.py.bak
sed -i.bak "s/^# <project name>/# $name/" CLAUDE.md && rm CLAUDE.md.bak
cat > README.md <<MD
# $name

<What this is.>

Setup: \`make setup\` · Checks: \`make check\`
MD
uv lock && uv sync -q
echo "Renamed to $name. Next: edit CLAUDE.md line 3 and pyproject authors, then make setup."
