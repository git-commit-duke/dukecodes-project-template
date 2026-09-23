// Pre-commit entry: reads staged paths (one per line) on stdin and prints the secret ones.
// Exit 0: none; 1: some, printed; 2: the check itself failed. The hook refuses the commit on any non-zero exit.
// No exports and no main-module check: an entry that can silently do nothing would fail open.
import { readFileSync } from "node:fs";
import { isSecretPath, loadDefaultList } from "./paths.mjs";

try {
  const list = loadDefaultList();
  // The hook sends NUL-separated paths; newlines are accepted so the entry stays usable by hand.
  const hits = readFileSync(0, "utf8").split(/\0|\r?\n/).filter(Boolean).filter((p) => isSecretPath(p, list));
  for (const h of hits) console.log(h);
  process.exitCode = hits.length ? 1 : 0;
} catch (err) {
  console.error(`staged-secrets.mjs: ${err.message}`);
  process.exitCode = 2;
}
