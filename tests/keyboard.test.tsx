/**
 * The keyboard and screen-reader task. SKIPPED ON PURPOSE.
 *
 * These tests are the specification for work that has not been done yet. They
 * are `describe.skip` so `main` stays green and the Pages deploy keeps working;
 * the first step of the task is to delete the three `.skip`s and watch them fail
 * — `nextIndex` currently throws, and PoolGrid still has the role defect.
 *
 * See docs/JETBRAINS.md for the full brief.
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { PoolGrid } from "../src/ui/PoolGrid";
import { TurnStrip } from "../src/ui/TurnStrip";
import { startSlot } from "../src/ui/clock";
import { series } from "./helpers";
import { nextIndex } from "../src/ui/gridNav";

describe.skip("gridNav: moving around the pool with the keyboard", () => {
  // A 3-column grid of 7 champions:
  //   0 1 2
  //   3 4 5
  //   6
  const COLS = 3;
  const TOTAL = 7;

  test("right and left move by one and stop at the ends", () => {
    expect(nextIndex(0, "ArrowRight", TOTAL, COLS)).toBe(1);
    expect(nextIndex(6, "ArrowRight", TOTAL, COLS)).toBe(6);
    expect(nextIndex(4, "ArrowLeft", TOTAL, COLS)).toBe(3);
    expect(nextIndex(0, "ArrowLeft", TOTAL, COLS)).toBe(0);
  });

  test("down and up move by a whole row", () => {
    expect(nextIndex(1, "ArrowDown", TOTAL, COLS)).toBe(4);
    expect(nextIndex(4, "ArrowUp", TOTAL, COLS)).toBe(1);
  });

  test("a move off the end of a ragged last row stays put rather than vanishing", () => {
    // index 5 + 3 columns = 8, which does not exist. 6 does, but it is not
    // below 5 — it is below 3. Staying is correct; jumping sideways is not.
    expect(nextIndex(5, "ArrowDown", TOTAL, COLS)).toBe(5);
    expect(nextIndex(2, "ArrowUp", TOTAL, COLS)).toBe(2);
  });

  test("Home and End jump to the first and last champion", () => {
    expect(nextIndex(4, "Home", TOTAL, COLS)).toBe(0);
    expect(nextIndex(0, "End", TOTAL, COLS)).toBe(TOTAL - 1);
  });

  test("an empty pool has nowhere to go", () => {
    expect(nextIndex(0, "ArrowRight", 0, COLS)).toBe(-1);
  });

  test("a single column still moves vertically", () => {
    expect(nextIndex(0, "ArrowDown", 3, 1)).toBe(1);
    expect(nextIndex(2, "ArrowUp", 3, 1)).toBe(1);
  });
});

describe.skip("the pool grid is reachable without a mouse", () => {
  const props = {
    series: series(),
    side: "blue" as const,
    role: "all" as const,
    query: "",
    onRole: vi.fn(),
    onQuery: vi.fn(),
    onTake: vi.fn(),
    searchRef: createRef<HTMLInputElement>(),
    disabled: false,
  };

  test("a champion is announced as a BUTTON, not as a list item", () => {
    // The defect this task fixes: role="listitem" on a <button> overrides the
    // native button role, so assistive technology never announces that the
    // champion can be activated.
    render(<PoolGrid {...props} />);
    expect(screen.getByRole("button", { name: "Lux" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem", { name: "Lux" })).not.toBeInTheDocument();
  });

  test("exactly one champion is in the tab order at a time (roving tabindex)", () => {
    const { container } = render(<PoolGrid {...props} />);
    const tabbable = container.querySelectorAll('.champ[tabindex="0"]');
    expect(tabbable).toHaveLength(1);
  });

  test("the grid names itself for screen readers", () => {
    render(<PoolGrid {...props} />);
    expect(screen.getByRole("group", { name: /champion pool/i })).toBeInTheDocument();
  });
});

describe.skip("the turn is announced when it changes", () => {
  test("whose action it is lives in a polite live region", () => {
    render(
      <TurnStrip
        slot={{ kind: "pick", side: "red", championId: null }}
        nth={8}
        clock={startSlot({ perSlotMs: 30_000, reserveMs: 60_000 })}
        onPauseToggle={vi.fn()}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/red/i);
    expect(status).toHaveTextContent(/pick/i);
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
