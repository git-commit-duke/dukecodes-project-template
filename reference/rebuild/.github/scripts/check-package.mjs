// CI contract for repositories with a package.json: pnpm is pinned, and tests exist.
// A repository that looks green because it has no tests is the failure this prevents.
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const missing = [];
if (!pkg.packageManager?.startsWith("pnpm@")) missing.push('"packageManager": "pnpm@<version>"');
if (!pkg.scripts?.test) missing.push('a "test" script');

if (missing.length > 0) {
  console.error(`package.json needs ${missing.join(" and ")}. See README, "CI contract".`);
  process.exitCode = 1;
} else {
  console.log("package.json contract: ok");
}
