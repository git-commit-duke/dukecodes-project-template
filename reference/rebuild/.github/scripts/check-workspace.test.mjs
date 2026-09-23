import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseList } from "../../.claude/hooks/paths.mjs";
import { settingsCoverage, shellTwins, noAlternation, jobIds, rulesetContexts, testsWired, hooksExecutable, claudeMdBudget, agentTools, userOnlySkills, frontmatter, matcherCoversTools, actionsPinned, allGreenCovers } from "./check-workspace.mjs";

const ci = "name: ci\njobs:\n  # a comment\n  universal:\n    runs-on: x\n  all-green:\n    needs: [universal]\n";
const guardHook = (matcher) => ({ hooks: { PreToolUse: [{ matcher, hooks: [{ type: "command", command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard.mjs" || exit 2' }] }] } });

test("settings must deny every [settings] name", () => {
  const list = parseList("[settings]\n.env\n.envrc\n");
  assert.deepEqual(settingsCoverage({ permissions: { deny: ["Read(//**/.env)"] } }, list), ['settings.json lacks deny "Read(//**/.envrc)"']);
});
test("every Bash rule needs a PowerShell twin", () => {
  const problems = shellTwins({ permissions: { deny: ["Bash(git reset --hard*)", "PowerShell(git reset --hard*)", "Bash(rm -rf *)"] } });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /rm -rf/);
});
test("rules may not use | alternation", () => {
  assert.equal(noAlternation({ permissions: { ask: ["Bash(tailscale set|up *)"] } }).length, 1);
});
test("job ids are read from the jobs block", () => {
  assert.deepEqual(jobIds(ci), ["universal", "all-green"]);
});
test("ruleset contexts must be real jobs", () => {
  const ruleset = { rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "all-green" }, { context: "gone" }] } }] };
  assert.deepEqual(rulesetContexts(ruleset, ci), ['ruleset requires "gone" but ci.yml has no such job']);
});
test("every tracked test file is named in the runner", () => {
  assert.deepEqual(testsWired(["a.test.sh", "b.test.mjs"], "run bash a.test.sh"), ["b.test.mjs is not run by scripts/test.sh"]);
});
test("git hooks without an extension must be 100755", () => {
  const lines = ["100644 abc 0\t.githooks/pre-commit", "100644 def 0\t.githooks/pre-commit.test.sh"];
  assert.deepEqual(hooksExecutable(lines), [".githooks/pre-commit is not executable in git (mode 100644)"]);
});
test("CLAUDE.md stays under 150 lines", () => {
  assert.equal(claudeMdBudget("x\n".repeat(150)).length, 1);
  assert.equal(claudeMdBudget("x\n".repeat(149)).length, 0);
});
test("agents declare tools; read-only agents get read tools only", () => {
  const problems = agentTools([
    { file: "a.md", fm: frontmatter("---\nname: a\ndescription: Read-only auditor.\ntools: Read, Grep, Bash\n---\n") },
    { file: "b.md", fm: frontmatter("---\nname: b\ndescription: Builder.\n---\n") },
    { file: "c.md", fm: frontmatter("---\nname: c\ndescription: Read-only.\ntools: Read, Grep, Glob\n---\n") },
  ]);
  assert.equal(problems.length, 2);
});
test("User-only skills must turn off model invocation", () => {
  const skills = [
    { file: "x/SKILL.md", fm: frontmatter("---\nname: x\ndescription: User-only. Audits.\n---\n") },
    { file: "y/SKILL.md", fm: frontmatter("---\nname: y\ndescription: User-only. Audits.\ndisable-model-invocation: true\n---\n") },
  ];
  assert.deepEqual(userOnlySkills(skills), ["x/SKILL.md: a User-only skill must set disable-model-invocation: true"]);
});
test("the hook matcher must match the tools the guard inspects", () => {
  assert.deepEqual(matcherCoversTools(guardHook("Read|Bash"), ["Read", "Bash"]), []);
  assert.match(matcherCoversTools(guardHook("Read"), ["Read", "Grep"])[0], /inspects Grep but the hook matcher omits it/);
  assert.match(matcherCoversTools(guardHook("Read|WebFetch"), ["Read"])[0], /matcher has WebFetch, which the guard ignores/);
  assert.match(matcherCoversTools({ hooks: { PreToolUse: [] } }, ["Read"])[0], /no PreToolUse hook running guard\.mjs/);
});
test("every action must be pinned to a commit SHA", () => {
  const pinned = "jobs:\n  a:\n    steps:\n      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1\n";
  assert.deepEqual(actionsPinned(pinned), []);
  assert.match(actionsPinned("      - uses: actions/checkout@v7\n")[0], /pin it to a 40-character commit SHA/);
  assert.match(actionsPinned("      - uses: some/action@main\n")[0], /pin it to a 40-character commit SHA/);
});
test("all-green must need every gating job", () => {
  assert.deepEqual(allGreenCovers(ci), []);
  const extra = ci.replace("  all-green:", "  hooks:\n    runs-on: x\n  all-green:");
  assert.match(allGreenCovers(extra)[0], /all-green does not need "hooks"/);
});
test("runs as a CLI from the repository root", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const r = spawnSync(process.execPath, [path.join(root, ".github/scripts/check-workspace.mjs")], { cwd: root, encoding: "utf8" });
  assert.match(r.stdout + r.stderr, /^(ok {3}|FAIL )\S/m);
});
