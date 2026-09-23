// The AI-workspace lint: deterministic checks that keep the agent gates, the CI wiring and the agent
// definitions honest. CI runs it in the universal job; run it locally with
//   node .github/scripts/check-workspace.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseList } from "../../.claude/hooks/paths.mjs";
import { GUARDED_TOOLS } from "../../.claude/hooks/policy.mjs";

export function frontmatter(text) {
  const m = text.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

const rulesOf = (settings) => ["allow", "ask", "deny"].map((k) => [k, settings.permissions?.[k] ?? []]);

export function settingsCoverage(settings, list) {
  const deny = new Set(settings.permissions?.deny ?? []);
  return [
    ...list.settingsNames.filter((n) => !deny.has(`Read(//**/${n})`)).map((n) => `settings.json lacks deny "Read(//**/${n})"`),
    ...list.editOnlyNames.filter((n) => !deny.has(`Edit(//**/${n})`)).map((n) => `settings.json lacks deny "Edit(//**/${n})"`),
  ];
}

// The hook only runs for tools named in its matcher, so a tool the policy inspects but the matcher omits
// is unguarded, and a tool in the matcher the policy ignores is a silent no-op.
export function matcherCoversTools(settings, guardedTools) {
  const entry = (settings.hooks?.PreToolUse ?? []).find((e) => /guard\.mjs/.test(JSON.stringify(e.hooks ?? [])));
  if (!entry) return ['settings.json has no PreToolUse hook running guard.mjs'];
  const inMatcher = new Set(entry.matcher.split("|"));
  const problems = guardedTools.filter((t) => !inMatcher.has(t)).map((t) => `the guard inspects ${t} but the hook matcher omits it`);
  return problems.concat([...inMatcher].filter((t) => !guardedTools.includes(t)).map((t) => `the hook matcher has ${t}, which the guard ignores`));
}

export function shellTwins(settings) {
  const problems = [];
  for (const [kind, rules] of rulesOf(settings)) {
    const set = new Set(rules);
    for (const r of rules) {
      const m = r.match(/^Bash\((.*)\)$/);
      if (m && !set.has(`PowerShell(${m[1]})`)) problems.push(`${kind}: "${r}" has no PowerShell(${m[1]}) twin`);
    }
  }
  return problems;
}

export function noAlternation(settings) {
  return rulesOf(settings).flatMap(([kind, rules]) => rules.filter((r) => r.includes("|")).map((r) => `${kind}: "${r}" uses | (write one rule per command)`));
}

export function jobIds(ciYaml) {
  const lines = ciYaml.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  if (start < 0) return [];
  const ids = [];
  for (const l of lines.slice(start + 1)) {
    if (/^\S/.test(l)) break;
    const m = l.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (m) ids.push(m[1]);
  }
  return ids;
}

export function rulesetContexts(ruleset, ciYaml) {
  const ids = new Set(jobIds(ciYaml));
  return (ruleset.rules ?? [])
    .filter((r) => r.type === "required_status_checks")
    .flatMap((r) => r.parameters?.required_status_checks ?? [])
    .map((c) => c.context)
    .filter((c) => !ids.has(c))
    .map((c) => `ruleset requires "${c}" but ci.yml has no such job`);
}

export function testsWired(trackedTests, runner) {
  return trackedTests.filter((t) => !runner.includes(t)).map((t) => `${t} is not run by scripts/test.sh`);
}

// A workflow that names an action by tag or branch runs whatever that ref points at later, and on a
// pull request the branch is editable by the change under review.
export function actionsPinned(ciYaml) {
  return ciYaml
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l, i) => [i + 1, l.match(/^\s*(?:-\s*)?uses:\s*(\S+)/)])
    .filter(([, m]) => m && !/@[0-9a-f]{40}$/.test(m[1]))
    .map(([n, m]) => `ci.yml:${n} uses ${m[1]}; pin it to a 40-character commit SHA`);
}

// Every job the ruleset does not require must still be aggregated, or a red job cannot block a merge.
export function allGreenCovers(ciYaml, exempt = ["all-green", "dependency-review"]) {
  const ids = jobIds(ciYaml).filter((j) => !exempt.includes(j));
  const needs = ciYaml.match(/needs:\s*\[([^\]]*)\]/)?.[1] ?? "";
  const listed = new Set(needs.split(",").map((s) => s.trim()).filter(Boolean));
  return ids.filter((j) => !listed.has(j)).map((j) => `all-green does not need "${j}", so a failure there cannot block a merge`);
}

