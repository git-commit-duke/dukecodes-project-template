# Writing and design style

Every dukecodes repo looks and reads the same: Mission Control. The goal is that someone with no tech background can follow any page, and an interviewer can see how you think.

## Voice
- Plain English. Define every term the first time, or link the glossary.
- Short sentences. One idea each. Lead with what to do, then why.
- No "simply", "just", "obviously". If it were obvious, they wouldn't be reading.
- Say what you don't know. Label claims:

| Label | Means |
|-------|-------|
| `FACT` | Read in an official doc or verified by running it. Add the date or link. |
| `INFERENCE` | Reasoned from facts, not stated anywhere. |
| `ASSUMPTION` | A guess. Flag it so the reader can check. |
| `PROPOSAL` | A design idea, not a decision until approved. |

## Every step has four parts
1. **Why**: what goes wrong without it.
2. **Do**: exact command or click path. One copyable block.
3. **Check it worked**: what the reader should see.
4. **Undo**: how to get back.

Add a risk badge: `safe` (repeatable), `caution` (changes config you can undo), `destructive` (erases data), `danger` (can lock you out). Template: `docs/runbooks/_template.md`.

## Visual design
- Tokens and components: `site/assets/mc-tokens.css` and `mc-components.css`. Canonical copy lives in `dukecodes-project-template`. Don't fork them; sync from there.
- Fonts: Bricolage Grotesque (headings), IBM Plex Sans (body), JetBrains Mono (labels, code).
- Colors carry meaning: amber = current / attention, teal = links and facts, green = done / safe, red = risk, violet = unverified or proposal.
- Light and dark both ship. Check text contrast (WCAG AA, 4.5:1) when adding colors.
- Each repo's page is data, not code: edit `site/project.json`. The renderer (`mc.js`) is shared.
