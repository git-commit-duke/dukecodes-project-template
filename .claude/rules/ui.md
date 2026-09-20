---
paths:
  - "app/**/*.tsx"
  - "src/components/**"
  - "components/**"
---

# UI code

- Components render state; they do not own it. Data arrives through props or a hook that wraps the data layer. Components never query the database or fetch directly.
- Every interactive element is reachable by keyboard, shows a visible focus state, and has a label a screen reader can read.
- User-facing strings live in one place per feature, not scattered through components, so a second locale is a file, not a rewrite.
- Use the design tokens the project already has. A new token needs a reason in the PR.
- Loading, empty, and error states are part of the component. A component without them is incomplete.
