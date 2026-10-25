# Writing and design style

Every dukecodes repo reads and looks the same. Readers may be new to tech, and an interviewer should be able to see how you think. This page says how to write. How things look is set by the design system: [`site/ds/README.md`](../site/ds/README.md).

## Voice

- Write like a senior engineer pairing with the reader. Second person, short sentences, one idea each.
- Lead with what to do, then why.
- Explain every term the first time. Or add it to `glossary` in `site/project.json`, and the page explains it on hover.
- No "simply", "just" or "obviously". If it were obvious, they wouldn't be reading.
- Real names and numbers. No marketing words.
- Sentence case everywhere. Only the small mono labels above headings are UPPERCASE.
- A red or blocked state always comes with the fix.

## Say how sure you are

Every claim someone might act on carries a truth label. Steps also carry a confidence level. These tables are the words the page shows under Reference › Labels, and `tests/test_style.py` checks that the two match.

### Truth labels

| Label | Means |
|-------|-------|
| `FACT` | Checked against official docs or the tool's real output. |
| `INFERENCE` | Follows from facts, but nobody ran it to prove it. |
| `COMMUNITY` | Widely reported to work, but not in official docs. |
| `PROPOSAL` | A suggestion. Decide whether it fits your project. |
| `ASSUMPTION` | Taken as true without checking. Confirm it before you rely on it. |

### Confidence

| Level | Means |
|-------|-------|
| `HIGH` | Run here, or several good sources agree. |
| `MED` | One good source, or it may have changed since. |
| `LOW` | Thin evidence. Treat it as a lead, not an answer. |

Back a `FACT` with a link or the date you ran it. Couldn't check something? Say so and say why. On the page that is an `unverified` callout.

## Every step has four parts

1. **Why**: what goes wrong without it.
2. **Do**: the exact command or click path, in one copyable block.
3. **Check it worked**: what the reader should see. Paste real output, not what you hope for.
4. **Undo**: how to get back.

Every step shows its risk before anyone opens it:

| Risk | Means |
|------|-------|
| `safe` | Only reads, or is easy to undo. |
| `caution` | Changes something. The Undo part says how to reverse it. |
| `destructive` | Deletes or overwrites. Undo may not bring it all back. |
| `danger` | Can lock you out or lose data for good. Read every word first. |

For a doc, start from [`docs/runbooks/_template.md`](runbooks/_template.md). On the page, a step is an entry in `stages[].steps[]`.

## Never publish

Real IP addresses, hostnames, serial numbers, tailnet names, usernames or tokens. Use the ranges set aside for examples: `192.0.2.0/24`, `198.51.100.0/24` and `203.0.113.0/24` (RFC 5737), and `example.com` (RFC 2606).

## The project page

The page is data, not code. Edit `site/project.json`; `site/app.js` draws it with the design system's components. `make site-check` checks every key (an unknown key is a typo), and a commit hook runs it for you.

| Key in `project.json` | What it shows | Design system part |
|-----------------------|---------------|--------------------|
| `title`, `brand` | Tab title and the name in the header | |
| `hero` | Headline, buttons and count-up numbers | Button, StatTile |
| `console.scenarios[]`, `console.passLine` | Pipeline runs streaming in the hero, with a Pause button. `passLine` is the last line of a clean run | LiveConsole |
| `pipeline` | Stage cards, plus your progress and the next step | StageCard, ProgressRing |
| `simulator` | Fire an attack and watch which gate stops it, and why | GateSimulator |
| `why.cards[]` | A grid of reasons, each with a number or a link | BentoCard |
| `path.steps[]` | The learning path, start to finish | |
| `final` | The closing call to action | |
| `stages[].steps[]` | The runbook: Why, Do, Check with a typed replay, Undo, sources | StepCard, TerminalReplay, Callout, Chip |
| `gates.rows[]` | Every check, what it catches, where it is set up | |
| `flashcards[]` | Self-test cards. Misses come back until you know them | Flashcards |
| `glossary[]` | Hover definitions for the words in `match`, plus a searchable list | GlossaryTerm |
| `versions.rows[]` | Every pinned tool: version, release date, how it is pinned | |
| `layout[]` | What each folder is for | |
| `footer`, `repo` | Footer text and the repository link | |

Text shows exactly as written. Fields that allow it turn `` `backticks` `` into code. Nothing is ever read as HTML.

Search (Ctrl K, or ⌘K on a Mac) finds every page, section, stage, step, gate and glossary word. Addresses live after the `#`, like `#/runbook/get-01`, because GitHub Pages only serves files.

## Page rules that keep it safe

- **Content Security Policy** in `site/index.html`: scripts and styles from this site only (plus Google Fonts), nothing inline, Trusted Types on. `make site-check` fails if it changes.
- **No HTML from strings.** No `innerHTML`, `eval`, string timers or anything like them. No `RegExp` built from data. `fetch` loads only files next to the page. `make site-check` fails on each.
- **Vendored files stay as they came.** The design system (`site/ds/`) and React (`site/vendor/`) are byte-locked in `site/ds.lock.json`. Never edit them: sync them ([runbook](runbooks/sync-design-system.md)). Fixes for design-system bugs go in `site/app.js` or `site/app.css`.
- **Motion is optional.** With "reduce motion" on, everything jumps to its end state and still works.
- **Both themes ship.** Body text keeps 4.5:1 contrast (WCAG AA) in light and dark.
