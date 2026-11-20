# Build process: JetBrains tools on Fearless

> **STATUS: the case study below is EMPTY and marked. Nothing here claims a tool
> was used until it has been.**
>
> Two things rest on this document.
>
> **The mandatory requirement**, the stronger of the two: the project must be built
> with at least one JetBrains tool, and the Devpost form has three required fields
> asking which tools were used and how the project meets that requirement.
>
> **The $1,000 bonus prize**, *Best AI-Powered Workflow Story* — "show us how AI
> accelerated your build", as a short case study or video with a direct URL. That is
> a narrative about problems solved, not a gallery of screenshots.
>
> Everything in this repository up to this point was built in a terminal agent.
> There is no `.idea/` yet. Part 1 below is a real, outstanding piece of work with
> failing tests already written for it; doing it in WebStorm is what makes this
> document true.

---

# Part 1 — the task

## Why this task and not a toy one

The draft board is sold on being usable under a thirty-second timer, and it has a
real accessibility defect that contradicts that. Three findings, all verifiable:

1. **Champions are not announced as buttons.** `src/ui/PoolGrid.tsx` renders each
   champion as `<button role="listitem">`. An explicit ARIA role *overrides* the
   native one, so assistive technology announces "list item", never "button", and a
   screen-reader user cannot tell a champion can be picked. The proof is in this
   repo: `tests/ui.test.tsx` finds champions with `getByRole("listitem")` and
   passes, which is only possible because the button role is gone.
2. **The pool cannot be navigated with the keyboard.** You can type to search and
   press Enter, but you cannot move through the 173-champion grid with arrow keys.
3. **Nothing announces whose turn it is.** The turn strip is purely visual, so a
   screen-reader user gets no notification when the action passes to the other side.

Fixing these improves the Design score on its own merits and is honest work — not
something invented to have an IDE task.

## What to build

**A. `src/ui/gridNav.ts` — implement the stub that is already there.**

```ts
export type NavKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/** Where the keyboard focus should move to. Pure: no DOM, no React. */
export function nextIndex(current: number, key: NavKey, total: number, columns: number): number;
```

The file exists with that signature and a body that throws. Nothing imports it yet,
so it is not in the shipped bundle and `main` builds clean.

Rules, all pinned by tests in `tests/keyboard.test.tsx`:

| Key | Behaviour |
|---|---|
| `ArrowRight` / `ArrowLeft` | ±1, stopping at the ends rather than wrapping |
| `ArrowDown` / `ArrowUp` | ±`columns` |
| off a ragged last row | stay put — do not slide sideways to a cell that is not below you |
| `Home` / `End` | first / last |
| `total === 0` | `-1` |

The ragged-row rule is the interesting one and the reason this is a pure function
with its own tests rather than a handful of lines inside a component.

**B. `src/ui/PoolGrid.tsx` — fix the roles and wire the keys up.**

- Drop `role="list"` / `role="listitem"`. Use
  `<div className="pool" role="group" aria-label="Champion pool">` and leave the
  `<button>`s as buttons.
- Roving tabindex: exactly one champion has `tabIndex={0}`, the rest `-1`.
- On `keydown`, call `nextIndex` and focus the result. Read the live column count
  from the DOM — the grid is `repeat(auto-fill, …)`, so it changes with width. The
  honest way is to compare `offsetTop` of the first row's children, or
  `getComputedStyle(pool).gridTemplateColumns.split(' ').length`.

**C. `src/ui/TurnStrip.tsx` — announce the turn.**

Wrap whose-action-it-is in `role="status"` with `aria-live="polite"`. Leave the
clock as `aria-live="off"`; a timer that announces every second is unusable.

## Expect this to break two existing tests

`tests/ui.test.tsx` asserts the *old*, wrong behaviour in two places:

```
screen.getByRole("listitem", { name: /^Ahri\./ })   // pool grid test
screen.getByRole("listitem", { name: "Lux" })       // pool grid test
```

Both must become `getByRole("button", …)`. **This is not collateral damage, it is
the point** — those two lines are the moment the defect was baked in, and changing
them is the proof it is fixed. Mention it in the write-up.

## Step by step in WebStorm

Each step names the IDE feature to use, because the write-up needs specifics.

1. **Open the project.** `File → Open` → the repo root. Trust the project. Let it
   finish indexing before judging its speed.
