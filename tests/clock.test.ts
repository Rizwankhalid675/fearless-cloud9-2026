import { describe, expect, test } from "vitest";
import {
  formatClock,
  isExpired,
  nextSlot,
  pauseClock,
  startSlot,
  tick,
} from "../src/ui/clock";

const cfg = { perSlotMs: 30_000, reserveMs: 60_000 };

describe("the draft clock", () => {
  test("a slot starts with full slot time and full reserve, running", () => {
    expect(startSlot(cfg)).toEqual({ ...cfg, slotRemainingMs: 30_000, reserveRemainingMs: 60_000, running: true });
  });

  test("slot time drains before reserve is touched", () => {
    const t = tick(startSlot(cfg), 10_000);
    expect(t.slotRemainingMs).toBe(20_000);
    expect(t.reserveRemainingMs).toBe(60_000);
  });

  test("overrunning a slot banks the overflow against reserve", () => {
    const t = tick(startSlot(cfg), 31_000);
    expect(t.slotRemainingMs).toBe(0);
    expect(t.reserveRemainingMs).toBe(59_000);
  });

  test("neither clock goes negative", () => {
    const t = tick(startSlot(cfg), 10_000_000);
    expect(t.slotRemainingMs).toBe(0);
    expect(t.reserveRemainingMs).toBe(0);
    expect(isExpired(t)).toBe(true);
  });

  test("the next slot resets slot time and keeps the reserve already spent", () => {
    const spent = tick(startSlot(cfg), 35_000);
    const next = nextSlot(spent);
    expect(next.slotRemainingMs).toBe(30_000);
    expect(next.reserveRemainingMs).toBe(55_000);
  });

  test("a paused clock ignores elapsed time", () => {
    const paused = pauseClock(tick(startSlot(cfg), 5_000));
    expect(tick(paused, 60_000)).toEqual(paused);
  });

  test("expiry needs BOTH clocks empty", () => {
    expect(isExpired(tick(startSlot(cfg), 30_000))).toBe(false);
  });

  test("formats as m:ss and rounds up, so 1ms left still reads 0:01", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(1)).toBe("0:01");
    expect(formatClock(27_000)).toBe("0:27");
    expect(formatClock(60_000)).toBe("1:00");
    expect(formatClock(95_400)).toBe("1:36");
  });
});
