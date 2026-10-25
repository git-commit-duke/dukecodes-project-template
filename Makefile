.DEFAULT_GOAL := help
SHELL := bash
.SHELLFLAGS := -euo pipefail -c

# Dependency cooldown for tools run with uvx (uvx ignores pyproject.toml settings).
# Keep it equal to [tool.uv] exclude-newer and .github/dependabot.yml; tests/test_policy.py checks.
COOLDOWN := 7 days
UVX := UV_EXCLUDE_NEWER="$(COOLDOWN)" uvx
PRE_COMMIT := $(UVX) pre-commit@4.7.0

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-16s %s\n", $$1, $$2}'

init: ## Rename the template for a new project: make init NAME=my-project
	@bash scripts/init-project.sh "$(NAME)"

setup: ## Install deps and git hooks
	uv sync --locked
	$(PRE_COMMIT) install --install-hooks

lint: ## Run every pre-commit hook on all files (the main-branch guard only runs on commit)
	SKIP=no-commit-to-branch $(PRE_COMMIT) run --all-files --show-diff-on-failure

typecheck: ## Type-check src, tests and scripts (mypy strict)
	uv run --locked mypy

test: ## Run tests with coverage
	uv run --locked pytest --cov

secrets-history: ## Scan the whole git history for secrets (gitleaks)
	$(PRE_COMMIT) run --hook-stage manual gitleaks-history --all-files

scan: ## SAST + dependency/IaC scan (needs network and trivy)
	UV_EXCLUDE_NEWER="$(COOLDOWN)" bash scripts/scan.sh

site-check: ## Check the project page: lock hashes, project.json, CSP
	uv run --locked python scripts/check_site.py

site-tokens: ## Rebuild site/ds/tokens.css from site/ds/tokens.json
	uv run --locked python scripts/ds_tokens.py site/ds/tokens.json site/ds/tokens.css

preview: ## Serve the project page on this machine only: http://127.0.0.1:8000
	python3 -m http.server --bind 127.0.0.1 --directory site 8000

check: lint typecheck test secrets-history ## Everything CI runs except the network scan (make scan)

.PHONY: help init setup lint typecheck test secrets-history scan site-check site-tokens preview check
