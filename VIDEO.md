# Demo video — under 3 minutes, public on YouTube

The judging criterion is "Does the video clearly demonstrate the project working end-to-end?"
So: no slides, no architecture diagram, no talking head. The board, doing the thing.

**Hard limit: 3:00. Target 2:15.**

## Shot list

| Time | On screen | Said |
|---|---|---|
| 0:00–0:12 | Empty board, game 1, 173 champions available. | "Fearless Draft bans every champion used in earlier games of the series. By game five a coach is tracking fifty unavailable champions on a thirty-second timer. They do it in a spreadsheet." |
| 0:12–0:25 | Click **Load a demo series**. Board jumps to game 4. | "Three games in. Thirty champions burned." |
| 0:25–0:45 | Slow scroll of the pool. Struck-through names, coloured G1/G2/G3 chips. Hold on the count: *136 available, 37 gone*. | "Nothing disappears. Every burned champion stays on the board with the game that took it — because a pool that silently shrinks is the spreadsheet problem again." |
| 0:45–1:10 | Click **Ask the advisor**. Panel fills. Hold on *4 of 5 blocked by the rules engine*. | "The advisor proposes. It has no idea what's legal — it's a priority sheet, exactly like the one a coach actually uses. Four of its five suggestions are already burned." |
| 1:10–1:30 | Zoom on one blocked row: *Aatrox is burned — blue picked it in game 1.* struck through, G1 chip. | "Deterministic code caught every one, and said which game took it. The model proposes; the rules engine decides." |
| 1:30–1:45 | Type `amb`, press Enter. Ambessa locks into red's pick. Clock starts. | "Type to search, Enter to lock. Nobody hunts for a text field on a thirty-second timer." |
| 1:45–2:00 | Export series, reload the page, import it. Same state returns. | "Series state exports and reimports, so a dead laptop between games costs nothing." |
| 2:00–2:15 | `npm test` in a terminal: 102 passing. Then `docs/RESULTS.md`: 10/10 exact, 21/50 blocked. | "The engine matches hand-computed ground truth on ten series states. Across them the gate refused twenty-one of fifty suggestions." |

## Checklist before upload

- [ ] Under 3:00
- [ ] 1920×1080, board at a readable zoom — the pool grid text is 15px, so no shrinking
- [ ] No API key visible on screen at any point
- [ ] Public on YouTube, not unlisted
- [ ] Captions (auto-generated is fine, corrected for champion names)
- [ ] Linked from the Devpost submission and from README.md
