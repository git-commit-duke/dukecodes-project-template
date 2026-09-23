import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findBrokenLinks } from "./check-doc-refs.mjs";

const tracked = new Set(["README.md", "docs/adr/0001-security-baseline.md", "docs/agents/plugins.md", "scripts/protect-repo.sh"]);
test("relative links to tracked files and directories pass", () => {
  const files = new Map([["README.md", "[a](docs/adr/0001-security-baseline.md) [b](scripts/protect-repo.sh#L3) [c](docs/agents/) [d](./docs/agents/plugins.md)"]]);
  assert.deepEqual(findBrokenLinks(files, tracked), []);
});
test("a link to a missing file fails", () => {
  const files = new Map([["docs/agents/plugins.md", "[x](../adr/0009-missing.md)"]]);
  assert.deepEqual(findBrokenLinks(files, tracked), [{ file: "docs/agents/plugins.md", target: "../adr/0009-missing.md" }]);
});
test("URLs, anchors, mailto and <placeholders> are skipped", () => {
  const files = new Map([["README.md", "[u](https://x.test) [h](#top) [m](mailto:a@b.c) [p](<name>/x.md)"]]);
  assert.deepEqual(findBrokenLinks(files, tracked), []);
});
test("runs as a CLI from the repository root", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const r = spawnSync(process.execPath, [path.join(root, ".github/scripts/check-doc-refs.mjs")], { cwd: root, encoding: "utf8" });
  assert.match(r.stdout + r.stderr, /doc links: ok|broken link/);
});
