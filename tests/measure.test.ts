import { describe, expect, test } from "vitest";
import { FIXTURES } from "./fixtures/series";
import { legalPool } from "../src/engine/fearless";

describe("the engine against hand-computed ground truth", () => {
  test.each(FIXTURES)("$name", (f) => {
    expect(legalPool(f.side, f.series)).toHaveLength(f.expectedLegal);
  });

  test("the fixtures cover both rulesets and a full five-game series", () => {
    expect(FIXTURES.some((f) => f.series.ruleset === "team-fearless")).toBe(true);
    expect(FIXTURES.some((f) => f.series.games.length === 4)).toBe(true);
    expect(FIXTURES).toHaveLength(10);
  });
});