2. **Make a run configuration.** `Run → Edit Configurations → + → Vitest`. Name it
   `all tests`, leave the working directory as the project root. Run it: 102 passed,
   10 skipped. *Screenshot this.*
3. **Un-skip the spec.** Open `tests/keyboard.test.tsx` and change all three
   `describe.skip` to `describe`. Run again — now red: `nextIndex` throws
   "not implemented", and the PoolGrid tests fail on the role defect.
4. **Open the stub.** `src/ui/gridNav.ts` already exists with the signature, the
   JSDoc and a body that throws. Use `⌘B` / `Go to Declaration` from the test's
   `nextIndex` call to jump straight into it — that is the navigation worth noting.
5. **Implement `nextIndex`.** Delete the `void` lines and the `throw`, and write it
   yourself; it is about fifteen lines. When the
   ragged-row test fails, set a breakpoint on the `ArrowDown` branch and use
   `Run → Debug` on the run configuration — stepping through with the actual values
   in the variables pane is the fastest way to see why `5 + 3` must stay at `5`.
   *Screenshot the debugger stopped on that line.*
6. **Fix `PoolGrid.tsx`.** Use `Edit → Find → Find in Files` for `role="listitem"`
   to see all three occurrences at once and confirm which ones are legitimate
   (`SeriesBar` and `SuggestionList` put it on `<span>`/`<div>`, which is correct —
   only the `<button>` is wrong). *Screenshot the Find in Files results.*
7. **Use a refactor for real.** If you name anything awkwardly on the first pass,
   fix it with `Refactor → Rename` (⇧F6) rather than find-and-replace, and note what
   it updated. If nothing needs renaming, say so — do not invent a refactor.
8. **Fix the two assertions in `tests/ui.test.tsx`.**
9. **Green again.** Run the configuration from the gutter icon next to a `describe`.
   Expect 112 passing, 0 skipped.
10. **Commit from the IDE.** `⌘K`, review the diff in the commit dialog, write the
    message, commit and push. Using the IDE's Git tool window rather than the
    terminal is itself part of the evidence.

## Optional: Junie

If you have an AI Ultimate code activated, give Junie one scoped task — "implement
`nextIndex` in `src/ui/gridNav.ts` so `tests/keyboard.test.tsx` passes" is a good
one because the tests define success exactly. Then record what it produced, what you
changed, and what it got wrong. **A write-up in which the tool is flawless reads as
marketing.** If you do not use Junie, answer "No" on the Devpost form — that is a
perfectly good answer and costs nothing.

## Afterwards

```bash
git add .idea
git commit -m "chore: commit WebStorm project files as JetBrains evidence"
```

`.gitignore` already excludes the per-machine churn (`workspace.xml`, `shelf/`,
`usage.statistics.xml`, `httpRequests/`). Commit the rest as-is. **Do not hand-write
anything under `.idea/`** — a fabricated project folder is exactly what this prize
exists to distinguish from real use.

---

# Part 2 — the case study

> Fill this in from what actually happened. Keep it a story: a problem, what you
> reached for, what happened, what you would do differently. Delete any heading you
> have nothing true to put under.

## Which tools, and for what

| Tool | Used for | Evidence |
|---|---|---|
| WebStorm | _to be filled_ | `.idea/` committed at repo root |
| Junie | _to be filled, or "not used"_ | _to be filled_ |
| JetBrains Air | not used | — |

## The problem I was solving

_One paragraph: the accessibility defect above, in your own words._

## What the IDE did that would have been slower by hand

_Be specific. "Find in Files showed me all three `role="listitem"` occurrences at
once and made it obvious that two of them were fine" is worth more than "WebStorm
has good search". The debugger stopping inside `nextIndex` with `current=5`,
`columns=3`, `total=7` in the variables pane is the strongest single thing here._

## What it got wrong

_Required for credibility. Auto-import picking the wrong module, an inspection
being noisy, Junie misreading the ragged-row rule, the Vitest runner needing the
working directory set — whatever actually happened._

## What I would do differently

_One honest paragraph._

## Screenshots

Save to `docs/img/jetbrains/` and link them here:

1. The Vitest run configuration showing 102 passed / 10 skipped before the change.
2. The debugger stopped inside `nextIndex`, variables pane visible.
3. `Find in Files` results for `role="listitem"`.
4. The IDE's commit dialog with the final diff.
5. 112 passing afterwards.
