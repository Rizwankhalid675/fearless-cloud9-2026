/**
 * What an advisor is.
 *
 * An advisor's only job is to propose. It is explicitly NOT required to propose
 * something legal — `gateSuggestions` is what makes a suggestion safe to show,
 * and an advisor that filtered itself would move that decision out of the one
 * place that is tested for it.
 */

import type { SeriesState, Side, Suggestion } from "../../contracts";

export interface Advisor {
  /** Shown in the UI and recorded in docs/RESULTS.md. */
  name: string;
  /**
   * Whether this advisor consults the legal pool before proposing.
   *
   * `false` is not a bug. A pool-blind advisor is the status quo this product
   * replaces: a static priority sheet does not know what the series has burned,
   * which is exactly why coaches get Fearless wrong in spreadsheets. Recorded
   * in the results table so the number means something.
   */
  poolAware: boolean;
  suggest(side: Side, series: SeriesState, n: number): Promise<Suggestion[]>;
}
