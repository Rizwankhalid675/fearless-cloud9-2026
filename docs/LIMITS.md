# What Fearless does not do

Written so a judge does not have to find these out by trying them.

## The rules

**Two Fearless variants, out of more that exist.** `fearless` burns a previous game's picks
for both teams; `team-fearless` burns them only for the team that picked them. Real leagues
run other variants — burning bans too, burning only from games a team won, capping the burn
at a number of games. The ruleset is a property of the series rather than a constant in the
engine, so adding one is a change in one file, but today there are two.

**Bans do not carry across games, under either variant.** This is the common reading and it
is what the engine implements. A league whose rules differ would need a third variant.

**A burned champion cannot be banned.** The burn removed it from the series, so there is
nothing left to ban. This surfaced when the demo generator refused to build a series whose
game 2 banned a champion game 1 had picked.

**Draft order is tournament order only.** 10 bans and 10 picks in the standard sequence. No
support for formats that change it.

## The data

**Champion roles are a filter, not ground truth.** They are widened from Data Dragon's `tags`,
which classify a champion rather than place it: Data Dragon tags Teemo "Marksman, Assassin".
The role filter narrows the grid; it is never allowed to hide a legal pick, and a champion
whose tags map to nothing is given every role rather than none.

**The priority tiers are opinion.** `src/data/tiers.json` is hand-written, covers 50
champions, and reflects one view of patch 16.23. It exists to model what a coach's priority
sheet looks like, not to be correct about the meta. Everything not listed is tier 4.

**The champion snapshot is pinned and will age.** 173 champions at patch 16.23.1, committed
rather than fetched, so the demo works offline and a judge in January sees exactly what the
video shows. Riot will have shipped champions since. `npm run champions` refreshes it; the
exported series file records which patch it was written against, so the difference is visible
rather than silent.

## The model advisor

**It is optional and unmeasured here.** `docs/RESULTS.md` reports the offline advisor's
numbers. The model-backed rows are absent rather than estimated, because no API key was set
on the run that produced that file.

**The key goes to Anthropic from the browser.** This is a local tool run by one coach with
their own key, and there is no server to proxy through, so the request sets
`anthropic-dangerous-direct-browser-access`. The key is held in memory for the session, never
written to disk and never committed. A team deployment would want a small proxy instead.

**It can propose nonsense, by design.** Nothing validates the champion ids a model returns
before the gate sees them.

## The product

**Single user, single browser.** No accounts, no sync, no shared session between an analyst
and a coach. The series file is the hand-off: export it, send it, import it.

**The clock is advisory.** It never gates a pick. It does not sync with a tournament client,
and it is not authoritative about anything.

**No scouting data.** No win rates, no opponent tendencies, no GRID integration. The advisor
reasons from a static tier list or from a model's own knowledge, not from match history.

**Below 860px the board stops being one screen** and stacks. A phone is for reviewing a
series, not drafting one.

## Riot

Fearless is not endorsed by, sponsored by or affiliated with Riot Games. Champion names come
from Data Dragon, the static data Riot publishes for community tools, and are used under
Riot's developer policies. No Riot artwork, icons or splash art is used anywhere in the
product — the board is names and roles only, which is also why it stays legible at a glance.
