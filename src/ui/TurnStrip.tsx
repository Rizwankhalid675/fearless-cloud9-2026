import type { DraftSlot } from "../../contracts";
import type { ClockState } from "./clock";
import { formatClock, isExpired } from "./clock";

interface Props {
  slot: DraftSlot | null;
  nth: number;
  clock: ClockState;
  onPauseToggle: () => void;
}

/**
 * Whose turn it is, and how long they have left.
 *
 * The one place this interface raises its voice: the strip takes the active
 * side's colour, so a coach glancing up knows whose action it is before
 * reading a word. Everything around it stays neutral.
 */
export function TurnStrip({ slot, nth, clock, onPauseToggle }: Props) {
  const low = slot !== null && clock.slotRemainingMs <= 10_000 && clock.slotRemainingMs > 0;
  const out = clock.slotRemainingMs === 0;

  return (
    <div className="turn" data-side={slot?.side ?? "none"}>
      {slot ? (
        <>
          <div className="turn-who">
            {slot.side === "blue" ? "Blue" : "Red"} {slot.kind}
          </div>
          <div className="turn-what">
            action {nth} of 20 · pick from the pool below
          </div>
        </>
      ) : (
        <>
          <div className="turn-who">Draft complete</div>
          <div className="turn-what">Finish the game to carry these picks into the next one</div>
        </>
      )}

      <div className="clock" aria-live="off">
        <span className="slot" data-low={low} data-out={out} aria-label="Time left on this action">
          {formatClock(clock.slotRemainingMs)}
        </span>
        <span className="reserve">
          {isExpired(clock) ? "reserve spent" : `reserve ${formatClock(clock.reserveRemainingMs)}`}
        </span>
        <button className="control" onClick={onPauseToggle}>
          {clock.running ? "Pause clock" : "Start clock"}
        </button>
      </div>
    </div>
  );
}
