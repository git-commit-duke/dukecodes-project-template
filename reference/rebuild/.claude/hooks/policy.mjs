// Decides whether a tool call may run. Pure: guard.mjs does the I/O.
// Returns a reason string to block the call, or null to allow it.
// Every list here has exactly one home: the tools in GUARDED_TOOLS (the settings matcher must equal it),
// the secret names in secret-paths.txt, and the lockfiles in that file's [edit-only] section.
import { isSecretPath, isEditOnly } from "./paths.mjs";

const PATH_FIELD = { Read: "file_path", Edit: "file_path", Write: "file_path", MultiEdit: "file_path", NotebookEdit: "notebook_path", Grep: "path", Glob: "path" };
const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
const SHELL_TOOLS = new Set(["Bash", "PowerShell"]);
// A search tool can read a file's contents through a glob instead of a path.
const GLOB_FIELD = { Grep: "glob", Glob: "pattern" };
export const GUARDED_TOOLS = [...Object.keys(PATH_FIELD), ...SHELL_TOOLS].sort();

export function decide(event, { list, isSecretCommand }) {
  const tool = event.tool_name;
  const input = event.tool_input ?? {};
  const cwd = event.cwd ?? process.cwd();
  if (SHELL_TOOLS.has(tool)) {
    return isSecretCommand(tool, String(input.command ?? ""), (word) => isSecretPath(word, list, { cwd }));
  }
  const glob = GLOB_FIELD[tool] ? input[GLOB_FIELD[tool]] : undefined;
  if (glob && isSecretPath(String(glob), list, { cwd })) {
    return `${tool} would search ${glob}, which names a secret file (.claude/hooks/secret-paths.txt).`;
  }
  const target = PATH_FIELD[tool] ? input[PATH_FIELD[tool]] : undefined;
  if (!target) return null;
  if (isSecretPath(String(target), list, { cwd })) return `${target} is a secret file (listed in .claude/hooks/secret-paths.txt).`;
  if (EDIT_TOOLS.has(tool) && isEditOnly(String(target), list)) return `${target} is a lockfile. Regenerate it with the package manager instead.`;
  return null;
}
