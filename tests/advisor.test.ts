import { describe, expect, test } from "vitest";
import { TIER_IDS, rolesStillNeeded, tierAdvisor } from "../src/advisor/tier";
import { buildPrompt, parseAdvisorResponse } from "../src/advisor/llm";
import { gateSuggestions, gateStats } from "../src/advisor/gate";
import { CHAMPIONS } from "../src/data/champions";
import { draft, game, series } from "./helpers";

describe("the tier list", () => {
  test("every id it mentions is a real champion", () => {
    // Catches the classic typo: "Jarvan" is not an id, "JarvanIV" is.
    const known = new Set(CHAMPIONS.map((c) => c.id));
    expect(TIER_IDS.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe("the priority-sheet advisor", () => {
  test("returns the number of suggestions asked for", async () => {
    expect(await tierAdvisor.suggest("blue", series(), 5)).toHaveLength(5);
  });

  test("is deterministic: same series, same suggestions", async () => {
    const s = series({ games: [game(1, { blue: ["Ahri"] })] });
    expect(await tierAdvisor.suggest("blue", s, 6)).toEqual(await tierAdvisor.suggest("blue", s, 6));
  });

  test("declares itself pool-blind", () => {
    expect(tierAdvisor.poolAware).toBe(false);
  });

  test("prefers champions filling a role this side has not covered", async () => {
    const [first] = await tierAdvisor.suggest("blue", series(), 1);
    expect(first?.rationale).toMatch(/has not covered/);
  });

  test("rolesStillNeeded shrinks as a side picks", () => {
    const s = series();
    expect(rolesStillNeeded("blue", s)).toHaveLength(5);
    const withMid = series({
      current: draft(1, [
        ...Array.from({ length: 6 }, (_, i) => ({
          kind: "ban" as const,
          side: i % 2 === 0 ? ("blue" as const) : ("red" as const),
          championId: CHAMPIONS[i]!.id,
        })),
        { kind: "pick" as const, side: "blue" as const, championId: "Ahri" },
      ]),
    });
    // Ahri is jungle/mid in the snapshot, so both drop out.
    expect(rolesStillNeeded("blue", withMid)).toEqual(["top", "bot", "support"]);
  });

  test("being pool-blind, it proposes burned champions — and the gate catches them", async () => {
    // Burn the whole top of the priority sheet in game 1, which is exactly what
    // a Fearless series does to a static sheet.
    const top = await tierAdvisor.suggest("blue", series(), 10);
    const s = series({
      games: [game(1, { blue: top.slice(0, 5).map((x) => x.championId), red: top.slice(5, 10).map((x) => x.championId) })],
    });
    const again = await tierAdvisor.suggest("blue", s, 10);
    const stats = gateStats(gateSuggestions(again, "blue", s));
    expect(stats.blocked).toBeGreaterThan(0);
    expect(stats.burned).toBe(stats.blocked);
  });
});

describe("the model-backed advisor", () => {
  test("parses a clean JSON reply", () => {
    const out = parseAdvisorResponse('{"suggestions":[{"championId":"Ahri","rationale":"blind safe","confidence":0.8}]}');
    expect(out).toEqual([{ championId: "Ahri", rationale: "blind safe", confidence: 0.8 }]);
  });

  test("parses JSON wrapped in prose and a code fence", () => {
    const out = parseAdvisorResponse(
      'Here you go:\n```json\n{"suggestions":[{"championId":"Lux","rationale":"poke","confidence":0.6}]}\n```\nHope that helps.',
    );
    expect(out.map((s) => s.championId)).toEqual(["Lux"]);
  });

  test("keeps a champion that does not exist, so the gate can be the one to refuse it", () => {
    const out = parseAdvisorResponse('{"suggestions":[{"championId":"Mordekaisor","rationale":"x","confidence":0.9}]}');
    expect(out.map((s) => s.championId)).toEqual(["Mordekaisor"]);
  });

  test("drops an entry with no champion id, and fills a missing rationale", () => {
    const out = parseAdvisorResponse('{"suggestions":[{"rationale":"no id"},{"championId":"Zed"}]}');
    expect(out).toEqual([{ championId: "Zed", rationale: "(no rationale given)", confidence: 0.5 }]);
  });

  test("clamps a confidence outside 0..1", () => {
    const out = parseAdvisorResponse('{"suggestions":[{"championId":"Zed","rationale":"x","confidence":7}]}');
    expect(out[0]?.confidence).toBe(1);
  });

  test("unreadable output is no suggestions, not an exception", () => {
    for (const bad of ["", "I cannot help with that.", "{broken", '{"suggestions":"nope"}']) {
      expect(parseAdvisorResponse(bad)).toEqual([]);
    }
  });

  test("the prompt carries the series history and asks for Data Dragon ids", () => {
    const p = buildPrompt("red", series({ games: [game(1, { blue: ["Ahri"] })] }), 3, false);
    expect(p).toContain("game 1 picks");
    expect(p).toContain("Ahri");
    expect(p).toContain("MonkeyKing");
    expect(p).not.toMatch(/still legal/);
  });

  test("with tellItThePool the prompt lists the legal pool", () => {
    const p = buildPrompt("red", series({ games: [game(1, { blue: ["Ahri"] })] }), 3, true);
    expect(p).toMatch(/still legal/);
    expect(p).not.toMatch(/Ahri,/);
  });
});
