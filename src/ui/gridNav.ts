/**
 * Keyboard movement around the champion pool.
 *
 * NOT IMPLEMENTED YET — this is a signature and a specification. The behaviour
 * is pinned by `tests/keyboard.test.tsx`, which is `describe.skip` until someone
 * picks this up; see docs/JETBRAINS.md for the brief.
 *
 * It is a pure function taking the column count as an argument, rather than a
 * few lines inside PoolGrid, because the ragged-last-row case is genuinely
 * fiddly and deserves its own tests: moving down from the last item of a full
 * row must NOT slide sideways into a cell that is not beneath it.
 *
 * Nothing imports this yet, so it is not in the shipped bundle.
 */

export type NavKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/**
 * Where keyboard focus should move to.
 *
 * @param current the index currently focused
 * @param key     the key pressed
 * @param total   how many champions are rendered
 * @param columns how many fit on a row at the current width
 * @returns the index to focus next, `current` if the move is not possible, or
 *          `-1` when there is nothing to focus at all
 */
export function nextIndex(current: number, key: NavKey, total: number, columns: number): number {
  void current;
  void key;
  void total;
  void columns;
  throw new Error(
    "nextIndex is not implemented yet — see docs/JETBRAINS.md and tests/keyboard.test.tsx",
  );
}
