import type { Ruleset, SeriesState } from "../../contracts";
import { DDRAGON_VERSION } from "../data/champions";

interface Props {
  series: SeriesState;
  onRuleset: (r: Ruleset) => void;
  onExport: () => void;
  onImport: () => void;
  onCompleteGame: () => void;
  canCompleteGame: boolean;
}

export function SeriesBar({ series, onRuleset, onExport, onImport, onCompleteGame, canCompleteGame }: Props) {
  const games = Array.from({ length: series.bestOf }, (_, i) => i + 1);

  return (
    <header className="series-bar">
      <div className="wordmark">
        Fearless <span>patch {DDRAGON_VERSION}</span>
      </div>

      <div className="games" role="list" aria-label={`Best of ${series.bestOf}`}>
        {games.map((n) => {
          const state = n < series.current.gameNumber ? "done" : n === series.current.gameNumber ? "live" : "ahead";
          return (
            <span className="game-chip" data-state={state} role="listitem" key={n}>
              <span className="dot" aria-hidden="true" />
              Game {n}
              {state === "done" ? <span className="sr-only"> complete</span> : null}
            </span>
          );
        })}
      </div>

      <label className="bar-field bar-spacer">
        Ruleset
        <select
          className="control"
          value={series.ruleset}
          onChange={(e) => onRuleset(e.target.value as Ruleset)}
          disabled={series.games.length > 0}
          title={series.games.length > 0 ? "The ruleset is fixed once a game has been played." : undefined}
        >
          <option value="fearless">Fearless — picks burn for both teams</option>
          <option value="team-fearless">Team fearless — picks burn for that team</option>
        </select>
      </label>

      <button className="control" onClick={onCompleteGame} disabled={!canCompleteGame}>
        Finish game {series.current.gameNumber}
      </button>
      <button className="control" onClick={onExport}>Export series</button>
      <button className="control" onClick={onImport}>Import series</button>
    </header>
  );
}
