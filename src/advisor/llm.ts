/**
 * The optional model-backed advisor.
 *
 * Deliberately unvalidated: it does NOT check that the champions it returns
 * exist or are legal. If it did, the gate would stop being the thing that keeps
 * the product honest, and the one failure mode worth demonstrating — a model
 * confidently naming a champion that is burned, or one that was never real —
 * would be hidden inside this file instead of shown on screen.
 *
 * The key is typed into the UI by the coach and held in memory for the session.
 * It is never written to disk, never committed, and never sent anywhere except
 * Anthropic's own endpoint.
 */

import type { SeriesState, Side, Suggestion } from "../../contracts";
import { CHAMPIONS } from "../data/champions";
import { legalPool } from "../engine/fearless";
import type { Advisor } from "./types";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5-5";

export interface LlmOptions {
  apiKey: string;
  model?: string;
  /**
   * Whether to tell the model what is still legal.
   *
   * Off by default, which is the honest demonstration: the model is asked for
   * the best picks and the gate catches what it cannot have. On, it is given
   * the pool and should propose legally — the gate still checks, because
   * "should" is not "does".
   */
  tellItThePool?: boolean;
}

export function buildPrompt(side: Side, series: SeriesState, n: number, tellItThePool: boolean): string {
  const taken = series.current.slots
    .filter((s) => s.championId !== null)
    .map((s) => `${s.side} ${s.kind}: ${s.championId}`);
  const history = series.games.map(
    (g) => `game ${g.gameNumber} picks — blue: ${g.picks.blue.join(", ")}; red: ${g.picks.red.join(", ")}`,
  );

  return [
    `You are advising the ${side} side in a League of Legends ${series.ruleset} draft, game ${series.current.gameNumber} of a best-of-${series.bestOf}.`,
    history.length ? `Earlier games in this series:\n${history.join("\n")}` : "This is game 1 of the series.",
    taken.length ? `Already taken this game:\n${taken.join("\n")}` : "Nothing taken yet this game.",
    tellItThePool
      ? `Champions still legal (choose only from these):\n${legalPool(side, series).map((c) => c.id).join(", ")}`
      : "",
    `Propose the ${n} best champions for ${side}'s next action.`,
    `Reply with JSON only: {"suggestions":[{"championId":"...","rationale":"one sentence","confidence":0.0}]}`,
    `Use Data Dragon champion ids (for example "MonkeyKing", not "Wukong").`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Pull suggestions out of a model reply.
 *
 * Tolerant of prose around the JSON and of a fenced code block, because models
 * add both. Returns [] rather than throwing on anything it cannot read — an
 * advisor that fails is an advisor with no suggestions, not a broken board.
 */
export function parseAdvisorResponse(text: string): Suggestion[] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }

  const list = (parsed as { suggestions?: unknown }).suggestions;
  if (!Array.isArray(list)) return [];

  return list.flatMap((raw): Suggestion[] => {
    const s = raw as Record<string, unknown>;
    if (typeof s?.championId !== "string" || !s.championId) return [];
    const confidence = typeof s.confidence === "number" ? Math.min(1, Math.max(0, s.confidence)) : 0.5;
    return [
      {
        championId: s.championId,
        rationale: typeof s.rationale === "string" ? s.rationale : "(no rationale given)",
        confidence,
      },
    ];
  });
}

export function llmAdvisor(opts: LlmOptions): Advisor {
  const model = opts.model ?? DEFAULT_MODEL;
  const tellItThePool = opts.tellItThePool ?? false;

  return {
    name: `${model}${tellItThePool ? " (given the pool)" : ""}`,
    poolAware: tellItThePool,

    async suggest(side, series, n) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": opts.apiKey,
          "anthropic-version": "2023-06-01",
          // This is a local tool run by one coach with their own key; there is
          // no server to proxy through. Noted in docs/LIMITS.md.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [{ role: "user", content: buildPrompt(side, series, n, tellItThePool) }],
        }),
      });

      if (!res.ok) throw new Error(`Advisor returned ${res.status} ${res.statusText}`);
      const body = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (body.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
      return parseAdvisorResponse(text);
    },
  };
}

/** Every champion id, for the UI's "what did it invent?" display. */
export const KNOWN_IDS: ReadonlySet<string> = new Set(CHAMPIONS.map((c) => c.id));
