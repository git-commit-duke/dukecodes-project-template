// Lists or writes the fenced code blocks of a markdown file.
//   node extract-blocks.mjs <plan.md>                        list every block with its index and first line
//   node extract-blocks.mjs <plan.md> <outdir> sig::path ... write each matched block to <outdir>/<path>
// A signature is a substring of the block's text (usually its first line). It must match exactly one
// block, so the mapping survives edits that move blocks around; an ambiguous or missing signature is an
// error rather than a silently wrong file.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const [plan, outdir, ...pairs] = process.argv.slice(2);
const lines = readFileSync(plan, "utf8").split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i++) {
  const open = lines[i].match(/^(`{3,})(\S*)\s*$/);
  if (!open) continue;
  const fence = open[1];
  const body = [];
  let j = i + 1;
  for (; j < lines.length; j++) {
    const close = lines[j].match(/^(`{3,})\s*$/);
    if (close && close[1].length >= fence.length) break;
    body.push(lines[j]);
  }
  blocks.push({ line: i + 1, lang: open[2], body: body.join("\n") + "\n" });
  i = j;
}

if (!outdir) {
  blocks.forEach((b, n) => console.log(`${n}\tL${b.line}\t${b.lang}\t${b.body.split("\n")[0].slice(0, 90)}`));
  process.exit(0);
}

let failed = 0;
for (const pair of pairs) {
  const idx = pair.indexOf("::");
  const sig = pair.slice(0, idx);
  const rel = pair.slice(idx + 2);
  const hits = blocks.filter((b) => b.body.includes(sig));
  if (hits.length !== 1) {
    console.error(`FAIL ${rel}: signature ${JSON.stringify(sig)} matched ${hits.length} blocks`);
    failed = 1;
    continue;
  }
  const target = path.join(outdir, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, hits[0].body);
}
process.exit(failed);
