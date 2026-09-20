---
paths:
  - "app/api/**"
  - "pages/api/**"
  - "src/server/**"
  - "server/**"
  - "convex/**"
---

# Server code

- Validate every input at the boundary with a schema. Reject, do not coerce.
- Authorization lives in every handler, not in the router. A handler that does not check who is calling is a NACK.
- Mutations are idempotent: accept a client-supplied idempotency key, store it with the result, and return the stored result on retry.
- Concurrent writes are guarded by a version or updated-at check. A stale write fails; it does not overwrite.
- Money, inventory, and anything audited is append-only: write an event, derive the balance. No blind overwrites.
- Errors return one shape, `{ error: { code, message } }`, with a stable code. Never leak stack traces or queries.
- Logs are structured JSON with a request id on every line. No secrets, no full request bodies.
