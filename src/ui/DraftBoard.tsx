import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GatedSuggestion, Role, Ruleset, SeriesState } from "../../contracts";
import { CHAMPIONS } from "../data/champions";
import demoSeries from "../data/demo.json";
import { applyPick, currentSlot, isComplete } from "../engine/draftOrder";
import { completeGame, exportSeries, importSeries, newSeries } from "../engine/series";
import { legalityOf } from "../engine/fearless";
import { gateSuggestions } from "../advisor/gate";
import { tierAdvisor } from "../advisor/tier";
import { llmAdvisor } from "../advisor/llm";
import type { Advisor } from "../advisor/types";
import { nextSlot, pauseClock, resumeClock, startSlot, tick } from "./clock";
import { PoolGrid, matches } from "./PoolGrid";
import { SeriesBar } from "./SeriesBar";
import { SideRail } from "./SideRail";
import { SuggestionList } from "./SuggestionList";
import { TurnStrip } from "./TurnStrip";

const CLOCK = { perSlotMs: 30_000, reserveMs: 60_000 };
const SUGGESTIONS = 5;

export function DraftBoard() {
  const [series, setSeries] = useState<SeriesState>(() => newSeries({ bestOf: 5, ruleset: "fearless" }));
  const [history, setHistory] = useState<SeriesState[]>([]);
  // Starts paused. A board that counts down from the moment the page loads
  // hands the coach an expired clock before they have touched anything; the
  // clock starts when they start it, or on their first action.
  const [clock, setClock] = useState(() => pauseClock(startSlot(CLOCK)));
  const [role, setRole] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");
  const [useModel, setUseModel] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [suggestions, setSuggestions] = useState<GatedSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const slot = currentSlot(series.current);
  const side = slot?.side ?? "blue";
  const done = isComplete(series.current);

  const advisor: Advisor = useMemo(
    () => (useModel && apiKey ? llmAdvisor({ apiKey }) : tierAdvisor),
    [useModel, apiKey],
  );

  // The clock advances on wall time rather than on a fixed decrement per tick,
  // so a browser that throttles a background tab does not hand the coach a
  // clock that is minutes fast.
  useEffect(() => {
    if (!clock.running || done) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      setClock((c) => tick(c, elapsed));
    }, 250);
    return () => window.clearInterval(id);
  }, [clock.running, done]);

  const take = useCallback(
    (championId: string) => {
      const result = applyPick(series, championId);
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      setHistory((h) => [...h, series]);
      setSeries(result.series);
      setClock((c) => resumeClock(nextSlot(c)));
      setSuggestions([]);
      setQuery("");
      setError(null);
    },
    [series],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      const previous = h[h.length - 1];
      if (!previous) return h;
      setSeries(previous);
      setSuggestions([]);
      setError(null);
      return h.slice(0, -1);
    });
  }, []);

  const ask = useCallback(async () => {
    if (!slot) return;
    setBusy(true);
    setError(null);
    try {
      const raw = await advisor.suggest(slot.side, series, SUGGESTIONS);
      // THE line that matters: nothing an advisor produced reaches the screen
      // without the rules engine's verdict attached.
      setSuggestions(gateSuggestions(raw, slot.side, series));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The advisor failed.");
      setSuggestions([]);
    } finally {
      setBusy(false);
    }
  }, [advisor, series, slot]);

  const doExport = useCallback(() => {
    const blob = new Blob([exportSeries(series)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${series.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [series]);

  const loadDemo = useCallback(() => {
    // Through importSeries, not straight into state: the demo file gets the
    // same validation a coach's own file does, so it cannot be the one series
    // that bypasses the checks.
    const result = importSeries(JSON.stringify(demoSeries));
    if (!result.ok) {
      setProblems(result.problems);
      return;
    }
    setProblems([]);
    setHistory([]);
    setSeries(result.series);
    setClock(pauseClock(startSlot(CLOCK)));
    setSuggestions([]);
  }, []);

  const untouched = series.games.length === 0 && series.current.cursor === 0;

  const doImport = useCallback(async (file: File) => {
    const result = importSeries(await file.text());
    if (!result.ok) {
      setProblems(result.problems);
      return;
    }
    setProblems([]);
    setHistory([]);
    setSeries(result.series);
    setClock(pauseClock(startSlot(CLOCK)));
    setSuggestions([]);
  }, []);

  // Type to search, Enter to lock the first legal match. A coach on a 30-second
  // timer should never have to find a text field with the mouse.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "SELECT";
      if (e.key === "Escape") {
        setQuery("");
        searchRef.current?.blur();
        return;
      }
      if (e.key === "Enter" && typing && query.trim()) {
        const hit = CHAMPIONS.find((c) => matches(c, role, query) && legalityOf(c.id, side, series).legal);
        if (hit) take(hit.id);
        return;
      }
      if (!typing && e.key.length === 1 && /[a-z]/i.test(e.key) && !e.metaKey && !e.ctrlKey) {
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query, role, series, side, take]);

  return (
    <div className="board">
      <SeriesBar
        series={series}
        onRuleset={(r: Ruleset) => setSeries({ ...series, ruleset: r })}
        onExport={doExport}
        onImport={() => fileRef.current?.click()}
        onCompleteGame={() => {
          setHistory((h) => [...h, series]);
          setSeries(completeGame(series));
          setClock(pauseClock(startSlot(CLOCK)));
          setSuggestions([]);
        }}
        canCompleteGame={done}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void doImport(file);
          e.target.value = "";
        }}
      />

      <div className="columns">
        <SideRail side="blue" series={series} />

        <div className="centre">
          <TurnStrip
            slot={slot}
            nth={series.current.cursor + 1}
            clock={clock}
            onPauseToggle={() => setClock((c) => (c.running ? pauseClock(c) : resumeClock(c)))}
          />

          <PoolGrid
            series={series}
            side={side}
            role={role}
            query={query}
            onRole={setRole}
            onQuery={setQuery}
            onTake={take}
            searchRef={searchRef}
            disabled={done}
          />

          <div className="pool-controls">
            <button className="control" onClick={() => void ask()} disabled={done || busy}>
              Ask the advisor
            </button>
            <button className="control" onClick={undo} disabled={history.length === 0}>
              Undo
            </button>
            {untouched ? (
              <button className="control" onClick={loadDemo}>
                Load a demo series
              </button>
            ) : null}
            <label className="bar-field">
              <input type="checkbox" checked={useModel} onChange={(e) => setUseModel(e.target.checked)} />
              Use a model instead of the priority sheet
            </label>
            {useModel ? (
              <span className="key-field">
                <input
                  type="password"
                  placeholder="Anthropic API key"
                  value={apiKey}
                  aria-label="Anthropic API key"
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </span>
            ) : null}
          </div>

          <SuggestionList advisorName={advisor.name} items={suggestions} busy={busy} error={error} />

          {problems.length > 0 ? (
            <ul className="problems" aria-label="Problems with the imported series">
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <SideRail side="red" series={series} />
      </div>
    </div>
  );
}
