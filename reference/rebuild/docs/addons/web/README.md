# Web add-on

For a repository that becomes a web app (it gains a `package.json`):

1. Copy `rules/*.md` from this folder into `.claude/rules/`. They are path-scoped, so they load only when matching files are touched.
2. Add to `enabledPlugins` in `.claude/settings.json`: `typescript-lsp@claude-plugins-official`, `playwright@claude-plugins-official`, `frontend-design@claude-plugins-official`, `modern-web-guidance@claude-plugins-official`, `vercel@claude-plugins-official`. Record their hooks and MCP servers in `docs/agents/plugins.md`.
3. Install what those plugins drive, or they do nothing: `pnpm add -g typescript-language-server typescript` for `typescript-lsp`, and `pnpm dlx playwright install` for `playwright`. A language-server plugin whose server is missing from PATH is silent dead weight. Keep to pnpm; the template pins one package manager on purpose.
4. Uncomment the npm entry in `.github/dependabot.yml`.
