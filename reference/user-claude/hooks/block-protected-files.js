// Claude Code PreToolUse hook. Exit 2 = block the tool call; stderr goes back to Claude.
// Fails closed: anything unexpected blocks, because a hook that fails open is not a gate.
// The repo's own guard is the real gate; this is the backstop for sessions opened outside a repo.
let input = '';
process.stdin.on('data', (c) => { input += c; }).on('end', () => {
  let file = '';
  try {
    const t = JSON.parse(input).tool_input || {};
    file = t.file_path || t.notebook_path || '';
  } catch (err) {
    console.error(`Blocked by hook: could not read the tool call (${err.message}), so it failed closed.`);
    process.exitCode = 2;
    return;
  }
  const name = String(file).replace(/\\/g, '/').toLowerCase();
  // .env, .env.<anything> except the name-only templates, .env-<anything>, .envrc
  const isEnv = /(^|\/)\.env(rc|[.-][^/]*)?$/.test(name) && !/(^|\/)\.env\.(example|sample|template)$/.test(name);
  const isKey = /\.(pem|key|p12)$|(^|\/)id_(rsa|ed25519)$/.test(name);
  const isLockfile = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/.test(name);
  if (isEnv || isKey || isLockfile) {
    const kind = isLockfile ? 'lockfile' : isKey ? 'key material' : 'env file';
    console.error(`Blocked by hook: ${file} is protected (${kind}). Edit it by hand, or regenerate the lockfile with the package manager.`);
    process.exitCode = 2;
  }
});
