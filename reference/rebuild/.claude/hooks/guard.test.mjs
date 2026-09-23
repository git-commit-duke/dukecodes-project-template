import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decide } from "./policy.mjs";
import { loadDefaultList } from "./paths.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const list = loadDefaultList();
const cwd = path.join(os.tmpdir(), "repo");
const never = () => null;
const ev = (tool_name, tool_input, extra = {}) => ({ tool_name, tool_input, cwd, ...extra });
const decideWith = (event, isSecretCommand = never) => decide(event, { list, isSecretCommand });

test("path tools are blocked on secret files", () => {
  for (const [tool, input] of [
    ["Read", { file_path: ".env" }], ["Edit", { file_path: "app/.env.local" }], ["Write", { file_path: ".envrc" }],
    ["MultiEdit", { file_path: "certs/a.pem" }], ["NotebookEdit", { notebook_path: ".env.staging" }],
    ["Grep", { pattern: "K", path: ".env" }], ["Glob", { pattern: "*", path: "~/.ssh" }],
  ]) assert.match(decideWith(ev(tool, input)) ?? "", /secret file/, tool);
});
test("a search tool cannot reach a secret file through its glob", () => {
  assert.match(decideWith(ev("Grep", { pattern: "KEY", glob: ".env" })) ?? "", /would search \.env/);
  assert.match(decideWith(ev("Glob", { pattern: "**/*.pem" })) ?? "", /would search/);
  assert.equal(decideWith(ev("Grep", { pattern: "KEY", glob: "*.ts" })), null);
});
test("path tools may use ordinary files and the env templates", () => {
  assert.equal(decideWith(ev("Read", { file_path: "README.md" })), null);
  assert.equal(decideWith(ev("Read", { file_path: ".env.example" })), null);
  assert.equal(decideWith(ev("Read", { file_path: "~/.claude/settings.json" })), null);
});
test("relative paths resolve against the event's cwd, not the hook's", () => {
  const project = path.join(os.homedir(), "some-project");
  assert.match(decideWith(ev("Read", { file_path: "../.ssh/config" }, { cwd: project })) ?? "", /secret file/);
  const worktree = path.join(project, ".claude", "worktrees", "task");
  assert.match(decideWith(ev("Read", { file_path: "../../../../.ssh/config" }, { cwd: worktree, agent_id: "a1" })) ?? "", /secret file/);
});
test("lockfiles are readable but not editable", () => {
  assert.equal(decideWith(ev("Read", { file_path: "pnpm-lock.yaml" })), null);
  assert.match(decideWith(ev("Edit", { file_path: "pnpm-lock.yaml" })) ?? "", /lockfile/);
});
test("shell tools go to isSecretCommand with a matcher bound to the event's cwd", () => {
  let seen;
  const spy = (tool, cmd, isSecret) => { seen = [tool, cmd, isSecret(".env"), isSecret("README.md")]; return "nope"; };
  assert.equal(decideWith(ev("PowerShell", { command: "Get-Content .env" }), spy), "nope");
  assert.deepEqual(seen, ["PowerShell", "Get-Content .env", true, false]);
});
test("other tools pass", () => {
  assert.equal(decideWith(ev("WebFetch", { url: "https://example.com" })), null);
});
function hook(input) {
  return spawnSync(process.execPath, [path.join(here, "guard.mjs")], { input, encoding: "utf8" });
}
test("the hook exits 2 with its reason on a secret read", () => {
  const r = hook(JSON.stringify(ev("Read", { file_path: ".env" })));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Blocked by \.claude\/hooks\/guard\.mjs/);
});
test("the hook exits 0 on an ordinary read", () => {
  assert.equal(hook(JSON.stringify(ev("Read", { file_path: "README.md" }))).status, 0);
});
test("the hook fails closed on empty, unparseable or impossible input", () => {
  assert.equal(hook("").status, 2);
  assert.equal(hook("{not json").status, 2);
  assert.equal(hook("null").status, 2);
});
