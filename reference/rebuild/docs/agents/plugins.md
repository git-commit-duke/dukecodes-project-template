# Plugins, their hooks and MCP servers

`.claude/settings.json` enables plugins for local sessions. Cloud sessions load plugins only from the claude.ai account (ADR-0003). Policy: plugins that bring only skills, commands and agents are fine; a plugin that registers hooks or starts an MCP server is an exception listed here and reviewed on every update.

| Plugin | Hooks | MCP server | Why it is allowed |
|---|---|---|---|
| superpowers | SessionStart (`startup\|clear\|compact`): loads its skill index | none | The brainstorm → plan → test-first workflow |
| semgrep | PreToolUse and PostToolUse on `Write\|Edit\|Bash`; SessionStart; Stop; SessionEnd. All run the plugin's bundled binary | `guardian`: the same binary, local | Edit-time scanning with the tool CI runs |
| context7 | none | `context7`: remote HTTP at mcp.context7.com; library-documentation queries leave the machine; an API key is optional | Current library documentation |
| mattpocock-skills, claude-md-management, commit-commands, code-review, pr-review-toolkit, project-artifact | none | none | Skills, commands and agents only |

Checked against superpowers 6.3.0, semgrep 2.3.0 and context7 c447c32. To review an update, read the plugin's `hooks/hooks.json` and `.mcp.json` in the plugin cache and update this table in the same pull request.
