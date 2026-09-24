# ADR-0002: No secrets on disk; device-flow sign-in only

Date: 2026-09-19
Status: accepted

## Context

AI coding agents read files into their context. Any secret sitting in a file the agent can open may end up in a transcript, a log, or a commit. The owner is also new to secret management and should not have to learn a vault before shipping a first project.

## Decision

- Tooling signs in through browser device flows (gh, vercel, tailscale) so each CLI holds its own token in its own store. No script asks for, prints, or stores a token.
- Agents are denied reading `.env` files, SSH keys, and Claude's credential file through permission rules, and denied editing `.env` files and lockfiles through a PreToolUse hook.
- Runtime secrets for deployed apps live in the platform's secret store (Vercel environment variables, GitHub Actions secrets), never in the repo.

## Consequences

- `.env.example` is the only env file agents may edit; it documents variable names, never values.
- Local development reads secrets from a `.env` the human writes by hand.
- Adding any secret-bearing file to a repo is a NACK from the maintainer review, no exceptions.