export function hooksExecutable(lines) {
  return lines
    .map((l) => l.split(/\s+/))
    .filter(([mode, , , file]) => file && !path.posix.basename(file).includes(".") && mode !== "100755")
    .map(([mode, , , file]) => `${file} is not executable in git (mode ${mode})`);
}

export function claudeMdBudget(text) {
  const n = text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n").length;
  return n >= 150 ? [`CLAUDE.md has ${n} lines (keep it under 150)`] : [];
}

const READ_TOOLS = new Set(["Read", "Grep", "Glob", "WebFetch", "WebSearch"]);
export function agentTools(agents) {
  const problems = [];
  for (const { file, fm } of agents) {
    if (!fm?.tools) { problems.push(`${file}: declare tools explicitly (omitting them grants every tool)`); continue; }
    if (/read-only/i.test(fm.description ?? "")) {
      const extra = fm.tools.split(",").map((t) => t.trim()).filter((t) => t && !READ_TOOLS.has(t));
      if (extra.length) problems.push(`${file}: a read-only agent has ${extra.join(", ")}`);
    }
  }
  return problems;
}

export function userOnlySkills(skills) {
  return skills
    .filter(({ fm }) => /^user-only/i.test(fm?.description ?? "") && fm["disable-model-invocation"] !== "true")
    .map(({ file }) => `${file}: a User-only skill must set disable-model-invocation: true`);
}

export function run(root) {
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).replace(/\r/g, "");
  const has = (p) => existsSync(path.join(root, p));
  const read = (p) => readFileSync(path.join(root, p), "utf8");
  const tracked = git("ls-files").split("\n").filter(Boolean);
  const ci = read(".github/workflows/ci.yml");
  const docs = (prefix, suffix) => tracked.filter((f) => f.startsWith(prefix) && f.endsWith(suffix)).map((file) => ({ file, fm: frontmatter(read(file)) }));
  const checks = {};
  if (has(".claude/settings.json")) {
    const settings = JSON.parse(read(".claude/settings.json"));
    checks["settings deny the listed secret names"] = has(".claude/hooks/secret-paths.txt")
      ? settingsCoverage(settings, parseList(read(".claude/hooks/secret-paths.txt")))
      : [".claude/hooks/secret-paths.txt is missing"];
    checks["every Bash rule has a PowerShell twin"] = shellTwins(settings);
    checks["one rule per command"] = noAlternation(settings);
    checks["the hook matcher matches the guarded tools"] = matcherCoversTools(settings, GUARDED_TOOLS);
  }
  checks["ruleset checks are real jobs"] = has(".github/rulesets/main.json") ? rulesetContexts(JSON.parse(read(".github/rulesets/main.json")), ci) : [];
  checks["every test runs through the runner"] = has("scripts/test.sh")
    ? testsWired(tracked.filter((f) => /\.test\.(mjs|sh)$/.test(f)), read("scripts/test.sh"))
    : ["scripts/test.sh is missing"];
  checks["actions are pinned to commit SHAs"] = actionsPinned(ci);
  checks["all-green covers every gating job"] = allGreenCovers(ci);
  checks["git hooks are executable"] = hooksExecutable(git("ls-files", "-s", ".githooks").split("\n").filter(Boolean));
  checks["CLAUDE.md within budget"] = has("CLAUDE.md") ? claudeMdBudget(read("CLAUDE.md")) : [];
  checks["agents declare their tools"] = agentTools(docs(".claude/agents/", ".md"));
  checks["User-only skills stay user-only"] = userOnlySkills(docs(".claude/skills/", "SKILL.md"));
  return checks;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let bad = 0;
  for (const [name, problems] of Object.entries(run(process.cwd()))) {
    if (problems.length === 0) { console.log(`ok   ${name}`); continue; }
    bad += problems.length;
    console.error(`FAIL ${name}`);
    for (const p of problems) console.error(`  - ${p}`);
  }
  process.exitCode = bad ? 1 : 0;
}
