# Build process: JetBrains tools on Fearless

> **Status: NOT YET TRUE. This document is a frame, not a record.**
>
> The bonus prize is judged only on "how clearly and completely they show the team's use of
> JetBrains IDEs, AI Coding Agent Junie or JetBrains Air". The mandatory requirement is
> stronger than the bonus: the project **must** be built with at least one JetBrains tool.
>
> At the time of writing this repository has been built in a terminal agent, not in a
> JetBrains IDE, and there is no `.idea/` directory. Filling this document with invented
> screenshots and invented Junie sessions would be fabricating the exact evidence the prize
> is judged on. So the sections below are empty, and marked.
>
> **What has to happen, by a person:** install WebStorm with the All Products Pack code from
> the registration email, open this repository in it, and do real work in it — then commit
> `.idea/` and fill these sections from what actually happened.

## 1. Which tools, and for what

| Tool | Used for | Evidence |
|---|---|---|
| WebStorm | _to be filled_ | `.idea/` committed at repo root |
| Junie | _to be filled_ | _to be filled_ |
| JetBrains Air | not used | — |

## 2. The `.idea/` directory

_Not present yet._ Once the project is opened in WebStorm, commit the directory as-is. Do not
hand-write it: a hand-made `.idea/` is exactly the thing this prize exists to distinguish from
real use.

What normally lands there and is worth keeping: `modules.xml`, `jsLinters/`, `codeStyles/`,
`inspectionProfiles/`, and the run configurations under `runConfigurations/`. Add
`.idea/workspace.xml` and `.idea/shelf/` to `.gitignore` — they hold per-machine state and
churn on every window move.

## 3. Screenshots to take

One each, saved to `docs/img/jetbrains/`:

1. The project open in WebStorm, with `src/engine/fearless.ts` showing and the test runner
   panel green.
2. The Vitest run configuration, showing the 102 tests passing inside the IDE.
3. A Junie session on a real task, including something it got wrong and how that was
   corrected — a write-up that only shows the tool succeeding reads as marketing.
4. One refactor performed with the IDE rather than by hand (Rename Symbol across the engine,
   or Extract Function), with the before and after.

## 4. What to write once it is true

For each tool, three things, in plain sentences: what it was used for, one specific thing it
did that would have been slower by hand, and one thing it got wrong. The third is what makes
the first two credible.

## 5. Suggested work to do in the IDE

Real tasks still outstanding, so the IDE use is genuine rather than staged:

- Add a third ruleset variant (burn only from games a team won) — touches
  `contracts.ts`, `src/engine/fearless.ts` and its tests. A good Junie task.
- Widen `src/data/tiers.json` past 50 champions.
- Replace the role mapping in `scripts/fetch-champions.ts` with a curated table.
- The role filter and the search box do not combine with keyboard navigation yet.
