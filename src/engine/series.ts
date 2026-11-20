/**
 * Series state: starting one, filing a finished game, and the export/import
 * that lets a coach survive a laptop dying between games.
 *
 * Import is deliberately paranoid. A series file is the one thing in this
 * product that arrives from outside it — written by an older build, hand-edited,
 * or copied out of a chat — and a draft board that crashes between games is
 * worse than no draft board. Every problem found is reported; none throws.
 */

import type { DraftState, GameRecord, Ruleset, SeriesState, Side } from "../../contracts";
import { ROLES, SIDES } from "../../contracts";
import { DDRAGON_VERSION, byId } from "../data/champions";
import { DRAFT_ORDER, isComplete, newDraft } from "./draftOrder";

const FORMAT = "fearless-series";
const FORMAT_VERSION = 1;
const RULESETS: readonly Ruleset[] = ["fearless", "team-fearless"];

export function newSeries(opts: { bestOf: number; ruleset: Ruleset }): SeriesState {
  return {
    id: `series-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ruleset: opts.ruleset,
    bestOf: opts.bestOf,
    games: [],
    current: newDraft(1),
  };
}

/**
 * File the finished draft as a completed game and open the next one.
 *
 * Throws on an unfinished draft, because this is called from a button the UI
 * only enables when the draft is complete — a silent no-op there would hide a
 * bug rather than surface it.
 */
export function completeGame(series: SeriesState): SeriesState {
  if (!isComplete(series.current)) {
    throw new Error(`Game ${series.current.gameNumber}'s draft is not complete.`);
  }

  const record: GameRecord = {
    gameNumber: series.current.gameNumber,
    picks: { blue: [], red: [] },
    bans: { blue: [], red: [] },
  };
  for (const slot of series.current.slots) {
    if (slot.championId === null) continue;
    const bucket = slot.kind === "pick" ? record.picks : record.bans;
    bucket[slot.side].push(slot.championId);
  }

  return {
    ...series,
    games: [...series.games, record],
    current: newDraft(series.current.gameNumber + 1),
  };
}

export function exportSeries(series: SeriesState): string {
  return (
    JSON.stringify(
      {
        format: FORMAT,
        formatVersion: FORMAT_VERSION,
        // Which champion snapshot this was written against. An import against a
        // different patch still works; this is what makes the difference visible.
        ddragonVersion: DDRAGON_VERSION,
        exportedAt: new Date().toISOString(),
        series,
      },
      null,
      2,
    ) + "\n"
  );
}

type Problems = string[];

function checkDraft(draft: unknown, label: string, problems: Problems): DraftState | null {
  if (typeof draft !== "object" || draft === null) {
    problems.push(`${label}: missing.`);
    return null;
  }
  const d = draft as Record<string, unknown>;
  if (!Array.isArray(d.slots)) {
    problems.push(`${label}: has no slots.`);
    return null;
  }
  if (d.slots.length !== DRAFT_ORDER.length) {
    problems.push(`${label}: has ${d.slots.length} slots; a draft has ${DRAFT_ORDER.length}.`);
  }
  d.slots.forEach((slot: unknown, i) => {
    const s = slot as Record<string, unknown>;
    if (s?.kind !== "pick" && s?.kind !== "ban") problems.push(`${label} slot ${i + 1}: kind is "${String(s?.kind)}".`);
    if (!SIDES.includes(s?.side as Side)) problems.push(`${label} slot ${i + 1}: side is "${String(s?.side)}".`);
    if (s?.championId !== null && typeof s?.championId !== "string") {
      problems.push(`${label} slot ${i + 1}: championId is neither a string nor null.`);
    } else if (typeof s.championId === "string" && !byId(s.championId)) {
      problems.push(`${label} slot ${i + 1}: "${s.championId}" is no such champion at patch ${DDRAGON_VERSION}.`);
    }
  });
  if (typeof d.cursor !== "number" || d.cursor < 0 || d.cursor > DRAFT_ORDER.length) {
    problems.push(`${label}: cursor is "${String(d.cursor)}".`);
  }
  if (typeof d.gameNumber !== "number") problems.push(`${label}: gameNumber is "${String(d.gameNumber)}".`);
  return problems.length ? null : (draft as DraftState);
}

/**
 * Parse a series file. Returns every problem found rather than the first, so a
 * coach fixing a hand-edited file sees the whole list in one pass.
 */
export function importSeries(
  json: string,
): { ok: true; series: SeriesState } | { ok: false; problems: Problems } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, problems: ["That file is not valid JSON."] };
  }

  const problems: Problems = [];
  const root = parsed as Record<string, unknown>;
  if (root?.format !== FORMAT) {
    return { ok: false, problems: [`That is not a Fearless series file (format: "${String(root?.format)}").`] };
  }
  if (root.formatVersion !== FORMAT_VERSION) {
    problems.push(`Series file format version ${String(root.formatVersion)}; this build reads version ${FORMAT_VERSION}.`);
  }

  const s = root.series as Record<string, unknown> | undefined;
  if (typeof s !== "object" || s === null) {
    return { ok: false, problems: ["That file has no series in it."] };
  }

  if (typeof s.id !== "string" || !s.id) problems.push("The series has no id.");
  if (!RULESETS.includes(s.ruleset as Ruleset)) {
    problems.push(`Unknown ruleset "${String(s.ruleset)}"; this build knows ${RULESETS.join(" and ")}.`);
  }
  if (typeof s.bestOf !== "number" || s.bestOf < 1) problems.push(`bestOf is "${String(s.bestOf)}".`);

  if (!Array.isArray(s.games)) {
    problems.push("The series has no games array.");
  } else {
    s.games.forEach((g: unknown, i) => {
      const rec = g as Record<string, unknown>;
      const label = `Game ${typeof rec?.gameNumber === "number" ? rec.gameNumber : i + 1}`;
      if (typeof rec?.gameNumber !== "number") problems.push(`${label}: gameNumber is "${String(rec?.gameNumber)}".`);
      for (const field of ["picks", "bans"] as const) {
        const group = rec?.[field] as Record<string, unknown> | undefined;
        if (typeof group !== "object" || group === null) {
          problems.push(`${label}: no ${field}.`);
          continue;
        }
        for (const side of SIDES) {
          const ids = group[side];
          if (!Array.isArray(ids)) {
            problems.push(`${label}: ${side} ${field} is not a list.`);
            continue;
          }
          for (const id of ids) {
            if (typeof id !== "string") {
              problems.push(`${label}: a ${side} ${field.slice(0, -1)} is not a champion id.`);
            } else if (!byId(id)) {
              problems.push(`${label}: "${id}" is no such champion at patch ${DDRAGON_VERSION}.`);
            }
          }
        }
      }
    });
  }

  checkDraft(s.current, `Game ${String((s.current as Record<string, unknown>)?.gameNumber ?? "?")}'s draft`, problems);

  if (problems.length) return { ok: false, problems };
  return { ok: true, series: s as unknown as SeriesState };
}

/** Re-exported so the UI has one import for the engine's vocabulary. */
export { ROLES, SIDES };
