/**
 * contracts.ts — FROZEN. Owned by the integrator.
 *
 * This file exists so that many agents can build in parallel without
 * colliding. Every lane imports from here. No lane edits it.
 *
 * Need a change? Ask the integrator. They change it once, then tell every lane.
 */

// ---------------------------------------------------------------- domain types

/** The five positions. A convenience filter for the pool grid, not ground truth. */
export type Role = "top" | "jungle" | "mid" | "bot" | "support";

export type Side = "blue" | "red";

export const SIDES: readonly Side[] = ["blue", "red"] as const;

export const ROLES: readonly Role[] = ["top", "jungle", "mid", "bot", "support"] as const;

/**
 * Which Fearless variant a series is played under. Leagues differ, so this is a
 * property of the series and never a constant in the engine.
 *
 * - `fearless`       a champion picked in an earlier game is unavailable to BOTH teams
 * - `team-fearless`  it is unavailable only to the team that picked it
 *
 * Bans never carry across games under either variant.
 */
export type Ruleset = "fearless" | "team-fearless";

export interface Champion {
  /** Data Dragon key, e.g. "Ahri", "MonkeyKing". Stable across patches. */
  id: string;
  /** Display name, e.g. "Ahri", "Wukong". */
  name: string;
  roles: Role[];
}

/** A finished game of the series. Its picks are what burn champions. */
export interface GameRecord {
  /** 1-based. */
  gameNumber: number;
  picks: Record<Side, string[]>;
  bans: Record<Side, string[]>;
}

export interface DraftSlot {
  kind: "pick" | "ban";
  side: Side;
  /** null until this slot is filled. */
  championId: string | null;
}

/** The game currently being drafted. */
export interface DraftState {
  gameNumber: number;
  /** 20 slots in tournament order. Append-only once created. */
  slots: DraftSlot[];
  /** Index of the slot being filled; === slots.length when the draft is done. */
  cursor: number;
}

export interface SeriesState {
  id: string;
  ruleset: Ruleset;
  bestOf: number;
  /** Completed games, in order. */
  games: GameRecord[];
  current: DraftState;
}

// ------------------------------------------------- the only authority on legality
// The rules engine produces these. No UI component and no advisor may compute
// availability itself — they ask, and they render what they are told.

export interface Legality {
  legal: boolean;
  /** Human-readable, shown verbatim in the UI. Present whenever legal is false. */
  reason?: string;
  /** Where the champion was burned, when that is why it is illegal. */
  burnedIn?: { gameNumber: number; side: Side };
}

// --------------------------------------------------- evidence + determinism
// Any claim produced by a model must carry evidence a human can check.

export interface Suggestion {
  championId: string;
  rationale: string;
  /** 0..1, as reported by the advisor. Never used to override legality. */
  confidence: number;
}

export type GatedSuggestion = Suggestion & { legality: Legality };

// --------------------------------------------------------------- the metric

export interface RunMetrics {
  runId: string;
  label: string;        // "heuristic advisor", "llm advisor"
  startedAt: string;
  finishedAt: string;
  /** The headline number. Named after the real-world unit, not "score". */
  headline: { name: string; value: number; unit: string };
  passed: number;
  failed: number;
  costUsd?: number;
}
