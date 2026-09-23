// Secret-path matcher shared by the guard (policy.mjs) and the pre-commit hook (staged-secrets.mjs).
// Grammar of secret-paths.txt:
//   '#' starts a comment; blank lines are ignored.
//   '[settings]' lists plain file names that .claude/settings.json must also deny; '[patterns]' lists globs.
//   '!' marks an exception. The last matching line wins.
//   A pattern without '/' matches the file name at any depth.
//   A pattern starting '~/' is anchored at the home directory.
//   Any other pattern with '/' matches the end of the path, starting at a directory boundary.
//   '*' and '?' stay within one directory; '**' spans directories.
//   Matching is case-insensitive on every platform.
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const norm = (p) => p.replace(/\\/g, "/").toLowerCase();
// The only dynamic regex in this repository. Its input is the reviewed secret-paths.txt, never user input, and
// globSource escapes every metacharacter except the wildcards it translates, so the patterns stay small and fixed.
const compile = (source) => new RegExp(source); // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp

function globSource(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") { re += "(?:.*/)?"; i += 2; } else { re += ".*"; i += 1; }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return re;
}

export function parseList(text) {
  const rules = [];
  const settingsNames = [];
  const editOnlyNames = [];
  let section = "patterns";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const header = line.match(/^\[(settings|patterns|edit-only)\]$/);
    if (header) { section = header[1]; continue; }
    const negate = line.startsWith("!");
    const pattern = (negate ? line.slice(1) : line).toLowerCase();
    if (section === "settings" || section === "edit-only") {
      if (negate || pattern.includes("/") || /[*?]/.test(pattern)) throw new Error(`[${section}] takes plain file names only: ${line}`);
      (section === "settings" ? settingsNames : editOnlyNames).push(line);
    }
    // [edit-only] names are readable, so they produce no secret rule: the policy blocks edits to them
    // and the lint requires a matching Edit deny in settings.json.
    if (section === "edit-only") continue;
    if (pattern.startsWith("~/")) rules.push({ negate, kind: "home", regex: compile(`^${globSource(pattern.slice(2))}$`) });
    else if (pattern.includes("/")) rules.push({ negate, kind: "path", regex: compile(`(?:^|/)${globSource(pattern)}$`) });
    else rules.push({ negate, kind: "name", regex: compile(`^${globSource(pattern)}$`) });
  }
  return { rules, settingsNames, editOnlyNames };
}

// True when a file name is one the package manager owns (a lockfile): readable, never edited by an agent.
export function isEditOnly(filePath, list) {
  const name = norm(String(filePath)).split("/").pop();
  return list.editOnlyNames.some((n) => n.toLowerCase() === name);
}

export function isSecretPath(filePath, list, { cwd = process.cwd(), home = os.homedir() } = {}) {
  if (!filePath) return false;
  const expanded = filePath === "~" || /^~[\\/]/.test(filePath) ? path.join(home, filePath.slice(2)) : filePath;
  const abs = norm(path.resolve(cwd, expanded));
  const name = abs.slice(abs.lastIndexOf("/") + 1);
  const homeN = norm(path.resolve(home));
  const inHome = abs.startsWith(`${homeN}/`) ? abs.slice(homeN.length + 1) : null;
  let secret = false;
  for (const r of list.rules) {
    const target = r.kind === "name" ? name : r.kind === "home" ? inHome : abs;
    if (target !== null && r.regex.test(target)) secret = !r.negate;
  }
  return secret;
}

export function loadDefaultList() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return parseList(readFileSync(path.join(here, "secret-paths.txt"), "utf8"));
}
