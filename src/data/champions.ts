/**
 * The champion catalogue, read from the snapshot committed at champions.json.
 *
 * Deliberately a committed file rather than a runtime fetch: the demo must work
 * with no network, the video and a judge in January must see the same list, and
 * the rules engine's tests must not change meaning when Riot ships a patch.
 *
 * Regenerate with `npm run champions`.
 */

import type { Champion } from "../../contracts";
import snapshot from "./champions.json";

export const DDRAGON_VERSION: string = snapshot.version;

export const CHAMPIONS: readonly Champion[] = snapshot.champions as Champion[];

const INDEX: ReadonlyMap<string, Champion> = new Map(CHAMPIONS.map((c) => [c.id, c]));

/**
 * Look a champion up by Data Dragon id. Returns undefined for an id that does
 * not exist — which is a real case, not a defensive one: an advisor can invent
 * a champion, and an imported series file can be older than this snapshot.
 * Callers must handle it rather than assert it away.
 */
export function byId(id: string): Champion | undefined {
  return INDEX.get(id);
}

/** Display name for an id, falling back to the id so an unknown one stays visible. */
export function nameOf(id: string): string {
  return INDEX.get(id)?.name ?? id;
}
