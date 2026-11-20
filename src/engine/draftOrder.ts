/**
 * The draft-order state machine: which slot is being filled, and what happens
 * when a champion is locked into it.
 *
 * This file does not decide legality. It asks `fearless.ts` and reports the
 * answer verbatim, so there is exactly one place in the codebase that knows
 * what "legal" means.
 */

import type { DraftSlot, DraftState, Role, SeriesState, Side } from "../../contracts";
import { legalPool, legalityOf } from "./fearless";

type Phase = readonly [kind: DraftSlot["kind"], sides: string];

/**
 * Tournament draft, 20 slots. Read as pairs of (kind, sides in order):
 *
 *   ban   B R B R B R      first ban phase, three each, blue first
 *   pick  B R R B B R      first pick phase — blue's single first pick is why
 *                         first pick is worth something
 *   ban   R B R B          second ban phase, two each, red first
 *   pick  R B B R          second pick phase
 */
const PHASES: readonly Phase[] = [
  ["ban", "BRBRBR"],
  ["pick", "BRRBBR"],
  ["ban", "RBRB"],
  ["pick", "RBBR"],
];

export const DRAFT_ORDER: readonly { kind: DraftSlot["kind"]; side: Side }[] = PHASES.flatMap(
  ([kind, sides]) => [...sides].map((c) => ({ kind, side: (c === "B" ? "blue" : "red") as Side })),
);

export function newDraft(gameNumber: number): DraftState {
  return {
    gameNumber,
    slots: DRAFT_ORDER.map((s) => ({ ...s, championId: null })),
    cursor: 0,
  };
}

/** The slot waiting to be filled, or null once the draft is done. */
export function currentSlot(draft: DraftState): DraftSlot | null {
  return draft.slots[draft.cursor] ?? null;
}

export function isComplete(draft: DraftState): boolean {
  return draft.cursor >= draft.slots.length;
}

/**
 * Lock a champion into the current slot.
 *
 * Returns a NEW series — never mutates the one it was given, so React state and
 * the undo history stay honest. On refusal it passes the engine's own reason
 * straight through; it does not write its own, because then two strings would
 * have to be kept in step.
 */
export function applyPick(
  series: SeriesState,
  championId: string,
): { ok: true; series: SeriesState } | { ok: false; reason: string } {
  const slot = currentSlot(series.current);
  if (!slot) return { ok: false, reason: `Game ${series.current.gameNumber}'s draft is complete.` };

  const legality = legalityOf(championId, slot.side, series);
  if (!legality.legal) {
    return { ok: false, reason: legality.reason ?? `${championId} is not available.` };
  }

  const slots = series.current.slots.map((s, i) =>
    i === series.current.cursor ? { ...s, championId } : s,
  );
  return {
    ok: true,
    series: { ...series, current: { ...series.current, slots, cursor: series.current.cursor + 1 } },
  };
}

/**
 * How much of a role is left for a side.
 *
 * `exhausted` exists so the board can say "no support left" rather than render
 * an empty grid, which late in a Bo5 is a reachable state and looks like a bug.
 */
export function poolStatus(
  role: Role,
  side: Side,
  series: SeriesState,
): { exhausted: boolean; remaining: number } {
  const remaining = legalPool(side, series).filter((c) => c.roles.includes(role)).length;
  return { exhausted: remaining === 0, remaining };
}
