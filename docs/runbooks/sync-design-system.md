# Sync the design system

`caution` · `FACT` · `HIGH` · ~15 min · runs on: your machine or the dev container

## Why
The page's look comes from the Dukecodes Design System, copied into `site/ds/`. A copy, not a link, means the page loads no code from other sites. The hash lock in `site/ds.lock.json` means no one can change those files without a failed check and a diff in a pull request. When the design system changes, the copy goes stale; this brings it up to date.

## Do
1. Start a branch:
   ```bash
   git switch -c chore/sync-design-system
   ```
2. Get the new files. The design system is a claude.ai artifact: https://claude.ai/artifact/Y6oFpmBcswr26DqM5eUjCE. Ask Claude: *"Sync site/ds from the design system artifact."* Claude reads the artifact's published files, writes them to these paths, and tells you the artifact's version:

   | Artifact file | Goes to |
   |---------------|---------|
   | `project/README.md` | `site/ds/README.md` |
   | `project/tokens.json` | `site/ds/tokens.json` |
   | `project/components/bundle.css` | `site/ds/bundle.css` |
   | `project/components/bundle.js` | `site/ds/bundle.js` |
   | `project/components/index.d.ts` | `site/ds/index.d.ts` |

3. Rebuild the colour and type variables from the new tokens, then record the new hashes:
   ```bash
   make site-tokens
   uv run --locked python scripts/check_site.py --relock
   ```
4. In `site/ds.lock.json`, set `designSystem.version` to the artifact's version and `designSystem.synced` to today's date.
5. If the design system came with a new Dukecodes QA kit, copy the kit's `pairs.json` into `site/contrast.json`, as the `pairs` list under `designSystem`. Those are the design system's own text and background pairs; the `page` list is this page's, and you keep it.
6. Go through [`docs/design-system-fixes.md`](../design-system-fixes.md). For each fix, check whether the new version fixed it upstream. If it did, delete the work-around from `site/app.js` or `site/app.css`, and its entry.
7. Commit, push the branch, and open a pull request. The diff of `site/ds/` is the review: read it like any other code.

## Check it worked
```bash
make site-check   # prints: site OK
make check        # every hook passes, the private-address scan included
make preview      # open http://127.0.0.1:8000
```
`make site-check` also proves every colour pair in `site/contrast.json` still reads, and that every design-system class (`dk-…`) and token the page uses still exists.

On the page: light and dark both look right; Ctrl K opens search, and a search that matches nothing suggests one of this page's steps; the console's Pause button stops it from the keyboard; the gate simulator runs; a phone-width window has no sideways scroll.

## Undo
Before merging: `git switch main && git branch -D chore/sync-design-system`. After merging: open a pull request that reverts the merge commit (`git revert -m 1 <merge commit>`).

## Watch out
- The private-address scan reads `site/ds/` too. If the new `bundle.js` carries a private address or a tailnet name (a component's built-in demo data, say), the commit fails. Don't silence the check: ask for a design-system version with example data from 192.0.2.0/24.
- `--relock` only rewrites hashes of files the lock already lists. A new file in `site/ds/` fails the check until you add it to `site/ds.lock.json` by hand. That is on purpose: new code is a decision, not a side effect.
- `tokens.css` is generated, never copied. `scripts/ds_tokens.py` refuses colours, sizes or fonts that could smuggle in CSS, so a bad `tokens.json` fails here instead of on the page.
- React lives in `site/vendor/react-18.3.1/`, unpacked from the npm tarballs named in the lock. Update it in its own pull request. To prove the copy is genuine (read-only, `safe`):
  ```bash
  curl -sSLo /tmp/react.tgz https://registry.npmjs.org/react/-/react-18.3.1.tgz
  echo "sha512-$(openssl dgst -sha512 -binary /tmp/react.tgz | base64 -w0)"  # = vendor.react.integrity in the lock
  tar -xzOf /tmp/react.tgz package/umd/react.production.min.js | sha256sum  # = that file's sha256 in the lock
  ```
  Same for `react-dom`. `FACT`: both matched on 2026-10-24.

## Sources
- Subresource Integrity format (sha512, base64): https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity
- npm package integrity: https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json#packages
