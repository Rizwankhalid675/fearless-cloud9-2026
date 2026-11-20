import { describe, expect, test } from "vitest";
import { CHAMPIONS, DDRAGON_VERSION, byId } from "../src/data/champions";

describe("champion snapshot", () => {
  test("has champions and a pinned patch version", () => {
    expect(CHAMPIONS.length).toBeGreaterThan(150);
    expect(DDRAGON_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("looks a champion up by its Data Dragon id", () => {
    expect(byId("Ahri")?.name).toBe("Ahri");
  });

  test("keeps id and display name separate, because they differ", () => {
    // The classic trap: the id is "MonkeyKing" and the name is "Wukong". A
    // series file stores ids; a coach reads names. Conflating them loses picks.
    expect(byId("MonkeyKing")?.name).toBe("Wukong");
  });

  test("returns undefined for a champion that does not exist", () => {
    expect(byId("Mordekaisor")).toBeUndefined();
  });

  test("every champion has at least one role, so none can be hidden by a filter", () => {
    expect(CHAMPIONS.filter((c) => c.roles.length === 0)).toEqual([]);
  });

  test("ids are unique", () => {
    expect(new Set(CHAMPIONS.map((c) => c.id)).size).toBe(CHAMPIONS.length);
  });
});
