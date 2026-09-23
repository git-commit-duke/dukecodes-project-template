import { test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { isSecretCommand } from "./secret-command.mjs";
import { isSecretPath, loadDefaultList } from "./paths.mjs";

const list = loadDefaultList();
const cwd = path.join(os.tmpdir(), "repo");
const isSecret = (w) => isSecretPath(w, list, { cwd });
const blocked = (tool, cmd) => assert.equal(typeof isSecretCommand(tool, cmd, isSecret), "string", `${tool}: ${cmd}`);
const allowed = (tool, cmd) => assert.equal(isSecretCommand(tool, cmd, isSecret), null, `${tool}: ${cmd}`);

test("Bash commands that read secret files are blocked", () => {
  for (const c of ["cat .env", "cat ./app/.env.local", "grep KEY .env", "less .envrc", "head -n1 'config/.env.production'",
    "git diff --no-index /dev/null .env", "cat ~/.ssh/id_ed25519", "cp .env backup.txt", "echo ok && cat .env", "wc -l <.env"]) blocked("Bash", c);
});
test("PowerShell commands that read secret files are blocked", () => {
  for (const c of ["Get-Content .env", "type .env", "gc .\\app\\.env.local", "Select-String KEY .env", "Get-Content ~\\.ssh\\config"]) blocked("PowerShell", c);
});
test("ordinary commands pass", () => {
  for (const c of ["cat .env.example", "pnpm test", "echo src/environment.ts", "git status", "ls -la", "cat README.md"]) allowed("Bash", c);
  for (const c of ["Get-Content .env.example", "Get-ChildItem"]) allowed("PowerShell", c);
});
