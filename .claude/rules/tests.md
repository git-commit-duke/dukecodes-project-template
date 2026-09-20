---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/*.spec.{ts,tsx}"
  - "tests/**"
---

# Tests

- `describe` names the unit; `it` states the behaviour in plain words: `it("rejects an expired token")`. Never `test1`.
- One behaviour per test. Arrange, act, assert, in that order and visibly.
- Unit tests sit beside the code as `*.test.ts`. End-to-end tests live in `tests/` and run against a real build.
- No network, clock, or randomness without an explicit fake. A test that passes on retry is a bug.
- The failing test is written before the fix or the feature. When the change is large, the commit that adds the test is separate from the one that makes it pass.
- Coverage is not the goal. A test for every bug ever fixed is.
