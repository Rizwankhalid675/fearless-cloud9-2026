import type { Champion, Role, SeriesState, Side } from "../../contracts";
import { ROLES } from "../../contracts";
import { CHAMPIONS } from "../data/champions";
import { legalityOf } from "../engine/fearless";
import { poolStatus } from "../engine/draftOrder";

interface Props {
  series: SeriesState;
  side: Side;
  role: Role | "all";
  query: string;
  onRole: (r: Role | "all") => void;
  onQuery: (q: string) => void;
  onTake: (championId: string) => void;
  searchRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
};

export function matches(champion: Champion, role: Role | "all", query: string): boolean {
  if (role !== "all" && !champion.roles.includes(role)) return false;
  if (!query.trim()) return true;
  return champion.name.toLowerCase().includes(query.trim().toLowerCase());
}

/**
 * Every champion, with the engine's verdict on each.
 *
 * Burned champions stay on the grid, struck through and carrying the chip of
 * the game that took them, rather than disappearing. A coach needs to see that
 * Ahri is gone and when she went — a pool that silently shrinks is the
 * spreadsheet problem again, in a nicer font.
 */
export function PoolGrid(props: Props) {
  const { series, side, role, query, onRole, onQuery, onTake, searchRef, disabled } = props;

  const shown = CHAMPIONS.filter((c) => matches(c, role, query));
  const verdicts = shown.map((c) => ({ champion: c, legality: legalityOf(c.id, side, series) }));
  const legalCount = verdicts.filter((v) => v.legality.legal).length;
  const status = role === "all" ? null : poolStatus(role, side, series);

  return (
    <>
      <div className="pool-controls">
        <div className="roles" role="group" aria-label="Filter by role">
          <button className="role" aria-pressed={role === "all"} onClick={() => onRole("all")}>
            All
          </button>
          {ROLES.map((r) => (
            <button className="role" aria-pressed={role === r} onClick={() => onRole(r)} key={r}>
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>

        <span className="count">
          {legalCount} available{shown.length - legalCount > 0 ? `, ${shown.length - legalCount} gone` : ""}
        </span>

        <input
          className="search"
          ref={searchRef}
          type="search"
          value={query}
          placeholder="Search champions"
          aria-label="Search champions"
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      {status?.exhausted ? (
        <div className="empty-pool">
          <strong>Nothing left for {ROLE_LABEL[role as Role]}.</strong>
          Every champion this board knows for that role has been taken or burned earlier in the
          series. Clear the role filter to see the rest of the pool.
        </div>
      ) : shown.length === 0 ? (
        <div className="empty-pool">
          <strong>No champion matches "{query}".</strong>
          Check the spelling, or clear the search to see the whole pool.
        </div>
      ) : (
        <div className="pool" role="list">
          {verdicts.map(({ champion, legality }) => (
            <button
              className="champ"
              role="listitem"
              key={champion.id}
              disabled={disabled || !legality.legal}
              title={legality.reason}
              aria-label={legality.legal ? champion.name : `${champion.name}. ${legality.reason}`}
              onClick={() => onTake(champion.id)}
            >
              <span className="cname">{champion.name}</span>
              {legality.burnedIn ? (
                <span className="burn" data-game={legality.burnedIn.gameNumber}>
                  G{legality.burnedIn.gameNumber}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
