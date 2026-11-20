/**
 * The rules engine. The ONLY authority on whether a champion may be taken.
 *
 * No UI component and no advisor computes availability itself — they call
 * `legalityOf` or `legalPool` and render what they are told. That is the whole
 * architecture: a model proposes, this file decides.
 *
 * Pure. No clock, no network, no React, no storage. Every function is a
 * function of its arguments, which is why it can be tested exhaustively.
 */

import type { Champion, Legality, SeriesState, Side } from "../../contracts";
import { CHAMPIONS, DDRAGON_VERSION, byId } from "../data/champions";

/** Where a champion was burned. */
export interface Burn {
  gameNumber: number;
  side: Side;
}

/**
 * Every champion unavailable to `side` because of a PREVIOUS game of the series,
 * mapped to the burn that explains it.
 *
 * Only picks burn. Bans do not carry across games under either ruleset — a ban
 * removes a champion from one game, which is the point of banning it.
 *
 * Under `fearless` a pick by either team burns it for both. Under
 * `team-fearless` it burns only for the team that picked it. Which of the two
 * applies is a property of the series, because leagues differ; it is never a
 * constant in here.
 *
 * Where a champion appears in more than one game — impossible under the rules,
 * but an imported file can say it — the EARLIEST burn is kept, because that is
 * the one that explains why it became unavailable.
 */
export function burnedChampions(series: SeriesState, side: Side): Map<string, Burn> {
  const burned = new Map<string, Burn>();
  const games = [...series.games].sort((a, b) => a.gameNumber - b.gameNumber);

  for (const g of games) {
    for (const pickedBy of ["blue", "red"] as const) {
      if (series.ruleset === "team-fearless" && pickedBy !== side) continue;
      for (const id of g.picks[pickedBy]) {
        if (!burned.has(id)) burned.set(id, { gameNumber: g.gameNumber, side: pickedBy });
      }
    }
  }
  return burned;
}

/**
 * Whether `side` may take `championId` right now.
 *
 * Reasons are ordered by what a coach most needs to know: a champion that does
 * not exist at all, then the series burn (the thing this product is for, and
 * the thing a spreadsheet gets wrong), then the current game.
 */
export function legalityOf(championId: string, side: Side, series: SeriesState): Legality {
  const champion = byId(championId);
  if (!champion) {
    return {
      legal: false,
      reason: `"${championId}" is no such champion at patch ${DDRAGON_VERSION}.`,
    };
  }

  const burn = burnedChampions(series, side).get(championId);
  if (burn) {
    return {
      legal: false,
      reason: `${champion.name} is burned — ${burn.side} picked it in game ${burn.gameNumber}.`,
      burnedIn: burn,
    };
  }

  const taken = series.current.slots.find((s) => s.championId === championId);
  if (taken) {
    const verb = taken.kind === "ban" ? "banned" : "picked";
    return {
      legal: false,
      reason: `${champion.name} was already ${verb} by ${taken.side} in this game.`,
    };
  }

  return { legal: true };
}

/**
 * Every champion `side` may take right now, in catalogue order.
 *
 * Derived from `legalityOf` rather than reimplementing it, so the grid and the
 * gate can never disagree about what is legal.
 */
export function legalPool(side: Side, series: SeriesState): Champion[] {
  return CHAMPIONS.filter((c) => legalityOf(c.id, side, series).legal);
}
