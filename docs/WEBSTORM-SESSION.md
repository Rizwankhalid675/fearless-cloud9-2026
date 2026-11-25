# The WebStorm session — one page

Everything that can be prepared has been. This is the short version of
[`JETBRAINS.md`](JETBRAINS.md), which has the full reasoning.

**Deadline: 12 January 2027, 11:00 PT.** No rush, but this is the only thing
standing between Fearless and a submitted entry.

---

## ~~Step 0 — install WebStorm~~ — DONE, 25 November 2026

**WebStorm 2026.3.0.1 is installed** at `/Applications/WebStorm.app`, via
`brew install --cask webstorm`. A `webstorm` command wrapper is on the PATH at
`/opt/homebrew/bin/webstorm`, so `webstorm .` from the repo root opens it.

**First launch is yours**, and it is two clicks: WebStorm asks you to accept the
JetBrains user agreement and to pick a licence. Either route works — the **All
Products Pack code** from the hackathon registration email, or **free for
non-commercial use**, which a hackathon entry is. Accepting a licence agreement
is a statement by you, so it is not something to automate.

Start at step 1 below.

Two routes, either is fine:
- The **All Products Pack code** from the hackathon registration email.
- **WebStorm is free for non-commercial use** — the download page offers that
  licence directly. Confirm which applies to you on the page; a hackathon entry
  is non-commercial.

---

## Everything else was re-verified on 25 November 2026

Nothing has drifted in two days, so none of it needs redoing:

| Checked | Result |
|---|---|
| Test state | `102 passed, 10 skipped (112)` — exactly what this page predicts |
| Public repo | `github.com/Rizwankhalid675/fearless-cloud9-2026` → 200 signed out |
| Licence | `LICENSE` present at the root |
| Demo site | `rizwankhalid675.github.io/fearless-cloud9-2026/` → 200, titled *Fearless — draft organiser*, bundle loads |
| Demo video | `youtu.be/A_UkgPpzhfM` → public, confirmed via oEmbed with no session |
| Devpost draft | 3/5 steps, story and answers saved per `DEVPOST.md` |

So **one thing stands between this and a submitted entry**, and it is the
mandatory one: *"Build or significantly update a working project using at least
one JetBrains tool."* Until the session below happens, the required multi-select
*"Which JetBrains tools did you use?"* has no truthful answer, and the $1,000
bonus write-up in `JETBRAINS.md` stays the marked-empty scaffold it honestly
says it is. 48 days left.

## The three states, verified on 23 Nov

Knowing these in advance means nothing surprises you mid-session.

| When | Expect |
|---|---|
| **Before touching anything** | `102 passed, 10 skipped (112)` |
| **After un-skipping** | `102 passed, 10 failed` — all 10 listed below |
| **When done** | `112 passed, 0 skipped` |

### The 10 failures you should see, exactly

Dry-run on 23 Nov, then reverted. Six of them are the same error:

```
× gridNav … right and left move by one and stop at the ends
× gridNav … down and up move by a whole row
× gridNav … a move off the end of a ragged last row stays put rather than vanishing
× gridNav … Home and End jump to the first and last champion
× gridNav … an empty pool has nowhere to go
× gridNav … a single column still moves vertically
     → nextIndex is not implemented yet
```

And four DOM ones, each naming its own fix:

```
× a champion is announced as a BUTTON, not as a list item
     → Unable to find an accessible element with the role "button" and name "Lux"
× exactly one champion is in the tab order at a time (roving tabindex)
× the grid names itself for screen readers
     → Unable to find an accessible element with the role "group" and name /champion pool/i
× whose action it is lives in a polite live region
     → Unable to find an accessible element with the role "status"
```

If you see anything **other** than these 10, stop and tell me — it means
something drifted since 23 Nov.

---

## Every line number here was re-verified on 25 November 2026

The brief says to stop if anything differs from 23 Nov. Nothing does — each of
these was checked again rather than assumed:

