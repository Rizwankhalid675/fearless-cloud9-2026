# Demo runbook

The demo is one path. It needs no network, no API key and no sign-in, and it starts from a
committed fixture so it is the same every time.

Live, nothing to install: <https://rizwankhalid675.github.io/fearless-cloud9-2026/>

Or locally:

```bash
npm install && npm run dev
```

Either way: open the board and press **Load a demo series**. That is the whole setup.

## The 90-second beat sheet

| # | Beat | On screen | The point |
|---|---|---|---|
| 1 | Open on game 1 | Empty board, 173 champions available, clock paused | A draft board, nothing special yet |
| 2 | Load the demo series | Jumps to game 4 of 5, three games complete | Three games in, 30 champions burned |
| 3 | Scroll the pool | Struck-through names with coloured G1/G2/G3 chips; count reads 136 available, 37 gone | Nothing disappears — every burn names the game that took it |
| 4 | Ask the advisor | Panel fills; banner reads 4 of 5 blocked by the rules engine | The advisor has no idea what is legal |
| 5 | Read one blocked row | "Aatrox is burned — blue picked it in game 1", struck through, G1 chip | The model proposes, deterministic code decides |
| 6 | Type `amb`, press Enter | Ambessa locks into red's pick; clock starts | Built for a 30-second timer |
| 7 | Export, reload, import | Same state returns | A dead laptop between games costs nothing |
| 8 | `npm test` | 102 passing | The engine is not asserted, it is tested |

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Board loads but the pool is empty | `src/data/champions.json` missing | `npm run champions` (needs network), or `git checkout src/data/champions.json` |
| **Load a demo series** is not shown | The button only appears on an untouched series | Reload the page |
| Suggestions panel shows an error | The model advisor is selected without a valid key | Untick "Use a model instead of the priority sheet" |
| Clock reads 0:00 | It was left running | Press **Start clock**, or reload |

## What not to demo

- The model advisor, unless a key is to hand and the network is reliable. The offline
  priority sheet makes the same point and cannot fail.
- Importing a hand-edited file. It is handled, and the problem list is good, but it is not
  the story.
