import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseList, isSecretPath, isEditOnly, loadDefaultList } from "./paths.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.join(os.tmpdir(), "repo");
const home = path.join(os.tmpdir(), "home");

test("every fixture gets its expected verdict", () => {
  const list = loadDefaultList();
  const lines = readFileSync(path.join(here, "secret-paths.fixtures.txt"), "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const [verdict, p] = line.split(/\s+/);
    const input = p.startsWith("~/") ? path.join(home, p.slice(2)) : p;
    assert.equal(isSecretPath(input, list, { cwd, home }), verdict === "secret", line);
  }
});
test("a leading ~ with either slash means the home directory", () => {
  const list = loadDefaultList();
  assert.equal(isSecretPath("~/.ssh/config", list, { cwd, home }), true);
  assert.equal(isSecretPath("~\\.ssh\\config", list, { cwd, home }), true);
});
test("the last matching line wins", () => {
  const list = parseList("*.txt\n!keep.txt\n");
  assert.equal(isSecretPath("a.txt", list, { cwd, home }), true);
  assert.equal(isSecretPath("keep.txt", list, { cwd, home }), false);
});
test("a pattern with a slash matches the end of the path at a directory boundary", () => {
  const list = parseList("config/*.json\n**/vault/**\n");
  assert.equal(isSecretPath("config/a.json", list, { cwd, home }), true);
  assert.equal(isSecretPath("pkg/config/a.json", list, { cwd, home }), true);
  assert.equal(isSecretPath("config/deep/a.json", list, { cwd, home }), false);
  assert.equal(isSecretPath("myconfig/a.json", list, { cwd, home }), false);
  assert.equal(isSecretPath("a/vault/b/c.txt", list, { cwd, home }), true);
});
test("[settings] accepts plain file names only", () => {
  assert.throws(() => parseList("[settings]\n.env.*\n"), /plain file names/);
  assert.deepEqual(parseList("[settings]\n.env\n[patterns]\n*.pem\n").settingsNames, [".env"]);
});
test("[edit-only] names are readable but not editable", () => {
  const list = parseList("[edit-only]\npnpm-lock.yaml\n");
  assert.deepEqual(list.editOnlyNames, ["pnpm-lock.yaml"]);
  assert.equal(isSecretPath("pnpm-lock.yaml", list, { cwd, home }), false);
  assert.equal(isEditOnly("packages/api/pnpm-lock.yaml", list), true);
  assert.equal(isEditOnly("package.json", list), false);
  assert.throws(() => parseList("[edit-only]\n*.lock\n"), /plain file names/);
});
function staged(input) {
  return spawnSync(process.execPath, [path.join(here, "staged-secrets.mjs")], { input, encoding: "utf8" });
}
test("staged-secrets prints the secret paths and exits 1", () => {
  const r = staged("README.md\n.env\napp/.env.example\n");
  assert.equal(r.status, 1);
  assert.deepEqual(r.stdout.trim().split(/\r?\n/), [".env"]);
});
test("staged-secrets exits 0 when nothing is secret", () => {
  assert.equal(staged("README.md\n").status, 0);
  assert.equal(staged("").status, 0);
});
