/**
 * make-demo.ts — build the demo series committed at src/data/demo.json.
 *
 *     npm run demo
 *
 * Run through vite-node rather than bare node: it imports the engine, and
 * vite-node resolves those imports exactly the way the app and the tests do.
 *
 * Three completed games of a best-of-five, then game 4 part-drafted. That is
 * 30 champions burned, which is the state the product exists for and the state
 * a spreadsheet starts losing track of.
 *
 * It is built by running the real engine rather than hand-writing JSON, so the
 * demo cannot drift into a state the rules engine would refuse. If a pick here
 * is illegal, this script fails instead of shipping a lie.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyPick, newDraft } from "../src/engine/draftOrder";
import { completeGame, exportSeries, newSeries } from "../src/engine/series";
import type { SeriesState } from "../contracts";

/** One game, in draft order: ban B R B R B R, pick B R R B B R, ban R B R B, pick R B B R. */
type Game = string[];

const GAMES: Game[] = [
  [
    // bans — none of these carry into later games
    "Jax", "Yone", "Ambessa", "Varus", "Zeri", "LeeSin",
    // picks: blue, red, red, blue, blue, red
    "Aatrox", "KSante", "Sejuani", "Viego", "Azir", "Orianna",
    "Rell", "Taliyah", "Milio", "Hwei",
    // picks: red, blue, blue, red
    "Jinx", "Caitlyn", "Nautilus", "Rakan",
  ],
  [
    // Varus was banned in game 1 and is picked here — bans do not burn.
    "Jax", "Yone", "LeeSin", "Zeri", "Milio", "Hwei",
    "Gnar", "Renekton", "Vi", "Maokai", "Ahri", "Syndra",
    "Rell", "Akali", "Taliyah", "Braum",
    "Ezreal", "Varus", "Leona", "Lulu",
  ],
  [
    // Taliyah was banned in games 1 and 2, and is picked here for the same reason.
    "Jax", "Yone", "LeeSin", "Zeri", "Milio", "Akali",
    "Gwen", "Rumble", "JarvanIV", "MonkeyKing", "Taliyah", "Hwei",
    "Rell", "Poppy", "Camille", "Sett",
    "Ashe", "Kaisa", "Renata", "Braum",
  ],
];

/** Game 4, left mid-draft: six bans in, blue's first pick made. */
const GAME_4_SO_FAR = ["Yone", "Viktor", "Sett", "Camille", "Skarner", "Poppy", "Xayah"];

function play(series: SeriesState, actions: string[]): SeriesState {
  let s = series;
  for (const id of actions) {
    const r = applyPick(s, id);
    if (!r.ok) throw new Error(`demo is not a legal draft: ${id} — ${r.reason}`);
    s = r.series;
  }
  return s;
}

let series = newSeries({ bestOf: 5, ruleset: "fearless" });
for (const actions of GAMES) {
  if (actions.length !== newDraft(1).slots.length) {
    throw new Error(`a game needs ${newDraft(1).slots.length} actions; got ${actions.length}`);
  }
  series = completeGame(play(series, actions));
}
series = play(series, GAME_4_SO_FAR);
series = { ...series, id: "demo-bo5-game-4" };

const burned = new Set(series.games.flatMap((g) => [...g.picks.blue, ...g.picks.red]));
writeFileSync(join(import.meta.dirname, "..", "src", "data", "demo.json"), exportSeries(series));
console.log(
  `demo series: ${series.games.length} games complete, ${burned.size} champions burned, ` +
    `game ${series.current.gameNumber} at action ${series.current.cursor + 1}`,
);
