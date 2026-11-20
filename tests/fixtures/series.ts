/**
 * Ground truth for the rules engine.
 *
 * Every fixture carries `expectedLegal` worked out by ARITHMETIC, written in
 * the note beside it, not by calling the engine. That is the whole point: a
 * fixture whose expected value came from legalPool() would only prove the
 * engine agrees with itself.
 *
 * The catalogue is 173 champions at patch 16.23.1.
 */

import type { SeriesState, Side } from "../../contracts";
import { CHAMPIONS } from "../../src/data/champions";
import { draft, game, series } from "../helpers";

export const CATALOGUE = CHAMPIONS.length;

export interface Fixture {
  name: string;
  /** How expectedLegal was arrived at, for a human checking the number. */
  note: string;
  side: Side;
  series: SeriesState;
  expectedLegal: number;
}

/** n distinct champion ids from the catalogue, offset so fixtures do not collide. */
const ids = (from: number, count: number) => CHAMPIONS.slice(from, from + count).map((c) => c.id);

/** A completed game burning 10 distinct champions, 5 a side. */
const burnGame = (n: number, from: number) =>
  game(n, { blue: ids(from, 5), red: ids(from + 5, 5) });

export const FIXTURES: Fixture[] = [
  {
    name: "game 1, nothing drafted",
    note: "no games played, nothing taken: 173 - 0 - 0",
    side: "blue",
    series: series(),
    expectedLegal: CATALOGUE,
  },
  {
    name: "game 2, after one game",
    note: "one game burned 10 distinct picks: 173 - 10 - 0",
    side: "blue",
    series: series({ games: [burnGame(1, 0)] }),
    expectedLegal: CATALOGUE - 10,
  },
  {
    name: "game 3, after two games",
    note: "two games, 20 distinct picks: 173 - 20 - 0",
    side: "red",
    series: series({ games: [burnGame(1, 0), burnGame(2, 10)] }),
    expectedLegal: CATALOGUE - 20,
  },
  {
    name: "game 4, after three games",
    note: "three games, 30 distinct picks: 173 - 30 - 0",
    side: "blue",
    series: series({ games: [burnGame(1, 0), burnGame(2, 10), burnGame(3, 20)] }),
    expectedLegal: CATALOGUE - 30,
  },
  {
    name: "game 5, after four games — the state this product exists for",
    note: "four games, 40 distinct picks: 173 - 40 - 0",
    side: "red",
    series: series({ games: [burnGame(1, 0), burnGame(2, 10), burnGame(3, 20), burnGame(4, 30)] }),
    expectedLegal: CATALOGUE - 40,
  },
  {
    name: "game 5, mid-draft, six bans and four picks in",
    note: "40 burned, plus 10 taken this game: 173 - 40 - 10",
    side: "blue",
    series: series({
      games: [burnGame(1, 0), burnGame(2, 10), burnGame(3, 20), burnGame(4, 30)],
      current: draft(
        5,
        ids(40, 10).map((id, i) => ({
          kind: (i < 6 ? "ban" : "pick") as "ban" | "pick",
          side: (i % 2 === 0 ? "blue" : "red") as Side,
          championId: id,
        })),
      ),
    }),
    expectedLegal: CATALOGUE - 40 - 10,
  },
  {
    name: "team-fearless, blue side after one game",
    note: "only blue's own 5 picks burn for blue: 173 - 5 - 0",
    side: "blue",
    series: series({ ruleset: "team-fearless", games: [burnGame(1, 0)] }),
    expectedLegal: CATALOGUE - 5,
  },
  {
    name: "team-fearless, red side after one game",
    note: "only red's own 5 picks burn for red: 173 - 5 - 0",
    side: "red",
    series: series({ ruleset: "team-fearless", games: [burnGame(1, 0)] }),
    expectedLegal: CATALOGUE - 5,
  },
  {
    name: "bans do not carry across games",
    note: "game 1 banned 10 and picked none, so nothing is burned: 173 - 0 - 0",
    side: "blue",
    series: series({ games: [game(1, {}, { blue: ids(0, 5), red: ids(5, 5) })] }),
    expectedLegal: CATALOGUE,
  },
  {
    name: "a champion burned twice by a corrupt file still costs one slot",
    note: "the same champion in games 1 and 2, 9 other picks: 173 - 10 - 0",
    side: "blue",
    series: series({
      games: [game(1, { blue: ids(0, 5) }), game(2, { blue: [CHAMPIONS[0]!.id, ...ids(5, 5)] })],
    }),
    expectedLegal: CATALOGUE - 10,
  },
];
