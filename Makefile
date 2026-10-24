.DEFAULT_GOAL := help
SHELL := bash
.SHELLFLAGS := -euo pipefail -c

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-14s %s\n", $$1, $$2}'

init: ## Rename template for a new project: make init NAME=my-project
	@bash scripts/init-project.sh "$(NAME)"

setup: ## Install deps and git hooks
	uv sync --frozen
	uvx pre-commit@4.7.0 install --install-hooks

lint: ## Run every pre-commit hook on all files
	uvx pre-commit@4.7.0 run --all-files --show-diff-on-failure

test: ## Run tests with coverage
	uv run pytest --cov

scan: ## SAST + dependency/IaC scan (needs network)
	bash scripts/scan.sh

check: lint test scan ## Everything CI runs

update-hooks: ## Bump pre-commit hook revs
	uvx pre-commit@4.7.0 autoupdate

.PHONY: help init setup lint test scan check update-hooks
