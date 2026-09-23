// Fails on relative markdown links whose target is not a tracked file or directory.
// Skips URLs, mailto, in-page anchors, <placeholders>, and docs/adr/ (accepted ADRs are never edited).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function findBrokenLinks(files, tracked) {
  const dirs = new Set();
  for (const f of tracked) for (let d = path.posix.dirname(f); d !== "."; d = path.posix.dirname(d)) dirs.add(d);
  const broken = [];
  for (const [file, text] of files) {
    for (const [, raw] of text.matchAll(LINK)) {
      if (/^(https?:|mailto:|#)/.test(raw) || /[<>]/.test(raw)) continue;
      const target = decodeURI(raw.split("#")[0].split("?")[0]);
      if (!target) continue;
      const resolved = target.startsWith("/") ? target.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
      const clean = resolved.replace(/\/$/, "");
      if (!tracked.has(clean) && !dirs.has(clean)) broken.push({ file, target: raw });
    }
  }
  return broken;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).replace(/\r/g, "").split("\n").filter(Boolean);
  const md = tracked.filter((f) => f.endsWith(".md") && !f.startsWith("docs/adr/"));
  const broken = findBrokenLinks(new Map(md.map((f) => [f, readFileSync(f, "utf8")])), new Set(tracked));
  for (const b of broken) console.error(`${b.file}: broken link ${b.target}`);
  if (broken.length === 0) console.log(`doc links: ok (${md.length} files)`);
  process.exitCode = broken.length ? 1 : 0;
}
