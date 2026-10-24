---
paths: ["**/*.tf", "**/*.tofu", "ansible/**", "**/Dockerfile", "**/compose*.y*ml", "k8s/**"]
---
# Infrastructure as code
- Claude writes plans, Duke applies. `plan`/`--check` output goes in the PR description.
- State files and tfvars never enter git. Secrets come from a secret manager or `.env`, not code.
- Containers: pinned image digest or exact tag, non-root user, no `privileged`, read-only root fs where possible.
- Every exposed port is named in the PR with why it's exposed.
