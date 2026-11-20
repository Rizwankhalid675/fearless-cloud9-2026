import { describe, expect, test } from "vitest";
import { gateStats, gateSuggestions } from "../src/advisor/gate";
import type { Suggestion } from "../contracts";
import { draft, game, series } from "./helpers";

const s = (championId: string, rationale = "strong blind pick", confidence = 0.8): Suggestion => ({
  championId,
  rationale,
  confidence,
});

describe("the gate", () => {
  test("a legal suggestion passes through, marked legal", () => {
    const [g] = gateSuggestions([s("Ahri")], "blue", series());
    expect(g?.legality.legal).toBe(true);
    expect(g?.rationale).toBe("strong blind pick");
  });

  test("an illegal suggestion is KEPT and marked, with the burn that explains it", () => {
    const st = series({ games: [game(1, { blue: ["Ahri"] })] });
    const [g] = gateSuggestions([s("Ahri")], "red", st);
    expect(g?.legality.legal).toBe(false);
    expect(g?.legality.burnedIn).toEqual({ gameNumber: 1, side: "blue" });
    expect(g?.legality.reason).toContain("game 1");
  });

  test("Review Focus 4: a champion that does not exist is blocked with its own reason", () => {
    const [g] = gateSuggestions([s("Mordekaisor")], "blue", series());
    expect(g?.legality.legal).toBe(false);
    expect(g?.legality.reason).toMatch(/no such champion/i);
    expect(g?.legality.burnedIn).toBeUndefined();
  });

  test("the gate never drops a suggestion silently", () => {
    const st = series({ games: [game(1, { blue: ["Ahri"] })] });
    const out = gateSuggestions([s("Ahri"), s("Mordekaisor"), s("Lux")], "red", st);
    expect(out).toHaveLength(3);
    expect(out.map((g) => g.championId)).toEqual(["Ahri", "Mordekaisor", "Lux"]);
  });

  test("the advisor's confidence never overrides legality", () => {
    const st = series({ games: [game(1, { blue: ["Ahri"] })] });
    const [g] = gateSuggestions([s("Ahri", "I am certain", 1)], "red", st);
    expect(g?.legality.legal).toBe(false);
  });

  test("a champion banned in the current game is blocked too", () => {
    const st = series({ current: draft(1, [{ kind: "ban", side: "red", championId: "Zed" }]) });
    const [g] = gateSuggestions([s("Zed")], "blue", st);
    expect(g?.legality.legal).toBe(false);
    expect(g?.legality.reason).toContain("this game");
  });

  test("an empty list of suggestions is an empty list, not an error", () => {
    expect(gateSuggestions([], "blue", series())).toEqual([]);
  });

  test("the same suggestion twice is gated twice — the gate does not deduplicate", () => {
    const out = gateSuggestions([s("Ahri"), s("Ahri")], "blue", series());
    expect(out).toHaveLength(2);
  });
});

describe("gateStats", () => {
  test("counts what the gate caught", () => {
    const st = series({ games: [game(1, { blue: ["Ahri", "Lux"] })] });
    const out = gateSuggestions([s("Ahri"), s("Lux"), s("Zed"), s("Mordekaisor")], "red", st);
    expect(gateStats(out)).toEqual({ total: 4, blocked: 3, burned: 2, nonexistent: 1, legal: 1 });
  });

  test("a clean run reports zero blocked", () => {
    expect(gateStats(gateSuggestions([s("Ahri")], "blue", series()))).toEqual({
      total: 1,
      blocked: 0,
      burned: 0,
      nonexistent: 0,
      legal: 1,
    });
  });
});
