/**
 * The priority-sheet advisor. Offline, deterministic, no API key.
 *
 * It ranks champions by a static tier list and by which roles this side still
 * needs, and it does NOT consult the legal pool. That is deliberate: this is a
 * faithful model of the artefact Fearless replaces — a coach's priority sheet,
 * which knows which champions are strong and nothing at all about what the
 * series has already burned.
 *
 * So by game 3 it proposes champions that are gone, the gate catches them, and
 * the demo shows the whole mechanism with no network and no key. The number in
 * docs/RESULTS.md is how often that happens.
 */

import type { Role, SeriesState, Side, Suggestion } from "../../contracts";
import { ROLES } from "../../contracts";
import { CHAMPIONS, nameOf } from "../data/champions";
import type { Advisor } from "./types";
import tierData from "../data/tiers.json";

const TIERS = tierData.tiers as Record<string, number>;
const DEFAULT_TIER = 4;

const CONFIDENCE: Record<number, number> = { 1: 0.9, 2: 0.75, 3: 0.6, 4: 0.4 };

function tierOf(championId: string): number {
  return TIERS[championId] ?? DEFAULT_TIER;
}

/**
 * Roles this side has not covered yet, judged by the roles of what it has
 * picked. Approximate — a champion's roles are a filter, not ground truth —
 * and good enough to stop the advisor proposing a fifth mid laner.
 */
export function rolesStillNeeded(side: Side, series: SeriesState): Role[] {
  const covered = new Set<Role>();
  for (const slot of series.current.slots) {
    if (slot.kind !== "pick" || slot.side !== side || slot.championId === null) continue;
    const champ = CHAMPIONS.find((c) => c.id === slot.championId);
    for (const r of champ?.roles ?? []) covered.add(r);
  }
  return ROLES.filter((r) => !covered.has(r));
}

export const tierAdvisor: Advisor = {
  name: "priority sheet (offline)",
  poolAware: false,

  async suggest(side, series, n) {
    const needed = new Set(rolesStillNeeded(side, series));
    const ranked = [...CHAMPIONS]
      .map((c) => {
        const tier = tierOf(c.id);
        const fills = c.roles.some((r) => needed.has(r));
        // Tier dominates; role need breaks within half a tier, which is how a
        // priority sheet is actually read.
        return { champion: c, tier, fills, score: tier * 10 - (fills ? 5 : 0) };
      })
      .sort((a, b) => a.score - b.score || a.champion.id.localeCompare(b.champion.id))
      .slice(0, n);

    return ranked.map<Suggestion>(({ champion, tier, fills }) => ({
      championId: champion.id,
      rationale: fills
        ? `Tier ${tier} and fills ${champion.roles.filter((r) => needed.has(r)).join("/")}, which ${side} has not covered.`
        : `Tier ${tier} on the priority sheet.`,
      confidence: CONFIDENCE[tier] ?? 0.4,
    }));
  },
};

/** Every id the tier list mentions, for the test that pins them to the catalogue. */
export const TIER_IDS: readonly string[] = Object.keys(TIERS);

export { nameOf };
