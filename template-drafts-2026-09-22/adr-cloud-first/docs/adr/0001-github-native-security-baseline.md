# ADR-0001: GitHub-native security baseline before paid scanners

Date: 2026-09-19
Status: accepted

## Context

The owner is new to DevSecOps and wants portfolio repos that are demonstrably secured, without paying for tooling before there is code to scan. GitHub provides dependency alerts, automated security updates, secret scanning, push protection, and CodeQL at no cost on public repositories.

## Decision

Every repo enables, at creation: Dependabot alerts, Dependabot security updates, secret scanning, and push protection. Public repos also get CodeQL default setup once they contain a supported language. Paid scanners are considered only when a project's threat model needs something GitHub does not provide, and that need is written down in a new ADR first.

## Consequences

- Repos are public by default, because that is where these features are free. Anything that must stay private accepts weaker scanning and says so in its README.
- The setup wizard enables the baseline through the GitHub API so it cannot be forgotten.
- Every later tool purchase has to name the gap it closes.
