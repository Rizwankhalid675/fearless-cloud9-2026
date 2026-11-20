/** Builders for series fixtures. Keeps the engine's tests about rules, not shapes. */

import type { DraftSlot, DraftState, GameRecord, Ruleset, SeriesState, Side } from "../contracts";

export function game(
  gameNumber: number,
  picks: Partial<Record<Side, string[]>>,
  bans: Partial<Record<Side, string[]>> = {},
): GameRecord {
  return {
    gameNumber,
    picks: { blue: picks.blue ?? [], red: picks.red ?? [] },
    bans: { blue: bans.blue ?? [], red: bans.red ?? [] },
  };
}

export function draft(gameNumber: number, slots: DraftSlot[] = []): DraftState {
  return { gameNumber, slots, cursor: slots.filter((s) => s.championId !== null).length };
}

export function series(opts: {
  ruleset?: Ruleset;
  bestOf?: number;
  games?: GameRecord[];
  current?: DraftState;
} = {}): SeriesState {
  const games = opts.games ?? [];
  return {
    id: "test-series",
    ruleset: opts.ruleset ?? "fearless",
    bestOf: opts.bestOf ?? 5,
    games,
    current: opts.current ?? draft(games.length + 1),
  };
}
