import { describe, expect, test } from "vitest";
import { DRAFT_ORDER, applyPick, currentSlot, isComplete, newDraft, poolStatus } from "../src/engine/draftOrder";
import { CHAMPIONS } from "../src/data/champions";
import { game, series } from "./helpers";

describe("draft order", () => {
  test("a new draft has 20 slots: 10 bans and 10 picks", () => {
    const d = newDraft(1);
    expect(d.slots).toHaveLength(20);
    expect(d.slots.filter((s) => s.kind === "ban")).toHaveLength(10);
    expect(d.slots.filter((s) => s.kind === "pick")).toHaveLength(10);
    expect(d.cursor).toBe(0);
  });

  test("each side gets 5 bans and 5 picks", () => {
    const d = newDraft(1);
    for (const side of ["blue", "red"] as const) {
      expect(d.slots.filter((s) => s.side === side && s.kind === "ban")).toHaveLength(5);
      expect(d.slots.filter((s) => s.side === side && s.kind === "pick")).toHaveLength(5);
    }
  });

  test("the order is tournament order", () => {
    // ban B R B R B R | pick B R R B B R | ban R B R B | pick R B B R
    expect(DRAFT_ORDER.map((s) => `${s.side[0]}${s.kind[0]}`).join(" ")).toBe(
      "bb rb bb rb bb rb " + "bp rp rp bp bp rp " + "rb bb rb bb " + "rp bp bp rp",
    );
  });

  test("blue bans first and red picks last", () => {
    const d = newDraft(1);
    expect(d.slots[0]).toMatchObject({ kind: "ban", side: "blue" });
    expect(d.slots[19]).toMatchObject({ kind: "pick", side: "red" });
  });

  test("currentSlot points at the cursor, and is null once complete", () => {
    expect(currentSlot(newDraft(1))).toMatchObject({ kind: "ban", side: "blue" });
    expect(isComplete(newDraft(1))).toBe(false);
  });
});

describe("applyPick", () => {
  test("records the champion in the current slot and advances the cursor", () => {
    const r = applyPick(series(), "Ahri");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.series.current.slots[0]?.championId).toBe("Ahri");
    expect(r.series.current.cursor).toBe(1);
    expect(currentSlot(r.series.current)).toMatchObject({ kind: "ban", side: "red" });
  });

  test("refuses a champion the engine says is burned, quoting its reason verbatim", () => {
    const s = series({ games: [game(1, { blue: ["Ahri"] })] });
    const r = applyPick(s, "Ahri");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toContain("game 1");
  });

  test("refuses a champion that does not exist", () => {
    const r = applyPick(series(), "Mordekaisor");
    expect(r.ok).toBe(false);
  });

  test("refuses a champion already taken this game", () => {
    const first = applyPick(series(), "Ahri");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = applyPick(first.series, "Ahri");
    expect(second.ok).toBe(false);
  });

  test("never mutates the series it was given", () => {
    const s = series();
    applyPick(s, "Ahri");
    expect(s.current.slots[0]?.championId).toBeNull();
    expect(s.current.cursor).toBe(0);
  });

  test("a full 20-slot draft completes and then refuses further picks", () => {
    let s = series();
    for (const c of CHAMPIONS.slice(0, 20)) {
      const r = applyPick(s, c.id);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      s = r.series;
    }
    expect(isComplete(s.current)).toBe(true);
    expect(currentSlot(s.current)).toBeNull();
    const after = applyPick(s, CHAMPIONS[20]!.id);
    expect(after.ok).toBe(false);
    if (after.ok) return;
    expect(after.reason).toMatch(/complete/i);
  });
});

describe("poolStatus", () => {
  test("reports how many champions a role has left", () => {
    const st = poolStatus("mid", "blue", series());
    expect(st.exhausted).toBe(false);
    expect(st.remaining).toBe(CHAMPIONS.filter((c) => c.roles.includes("mid")).length);
  });

  test("Review Focus 5: a role with nothing left reports exhausted, not an empty list", () => {
    // Burn every champion that can fill support, which is reachable late in a
    // Bo5. The board must say the role is exhausted rather than render nothing.
    const supports = CHAMPIONS.filter((c) => c.roles.includes("support")).map((c) => c.id);
    const games = [];
    for (let i = 0; i < supports.length; i += 10) {
      games.push(game(games.length + 1, { blue: supports.slice(i, i + 10) }));
    }
    const st = poolStatus("support", "blue", series({ games }));
    expect(st).toEqual({ exhausted: true, remaining: 0 });
  });
});
