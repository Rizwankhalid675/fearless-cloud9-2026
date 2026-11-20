/**
 * fetch-champions.ts — build the champion snapshot committed at src/data/champions.json.
 *
 * Run once, by hand, and commit the result:
 *
 *     npm run champions
 *
 * The snapshot is committed rather than fetched at runtime, for three reasons:
 * the demo must work with no network, a judge in January must see the same
 * champion list the video shows, and the rules engine's tests must not change
 * meaning when Riot ships a patch.
 *
 * Source: Riot's Data Dragon, the static data Riot publishes for community
 * tools. No API key, no rate limit, no authentication.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Champion, Role } from "../contracts";

const VERSIONS = "https://ddragon.leagueoflegends.com/api/versions.json";

/**
 * Data Dragon tags are a rough classification, not a position list: it tags
 * Lux "Mage,Support" and Teemo "Marksman,Assassin". We widen each tag to the
 * positions it plausibly implies and take the union, which makes `roles` a
 * filter that narrows the pool without hiding a legal pick. It is NOT ground
 * truth about where a champion is played — see docs/LIMITS.md.
 */
const TAG_ROLES: Record<string, Role[]> = {
  Marksman: ["bot"],
  Support: ["support"],
  Tank: ["top", "support"],
  Fighter: ["top", "jungle"],
  Assassin: ["mid", "jungle"],
  Mage: ["mid", "support"],
};

interface DDragonChampion {
  id: string;
  name: string;
  tags: string[];
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  const versions = await getJson<string[]>(VERSIONS);
  const version = versions[0];
  if (!version) throw new Error("Data Dragon returned no versions");

  const payload = await getJson<{ data: Record<string, DDragonChampion> }>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
  );

  const champions: Champion[] = Object.values(payload.data)
    .map((c) => {
      const roles = [...new Set(c.tags.flatMap((t) => TAG_ROLES[t] ?? []))];
      return {
        id: c.id,
        name: c.name,
        // A champion whose tags map to nothing still has to be pickable, so it
        // gets every role rather than none — an empty list would hide it behind
        // any role filter.
        roles: (roles.length ? roles : (["top", "jungle", "mid", "bot", "support"] as Role[])).sort(),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const out = join(import.meta.dirname, "..", "src", "data", "champions.json");
  writeFileSync(out, JSON.stringify({ version, champions }, null, 2) + "\n");
  console.log(`wrote ${champions.length} champions at patch ${version} -> ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
