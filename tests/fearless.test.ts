import { describe, expect, test } from "vitest";
import { burnedChampions, legalPool, legalityOf } from "../src/engine/fearless";
import { CHAMPIONS } from "../src/data/champions";
import { draft, game, series } from "./helpers";

describe("fearless: champions burned by previous games", () => {
  test("a champion picked in game 1 is burned for BOTH teams under fearless", () => {
    const s = series({ ruleset: "fearless", games: [game(1, { blue: ["Ahri"] })] });
    expect(legalityOf("Ahri", "red", s).legal).toBe(false);
    expect(legalityOf("Ahri", "blue", s).legal).toBe(false);
  });

  test("the blocked reason names the game and the side that burned it", () => {
    const s = series({ games: [game(1, { blue: ["Ahri"] })] });
    const v = legalityOf("Ahri", "red", s);
    expect(v.burnedIn).toEqual({ gameNumber: 1, side: "blue" });
    expect(v.reason).toContain("game 1");
    expect(v.reason).toContain("Ahri");
  });

  test("under team-fearless only the team that picked it loses it", () => {
    const s = series({ ruleset: "team-fearless", games: [game(1, { blue: ["Ahri"] })] });
    expect(legalityOf("Ahri", "blue", s).legal).toBe(false);
    expect(legalityOf("Ahri", "red", s).legal).toBe(true);
  });

  test("bans never carry across games, under either ruleset", () => {
    for (const ruleset of ["fearless", "team-fearless"] as const) {
      const s = series({ ruleset, games: [game(1, {}, { blue: ["Ahri"], red: ["Zed"] })] });
      expect(legalityOf("Ahri", "blue", s).legal).toBe(true);
      expect(legalityOf("Zed", "blue", s).legal).toBe(true);
    }
  });

  test("Review Focus 1: a champion burned by one side stays burned when the other side also used it", () => {
    // Ahri picked by blue in game 1, then by red in game 2 — impossible under
    // fearless, but an imported file can say it. The earliest burn is the one
    // that explains why it is unavailable, so that is the one reported.
    const s = series({
      games: [game(1, { blue: ["Ahri"] }), game(2, { red: ["Ahri"] })],
    });
    expect(legalityOf("Ahri", "blue", s).burnedIn).toEqual({ gameNumber: 1, side: "blue" });
  });

  test("burnedChampions over a four-game series burns all forty picks", () => {
    const ids = CHAMPIONS.slice(0, 40).map((c) => c.id);
    const games = [0, 1, 2, 3].map((i) =>
      game(i + 1, { blue: ids.slice(i * 10, i * 10 + 5), red: ids.slice(i * 10 + 5, i * 10 + 10) }),
    );
    const s = series({ games });
    expect(burnedChampions(s, "blue").size).toBe(40);
    expect(legalPool("blue", s)).toHaveLength(CHAMPIONS.length - 40);
  });
});

describe("fearless: the current game", () => {
  test("a champion already picked in THIS game is illegal for the other side", () => {
    const s = series({
      current: draft(1, [{ kind: "pick", side: "blue", championId: "Ahri" }]),
    });
    const v = legalityOf("Ahri", "red", s);
    expect(v.legal).toBe(false);
    expect(v.reason).toContain("this game");
    expect(v.burnedIn).toBeUndefined();
  });

  test("a champion banned in THIS game is illegal to pick", () => {
    const s = series({
      current: draft(1, [{ kind: "ban", side: "red", championId: "Zed" }]),
    });
    expect(legalityOf("Zed", "blue", s).legal).toBe(false);
  });

  test("an unfilled slot blocks nothing", () => {
    const s = series({
      current: draft(1, [{ kind: "ban", side: "red", championId: null }]),
    });
    expect(legalityOf("Zed", "blue", s).legal).toBe(true);
  });
});

describe("fearless: champions that do not exist", () => {
  test("an invented champion is illegal, with its own reason", () => {
    const v = legalityOf("Mordekaisor", "blue", series());
    expect(v.legal).toBe(false);
    expect(v.reason).toMatch(/no such champion/i);
  });
});

describe("fearless: the legal pool", () => {
  test("a fresh series has every champion legal for both sides", () => {
    const s = series();
    expect(legalPool("blue", s)).toHaveLength(CHAMPIONS.length);
    expect(legalPool("red", s)).toHaveLength(CHAMPIONS.length);
  });

  test("the pool excludes every burned champion", () => {
    const s = series({ games: [game(1, { blue: ["Ahri"], red: ["Zed"] })] });
    const ids = legalPool("red", s).map((c) => c.id);
    expect(ids).not.toContain("Ahri");
    expect(ids).not.toContain("Zed");
    expect(ids).toContain("Lux");
  });

  test("the pool is the exact set legalityOf agrees with — no second source of truth", () => {
    const s = series({ games: [game(1, { blue: ["Ahri", "Lux"], red: ["Zed"] })] });
    const pool = new Set(legalPool("blue", s).map((c) => c.id));
    for (const c of CHAMPIONS) {
      expect(pool.has(c.id)).toBe(legalityOf(c.id, "blue", s).legal);
    }
  });
});

describe("fearless: banning a burned champion", () => {
  test("a champion the series already burned cannot be banned either", () => {
    // Surfaced by the demo generator, which refused to build a series whose
    // game 2 banned a champion game 1 had picked. A burn removes a champion
    // from the series; spending a ban on it is not merely wasteful, it is not
    // a thing the draft can express.
    const s = series({ games: [game(1, { blue: ["Ahri"] })] });
    const v = legalityOf("Ahri", "red", s);
    expect(v.legal).toBe(false);
    expect(v.burnedIn).toEqual({ gameNumber: 1, side: "blue" });
  });
});
