// SCRATCH-ONLY sample body proving the owner's tests are satisfiable. Not part of the plan.
export function isSecretCommand(toolName, command, isSecret) {
  const words = command.split(/[\s;&|<>()'"`]+/).filter(Boolean);
  const hit = words.find((w) => isSecret(w));
  return hit ? `${toolName} command names the secret file ${hit}.` : null;
}
