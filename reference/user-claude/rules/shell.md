---
paths:
  - "**/*.sh"
  - "**/.githooks/*"
---

# Shell scripts

- They run on Git Bash (Windows) and on Linux (CI, cloud sessions). Start with `#!/usr/bin/env bash` and `set -euo pipefail`; a hook that must never abort a session uses `set -u`. LF line endings.
- Quote every expansion. Prefer `[[ ]]`. No `eval`. Under `pipefail`, never end a pipe in `grep -q`; send `grep` to `/dev/null` instead.
- Never echo, log or write a secret. Values come from device-flow CLIs or the platform's secret store.
- Name a missing tool out loud instead of skipping silently, and give each external tool a `*_BIN` override so tests can simulate its absence.
- Read file lists from git NUL-separated (`-z`); git quotes paths with non-ASCII bytes, and a quoted name defeats path matching.
- After every edit, run `bash -n` and `shellcheck -S style` on the file and report the output.
- A script that changes system state prints what it is about to do and confirms first, unless it is a hook.
