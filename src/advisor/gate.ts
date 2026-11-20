/**
 * The gate: the ONLY path from an advisor to the screen.
 *
 * Every suggestion any advisor produces goes through here before it is
 * rendered. The gate does not rank, filter, deduplicate or rewrite — it
 * attaches the rules engine's verdict and passes everything on, in order.
 *
 * Suggestions are KEPT when they are illegal rather than dropped. That is the
 * product: a coach needs to see that the advisor wanted Ahri and why Ahri is
 * unavailable, because a suggestion that silently disappears teaches them
 * nothing and looks like the tool is hiding something.
 */

import type { GatedSuggestion, SeriesState, Side, Suggestion } from "../../contracts";
import { legalityOf } from "../engine/fearless";

export function gateSuggestions(
  suggestions: readonly Suggestion[],
  side: Side,
  series: SeriesState,
): GatedSuggestion[] {
  return suggestions.map((s) => ({ ...s, legality: legalityOf(s.championId, side, series) }));
}

export interface GateStats {
  total: number;
  blocked: number;
  /** Blocked because the series already burned the champion. */
  burned: number;
  /** Blocked because the advisor named a champion that does not exist. */
  nonexistent: number;
  legal: number;
}

/**
 * The headline number for docs/RESULTS.md: how much of what an advisor proposed
 * the deterministic gate refused, split by why.
 */
export function gateStats(gated: readonly GatedSuggestion[]): GateStats {
  let burned = 0;
  let nonexistent = 0;
  let legal = 0;
  for (const g of gated) {
    if (g.legality.legal) legal += 1;
    else if (g.legality.burnedIn) burned += 1;
    else if (/no such champion/i.test(g.legality.reason ?? "")) nonexistent += 1;
  }
  return { total: gated.length, blocked: gated.length - legal, burned, nonexistent, legal };
}
