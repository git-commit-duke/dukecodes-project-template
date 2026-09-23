---
name: deep-audit
description: User-only. Runs a deep, evidence-first audit of a repository or plan under the GATE-0 protocol, with read-only auditors and adversarial verification.
disable-model-invocation: true
---

# Deep audit

## Gate 0: preconditions (if any fails, say so and stop)

- **Verification.** Every FACT traces to something inspected in this session: a file and line, a diff or hash, a live call, a primary source. Anything else is INFERENCE, or gets inspected.
- **Clean context.** Run in a single-purpose session. A saturated or mixed session is restarted clean.
- **Freshness.** Inputs are current; anything that may have changed since the model's knowledge cutoff is checked against a live source.

A blocked audit is a correct outcome. A confident, unverified audit is the failure mode.

## Process

1. **Deconstruct.** State what is known for certain, the data points and constraints; separate facts from assumptions.
2. **First principles.** Strip conventional summaries; name the hidden assumptions in the question and in consensus.
3. **Tournament.** Form at least two competing hypotheses and weigh them on evidence, not preference.
4. **Self-critique.** Audit the draft for errors, gaps and hallucinations; state what might be overlooked; correct it.
5. **Synthesis.** Deliver the evidence-backed conclusion.

## Method

- Dispatch the `auditor` agent (read-only by its tool list) for any search wider than three files; run independent lenses in parallel.
- Verify every load-bearing claim an auditor returns before reporting it; report refuted claims as refuted.
- Label every non-trivial claim FACT, INFERENCE, ASSUMPTION or UNVERIFIED, with HIGH, MED or LOW confidence where it is not obvious.
- Tools before web search: read files, run read-only commands, fetch the owning documentation page; search the web last.

## Output

Findings as a table with named files, most severe first, each with evidence, impact and fix; then a "tool gaps" section; destructive actions listed as awaiting approval, never executed. Before sending: could it be cut by a fifth without losing a finding or caveat? If so, cut it.
