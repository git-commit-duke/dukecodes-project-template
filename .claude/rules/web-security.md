---
paths:
  - "next.config.*"
  - "middleware.ts"
  - "proxy.ts"
  - "vercel.ts"
  - "vercel.json"
---

# Web security surface

Every app ships these response headers, set in `next.config` `headers()` or the platform config. A change to any of them is reviewed as a security change.

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`, or a `frame-ancestors` directive in the CSP
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera, microphone, and geolocation unless the product uses them
- `Content-Security-Policy` starting from `default-src 'self'`, widened one source at a time with the reason in a comment

Also: no secrets in `NEXT_PUBLIC_*` variables; middleware never trusts a header the client can set; redirects only go to allow-listed hosts.
