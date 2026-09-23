---
paths:
  - "docs/adr/**"
---

# Architecture decision records

- One decision per file, named `NNNN-kebab-title.md` with the next free number, in the format of `docs/adr/TEMPLATE.md`: a title line, `Date:`, `Status:`, then Context, Decision and Consequences.
- An accepted ADR is never edited. Write a new one that supersedes it and change the old Status line to `superseded by ADR-NNNN`.
- A breaking change to an API, config format, schema or documented behaviour cites its ADR in the commit message, and lands after the ADR and its migration.
- Before proposing a decision, read the existing ADRs in this directory. Contradict one only explicitly, naming it.
