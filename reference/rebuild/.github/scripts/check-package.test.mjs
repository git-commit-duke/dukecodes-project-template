import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-package.mjs");
function run(pkg) {
  const dir = mkdtempSync(path.join(tmpdir(), "pkg-"));
  writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg));
  return spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8" });
}

test("accepts a pinned pnpm with a test script", () => {
  const r = run({ packageManager: "pnpm@10.0.0", scripts: { test: "vitest run" } });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /contract: ok/);
});
test("rejects a missing test script", () => {
  const r = run({ packageManager: "pnpm@10.0.0", scripts: {} });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /a "test" script/);
});
test("rejects a packageManager that is not pnpm", () => {
  const r = run({ packageManager: "npm@11.0.0", scripts: { test: "x" } });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /packageManager/);
});
