import { describe, expect, test } from "vitest";
import { completeGame, exportSeries, importSeries, newSeries } from "../src/engine/series";
import { applyPick } from "../src/engine/draftOrder";
import { DDRAGON_VERSION, CHAMPIONS } from "../src/data/champions";
import { game, series } from "./helpers";

function drafted(): ReturnType<typeof newSeries> {
  let s = newSeries({ bestOf: 5, ruleset: "fearless" });
  for (const c of CHAMPIONS.slice(0, 20)) {
    const r = applyPick(s, c.id);
    if (!r.ok) throw new Error(r.reason);
    s = r.series;
  }
  return s;
}

describe("newSeries", () => {
  test("starts at game 1 with no completed games and an untouched draft", () => {
    const s = newSeries({ bestOf: 5, ruleset: "fearless" });
    expect(s.games).toEqual([]);
    expect(s.current.gameNumber).toBe(1);
    expect(s.current.slots.every((x) => x.championId === null)).toBe(true);
    expect(s.id).toBeTruthy();
  });
});

describe("completeGame", () => {
  test("files the drafted picks and bans under the right side and starts the next game", () => {
    const s = completeGame(drafted());
    expect(s.games).toHaveLength(1);
    const g = s.games[0]!;
    expect(g.gameNumber).toBe(1);
    expect(g.picks.blue).toHaveLength(5);
    expect(g.picks.red).toHaveLength(5);
    expect(g.bans.blue).toHaveLength(5);
    expect(g.bans.red).toHaveLength(5);
    expect(s.current.gameNumber).toBe(2);
    expect(s.current.slots.every((x) => x.championId === null)).toBe(true);
  });

  test("game 1's picks are burned in game 2 — the whole point of the product", () => {
    const before = drafted();
    const firstPick = before.current.slots.find((x) => x.kind === "pick")!.championId!;
    const after = completeGame(before);
    const r = applyPick(after, firstPick);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toContain("game 1");
  });

  test("refuses to file a game that is not finished", () => {
    expect(() => completeGame(newSeries({ bestOf: 5, ruleset: "fearless" }))).toThrow(/not complete/i);
  });
});

describe("export and import", () => {
  test("round-trips exactly", () => {
    const s = completeGame(drafted());
    const r = importSeries(exportSeries(s));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.series).toEqual(s);
  });

  test("the file records the champion snapshot it was written against", () => {
    const parsed = JSON.parse(exportSeries(series()));
    expect(parsed.ddragonVersion).toBe(DDRAGON_VERSION);
    expect(parsed.format).toBe("fearless-series");
  });

  test("Review Focus 3: an unknown champion id is reported by name, not thrown", () => {
    const s = series({ games: [game(1, { blue: ["Mordekaisor"] })] });
    const r = importSeries(exportSeries(s));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problems.join(" ")).toContain("Mordekaisor");
    expect(r.problems.join(" ")).toMatch(/game 1/i);
  });

  test("malformed JSON is a problem list, not an exception", () => {
    const r = importSeries("{not json");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problems).toHaveLength(1);
    expect(r.problems[0]).toMatch(/not valid json/i);
  });

  test("a file of the wrong kind is refused", () => {
    const r = importSeries(JSON.stringify({ hello: "world" }));
    expect(r.ok).toBe(false);
  });

  test("an unknown ruleset is refused rather than silently treated as fearless", () => {
    const bad = JSON.parse(exportSeries(series()));
    bad.series.ruleset = "semi-fearless";
    const r = importSeries(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problems.join(" ")).toContain("semi-fearless");
  });

  test("a draft with the wrong number of slots is refused", () => {
    const bad = JSON.parse(exportSeries(series()));
    bad.series.current.slots = bad.series.current.slots.slice(0, 19);
    const r = importSeries(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problems.join(" ")).toMatch(/19/);
  });

  test("every problem in a bad file is reported at once, not just the first", () => {
    const bad = JSON.parse(exportSeries(series({ games: [game(1, { blue: ["Nope1", "Nope2"] })] })));
    bad.series.ruleset = "semi-fearless";
    const r = importSeries(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.problems.length).toBeGreaterThanOrEqual(3);
  });
});
