import type { GatedSuggestion } from "../../contracts";
import { nameOf } from "../data/champions";
import { gateStats } from "../advisor/gate";

interface Props {
  advisorName: string;
  items: GatedSuggestion[];
  busy: boolean;
  error: string | null;
}

/**
 * What the advisor proposed, and what the gate did about it.
 *
 * A blocked suggestion is shown, struck through, with the engine's reason and
 * the chip of the game that burned it. This is the product's whole argument
 * made visible: the model proposed, deterministic code decided, and the coach
 * can see both.
 */
export function SuggestionList({ advisorName, items, busy, error }: Props) {
  const stats = gateStats(items);

  return (
    <section className="advisor" aria-label="Advisor suggestions">
      <div className="advisor-head">
        <span className="who">Advisor: {advisorName}</span>
        {items.length > 0 ? (
          <span className="blocked" data-any={stats.blocked > 0}>
            {stats.blocked === 0
              ? `${stats.total} suggestions, all legal`
              : `${stats.blocked} of ${stats.total} blocked by the rules engine`}
          </span>
        ) : null}
      </div>

      {error ? <p className="problems">{error}</p> : null}

      {busy ? (
        <p className="advisor-empty">Asking the advisor…</p>
      ) : items.length === 0 ? (
        <p className="advisor-empty">No suggestions yet. Ask the advisor for the current action.</p>
      ) : (
        <div className="suggestions" role="list">
          {items.map((s, i) => (
            <div className="suggestion" data-legal={s.legality.legal} role="listitem" key={`${s.championId}-${i}`}>
              <span className="rank">{i + 1}</span>
              <span className="who">{nameOf(s.championId)}</span>
              <span className="conf">{s.confidence.toFixed(2)}</span>
              <span className="why">
                {s.legality.legal ? s.rationale : s.legality.reason}
                {s.legality.burnedIn ? (
                  <span className="burn chip" data-game={s.legality.burnedIn.gameNumber}>
                    G{s.legality.burnedIn.gameNumber}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