| Claim | Still true |
|---|---|
| `describe.skip` at lines **21, 63, 97** of `tests/keyboard.test.tsx` | yes, and the line 5 mention is a comment |
| `role="listitem"` has **three** hits, only `PoolGrid.tsx:94` wrong | yes — the others are on a `<div>` and a `<span>` |
| `role="list"` at `PoolGrid.tsx:90` | yes |
| `tests/ui.test.tsx` **79 and 86** are the two `getByRole("listitem", …)` | yes, verbatim |
| `.gitignore` excludes `workspace.xml`, `shelf/`, `usage.statistics.xml`, `httpRequests/` | yes, with the comment saying to commit the rest |
| `docs/img/jetbrains/` exists for the screenshots | yes |
| `nextIndex` still throws, nothing imports it | yes, 36 lines of signature and JSDoc |

## The work, in order

1. **Open the repo**, let indexing finish.
2. **Run → Edit Configurations → + → Vitest**, name it `all tests`, working
   directory = project root. Run it. **📸 Screenshot 1: 102 passed / 10 skipped.**
3. **Un-skip**: `tests/keyboard.test.tsx`, three `describe.skip` → `describe`, at
   **lines 21, 63 and 97**. (A fourth mention on line 5 is a comment — leave it.)
   Run again; expect the 10 above.
4. **`⌘B` from the test's `nextIndex` call** into `src/ui/gridNav.ts`. The stub is
   there with the signature and JSDoc; delete the `void` lines and the `throw`.
   ~15 lines.
5. **Debug the ragged-row case.** Breakpoint on the `ArrowDown` branch,
   `Run → Debug`. **📸 Screenshot 2: debugger stopped, variables pane showing
   `current`, `columns`, `total`.** This is the single strongest piece of evidence
   in the whole write-up.
6. **`Find in Files` for `role="listitem"`** — three hits. Only the one in
   `src/ui/PoolGrid.tsx:94` is wrong; `SeriesBar` and `SuggestionList` put it on a
   `<span>`/`<div>`, which is correct. **📸 Screenshot 3.**
7. **Fix `PoolGrid.tsx`**: drop `role="list"` (line 90) and `role="listitem"`
   (line 94), make the wrapper `role="group" aria-label="Champion pool"`, add the
   roving tabindex and the keydown handler.
8. **Fix `TurnStrip.tsx`**: `role="status"` + `aria-live="polite"` on whose turn
   it is. Leave the clock `aria-live="off"`.
9. **Update two assertions** in `tests/ui.test.tsx` — **lines 79 and 86**,
   `getByRole("listitem", …)` → `getByRole("button", …)`. These two lines are where
   the defect was baked in; changing them *is* the proof. Say so in the write-up.
10. **📸 Screenshot 4: 112 passing.** Then **⌘K**, review the diff in the IDE's
    commit dialog, commit and push from the IDE. **📸 Screenshot 5: the commit
    dialog with the diff.**

Screenshots go in `docs/img/jetbrains/`, which already exists.

---

## Afterwards

```bash
git add .idea && git commit -m "chore: commit WebStorm project files as JetBrains evidence"
```

`.gitignore` already excludes `workspace.xml`, `shelf/`, `usage.statistics.xml`
and `httpRequests/`. **Do not hand-write anything under `.idea/`.**

Then fill **Part 2** of `JETBRAINS.md` from what actually happened — including
something a tool got wrong. A write-up where the tool is flawless reads as
marketing, and the bonus prize is judged on the story.

## Then the Devpost fields

Listed in [`DEVPOST.md`](DEVPOST.md) under "Still to answer". Five become
answerable the moment this session is done; the three eligibility attestations
are yours regardless.

**Junie:** optional. If you have AI Ultimate, give it one scoped task —
"implement `nextIndex` so `tests/keyboard.test.tsx` passes" is ideal, since the
tests define success exactly. If not, answer **No** on the form. That costs
nothing and is honest.
