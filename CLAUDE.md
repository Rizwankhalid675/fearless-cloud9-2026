# AGENTS.md — rules of engagement for cloud9-jetbrains-2026

Read this before your first edit. Several agents and people are working in this
repository **at the same time**. These rules are what make that possible.

## 1. Lane ownership

You own one lane. Edit only the files in your lane's area.

| Lane | Owner | File area | Status |
|---|---|---|---|
| contracts | integrator | `contracts.ts` | frozen — every lane imports it |
| engine | integrator | `src/engine/**` | frozen — 46 tests and the ground-truth fixtures depend on it |
| advisor | — | `src/advisor/**` | open — but the gate stays the only path to the screen |
| ui | — | `src/ui/**` | open |
| data | — | `src/data/**`, `scripts/fetch-champions.ts` | open — regenerate, never hand-edit `champions.json` |
| docs | — | `README.md`, `docs/**`, `VIDEO.md` | open |

`docs/JETBRAINS.md` is owned by a **person**, not an agent: it is evidence of real
JetBrains use and must not be filled in from anything but what actually happened.

If your work seems to require a file outside your area: **stop and report it**.
Do not "just quickly" fix it. That is how two agents overwrite each other.

## 2. Contracts are read-only

`contracts.ts` defines every type and API shape. Import from it. Never edit it.
Need a change? Ask the integrator, who makes it once and tells everyone.

## 3. Branches

- Your branch: `lane/<owner>-<feature>`. Never commit to `main`.
- Merge to `main` by PR, through the integrator only.
- `main` must build at every moment.

## 4. Before you hand off

```bash
npm run typecheck && npm test && npm run build
```

A lane that does not build does not land.

Hand off in three sentences: what landed, what is stubbed, what you did not do.

## 5. Quality bar for this event

- Any LLM output gets a **deterministic check** around it and leaves **evidence**
  (what it saw, a hash, a quote). "The model said so" is not a result.
- Instrument **one measurable number** in your lane for the results table.
- A narrow working path beats a broad broken one. The demo needs one path.

## 6. Do not

- Do not refactor outside your lane.
- Do not upgrade dependencies.
- Do not change the demo seed data (`demo/seed/**`) — the demo must stay reproducible.
- Do not add a feature after the freeze (T-90 minutes).
