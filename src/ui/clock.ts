/**
 * The draft clock, as a pure reducer.
 *
 * Tournament draft gives each side per-slot time plus a reserve that only
 * drains once a slot has run out. The reducer is tested against injected
 * elapsed time and never reads Date.now(), so the tests are not flaky and a
 * paused draft is a state rather than a cleared interval.
 *
 * The clock is ADVISORY. It never gates a pick: expiry shows, it does not lock
 * the board. A tool that refuses input because its own timer disagreed with the
 * tournament's is worse than no timer.
 */

export interface ClockConfig {
  perSlotMs: number;
  reserveMs: number;
}

export interface ClockState extends ClockConfig {
  slotRemainingMs: number;
  reserveRemainingMs: number;
  running: boolean;
}

/** First slot of a game: full slot time, full reserve. */
export function startSlot(cfg: ClockConfig): ClockState {
  return {
    ...cfg,
    slotRemainingMs: cfg.perSlotMs,
    reserveRemainingMs: cfg.reserveMs,
    running: true,
  };
}

/** Next slot: slot time resets, whatever reserve is left carries over. */
export function nextSlot(state: ClockState): ClockState {
  return { ...state, slotRemainingMs: state.perSlotMs, running: true };
}

/** Advance by elapsed time. Slot time drains first; the overflow eats reserve. */
export function tick(state: ClockState, elapsedMs: number): ClockState {
  if (!state.running || elapsedMs <= 0) return state;

  const fromSlot = Math.min(state.slotRemainingMs, elapsedMs);
  const overflow = elapsedMs - fromSlot;
  return {
    ...state,
    slotRemainingMs: state.slotRemainingMs - fromSlot,
    reserveRemainingMs: Math.max(0, state.reserveRemainingMs - overflow),
  };
}

export function pauseClock(state: ClockState): ClockState {
  return { ...state, running: false };
}

export function resumeClock(state: ClockState): ClockState {
  return { ...state, running: true };
}

/** Out of slot time AND out of reserve. */
export function isExpired(state: ClockState): boolean {
  return state.slotRemainingMs === 0 && state.reserveRemainingMs === 0;
}

/** m:ss. Rounds up, so a clock reading 0:01 still has time on it. */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
