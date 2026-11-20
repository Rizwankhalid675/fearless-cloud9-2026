import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { SuggestionList } from "../src/ui/SuggestionList";
import { PoolGrid } from "../src/ui/PoolGrid";
import { TurnStrip } from "../src/ui/TurnStrip";
import { SideRail } from "../src/ui/SideRail";
import { gateSuggestions } from "../src/advisor/gate";
import { startSlot } from "../src/ui/clock";
import { game, series } from "./helpers";

const burnedSeries = series({ games: [game(1, { blue: ["Ahri"] })] });

describe("the suggestion list", () => {
  test("a blocked suggestion shows the reason AND the game it was burned in", () => {
    const items = gateSuggestions(
      [{ championId: "Ahri", rationale: "strong blind", confidence: 0.8 }],
      "red",
      burnedSeries,
    );
    render(<SuggestionList advisorName="priority sheet" items={items} busy={false} error={null} />);

    expect(screen.getByText(/blue picked it in game 1/i)).toBeInTheDocument();
    expect(screen.getByText("G1")).toBeInTheDocument();
  });

  test("it says how many the gate blocked", () => {
    const items = gateSuggestions(
      [
        { championId: "Ahri", rationale: "a", confidence: 0.8 },
        { championId: "Lux", rationale: "b", confidence: 0.7 },
      ],
      "red",
      burnedSeries,
    );
    render(<SuggestionList advisorName="priority sheet" items={items} busy={false} error={null} />);
    expect(screen.getByText(/1 of 2 blocked by the rules engine/i)).toBeInTheDocument();
  });

  test("a clean run says so rather than staying silent", () => {
    const items = gateSuggestions([{ championId: "Lux", rationale: "b", confidence: 0.7 }], "red", burnedSeries);
    render(<SuggestionList advisorName="priority sheet" items={items} busy={false} error={null} />);
    expect(screen.getByText(/all legal/i)).toBeInTheDocument();
  });

  test("an invented champion shows the engine's reason, not a crash", () => {
    const items = gateSuggestions(
      [{ championId: "Mordekaisor", rationale: "x", confidence: 0.9 }],
      "red",
      burnedSeries,
    );
    render(<SuggestionList advisorName="a model" items={items} busy={false} error={null} />);
    expect(screen.getByText(/no such champion/i)).toBeInTheDocument();
    // The id is kept visible, so a coach can see what the model invented.
    expect(screen.getByText("Mordekaisor")).toBeInTheDocument();
  });

  test("an empty list invites the next action instead of showing nothing", () => {
    render(<SuggestionList advisorName="priority sheet" items={[]} busy={false} error={null} />);
    expect(screen.getByText(/ask the advisor/i)).toBeInTheDocument();
  });
});

describe("the pool grid", () => {
  const props = {
    series: burnedSeries,
    side: "red" as const,
    role: "all" as const,
    query: "",
    onRole: vi.fn(),
    onQuery: vi.fn(),
    onTake: vi.fn(),
    searchRef: createRef<HTMLInputElement>(),
    disabled: false,
  };

  test("a burned champion is rendered but not pickable", () => {
    render(<PoolGrid {...props} />);
    const ahri = screen.getByRole("listitem", { name: /^Ahri\./ });
    expect(ahri).toBeDisabled();
    expect(ahri).toHaveAccessibleName(/burned/i);
  });

  test("a legal champion is pickable", () => {
    render(<PoolGrid {...props} />);
    expect(screen.getByRole("listitem", { name: "Lux" })).toBeEnabled();
  });

  test("the count distinguishes available from gone", () => {
    render(<PoolGrid {...props} />);
    expect(screen.getByText(/1 gone/)).toBeInTheDocument();
  });

  test("a search that matches nothing explains itself", () => {
    render(<PoolGrid {...props} query="zzzz" />);
    expect(screen.getByText(/no champion matches/i)).toBeInTheDocument();
  });
});

describe("the turn strip", () => {
  test("announces whose action it is and what kind", () => {
    render(
      <TurnStrip
        slot={{ kind: "ban", side: "blue", championId: null }}
        nth={1}
        clock={startSlot({ perSlotMs: 30_000, reserveMs: 60_000 })}
        onPauseToggle={vi.fn()}
      />,
    );
    expect(screen.getByText(/Blue ban/)).toBeInTheDocument();
    expect(screen.getByText("0:30")).toBeInTheDocument();
    expect(screen.getByLabelText(/time left on this action/i)).toBeInTheDocument();
  });

  test("a completed draft says what to do next rather than going blank", () => {
    render(
      <TurnStrip slot={null} nth={21} clock={startSlot({ perSlotMs: 30_000, reserveMs: 60_000 })} onPauseToggle={vi.fn()} />,
    );
    expect(screen.getByText(/draft complete/i)).toBeInTheDocument();
    expect(screen.getByText(/carry these picks into the next one/i)).toBeInTheDocument();
  });
});

describe("the side rails", () => {
  test("each side shows five ban and five pick slots", () => {
    const { container } = render(<SideRail side="blue" series={series()} />);
    expect(container.querySelectorAll(".ban")).toHaveLength(5);
    expect(container.querySelectorAll(".pick")).toHaveLength(5);
  });

  test("an empty slot reads as empty rather than as a champion", () => {
    const { container } = render(<SideRail side="blue" series={series()} />);
    expect(container.querySelectorAll('.pick[data-empty="true"]')).toHaveLength(5);
  });
});
