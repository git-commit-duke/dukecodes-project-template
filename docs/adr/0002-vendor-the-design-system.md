# 2. Vendor the Dukecodes Design System for the project page

Status: accepted
Date: 2026-10-24

## Context
Every dukecodes repo gets the same interactive, plain-English project page (duke, 2026-10-24). The old page ran on a home-made copy of the look (`mc-tokens.css`, `mc-components.css`, `mc.js`) that had drifted from Minirack Mission Control. The Dukecodes Design System is now the one source: React 18 components (`window.Dukecodes`, `dk-` classes) and design tokens, published as a claude.ai artifact (https://claude.ai/artifact/Y6oFpmBcswr26DqM5eUjCE).

GitHub Pages can't send security headers. Whatever locks the page down has to live in its own files.

## Decision
- Copy the design system's files into `site/ds/`, and React 18.3.1 (the UMD builds from the npm tarballs) into `site/vendor/`. No CDN, no link to the artifact.
- Lock every copied file by sha256 in `site/ds.lock.json`. `scripts/check_site.py` fails on any changed byte and on any file the lock doesn't list. React's lock entry also names the npm tarball and its integrity hash, so anyone can prove the copy is genuine.
- Generate `site/ds/tokens.css` from `tokens.json` with `scripts/ds_tokens.py`, which accepts only plain colour, size and font values.
- No build step. `site/app.js` calls `React.createElement` directly.
- A strict Content Security Policy with Trusted Types (`trusted-types 'none'`): nothing on the page may turn a string into HTML.
- Fix design-system gaps in `site/app.js` and `site/app.css`, list them in `docs/design-system-fixes.md`, and never patch `site/ds/`.

## Pros
- The page runs no code from other sites. Its only outside requests are the Google Fonts it links in `site/index.html`.
- A changed vendored byte fails a check and shows up as a diff in review.
- No npm, bundler or JavaScript lockfile. The repo's only toolchain stays Python and uv.

## Cons
- A sync is a manual pull request ([runbook](../runbooks/sync-design-system.md)), so the copy can lag behind the design system.
- React's production builds add 143 kB before compression. Fine for one page.
- Google Fonts tells Google each reader's IP address. Self-hosting the fonts would fix it. The design system dropped its own font `@import` in version `1792882633-dffe`, so only the page's link would change.
- Without JSX, page code is wordier.

## Alternatives considered
- **Load the design system from the artifact or a CDN.** Fewer files, but whoever controls that host could change the page's code at any time, and the CSP would have to trust it.
- **npm with a bundler (Vite).** JSX and smaller output, but it adds Node, a JavaScript lockfile and a second supply chain the template doesn't otherwise need.
- **Keep the home-made `mc-*` copy.** It had already drifted. Two designs to maintain.
