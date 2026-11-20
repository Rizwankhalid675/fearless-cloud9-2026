/** Builders for series fixtures. Keeps the engine's tests about rules, not shapes. */

import type { DraftSlot, DraftState, GameRecord, Ruleset, SeriesState, Side } from "../contracts";
import { newDraft } from "../src/engine/draftOrder";

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

/**
 * A draft whose FIRST slots are already filled as given, the rest empty — so a
 * test can say "Ahri is already banned this game" without listing 20 slots.
 * Pass nothing for an untouched 20-slot draft.
 */
export function draft(gameNumber: number, filled: DraftSlot[] = []): DraftState {
  const d = newDraft(gameNumber);
  return {
    ...d,
    slots: [...filled, ...d.slots.slice(filled.length)],
    cursor: filled.length,
  };
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
    current: opts.current ?? newDraft(games.length + 1),
  };
}
