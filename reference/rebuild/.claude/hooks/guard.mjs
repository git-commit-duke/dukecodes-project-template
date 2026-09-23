// PreToolUse entry. Registered as: node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard.mjs" || exit 2
// Exit 2 blocks the call and shows stderr to Claude. Every failure also blocks: errors here through the
// catch below; import errors and a missing node through '|| exit 2' (Claude Code runs the call on any other code).
// No exports and no main-module check: an entry that can silently do nothing would fail open.
import { readFileSync } from "node:fs";
import { loadDefaultList } from "./paths.mjs";
import { decide } from "./policy.mjs";
import { isSecretCommand } from "./secret-command.mjs";

try {
  const reason = decide(JSON.parse(readFileSync(0, "utf8")), { list: loadDefaultList(), isSecretCommand });
  if (reason) {
    console.error(`Blocked by .claude/hooks/guard.mjs: ${reason}`);
    process.exitCode = 2;
  }
} catch (err) {
  console.error(`Blocked by .claude/hooks/guard.mjs: the guard failed (${err.message}), so it failed closed.`);
  process.exitCode = 2;
}
