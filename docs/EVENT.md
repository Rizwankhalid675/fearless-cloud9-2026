# Cloud9 x JetBrains: Sky's The Limit 2026 — submission brief

Read from <https://cloud9.devpost.com/rules> on **19 Nov 2026**. Quoted text is verbatim.

---

## 1. Eligibility — CLEARED

> "The Hackathon IS open to: Individuals who are at least the age of majority where they
> reside as of the time of entry"

| Test | Our position | Verdict |
|---|---|---|
| Individual entry allowed | Yes, no organisation requirement | PASS |
| Age of majority | 24, California | PASS |
| Residence not excluded | USA. Excluded: Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea + OFAC | PASS |
| Employee of Cloud9, Devpost, JetBrains or GRID, or family/household | No | PASS |
| Employs or employed by a judge | No | PASS |

No partner program, no corporate email, no paid account. JetBrains access is **given to you
on registration**: "Each registrant will obtain 1 All Products Pack Code and 1 AI Ultimate
Code, while supplies last."

One catch worth knowing: to activate the AI Ultimate code you need an existing JetBrains
licence, All Products Pack, trial, or EAP access — and "**Student licenses are not valid**".
The All Products Pack code they also give you satisfies this.

## 2. Dates (all Pacific Time) — the most runway of the three

| | |
|---|---|
| Registration + Submission | 17 Nov 2026 11:00 → **12 Jan 2027 11:00** |
| Judging | 27 Jan → 3 Feb 2027 |
| Winners | ~8 Feb 2027 |

**54 days from 19 Nov.** Opened two days ago, so nobody is far ahead.

## 3. Why this one is on the list: the odds

| Event | Prize pool | Participants | Cash prizes |
|---|---:|---:|---:|
| Kiroween 2026 | $100,000 | 16,878 | ~12 |
| Codegeist 2026 | $120,000 | 4,339 | 33 |
| **Cloud9 x JetBrains** | **$25,000** | **500** | **7** |

500 participants split across three categories is roughly 165 per category, with **two cash
prizes in each** ($6,000 + $2,000) plus a bonus prize. This is the best prize-per-competitor
ratio on the whole eligible board, by a wide margin. Smaller cheque, far better odds.

## 4. Mandatory technology — deliberately light

> "Build or significantly update a working project using at least one JetBrains tool (a
> JetBrains IDE such as IntelliJ IDEA, PyCharm, WebStorm, Rider or DataGrip, JetBrains Air,
> AI Coding Agent Junie)"

That is the whole technical requirement. Any language, any stack — it just has to be built in
a JetBrains IDE, and you should commit the `.idea`, `.junie` or `.air` folder as evidence
("we encourage committing" it). Note the bonus prize is NOT only about this — see §6.

> "Projects must be either newly created by the Entrant or, if the Entrant's Project existed
> prior to the Hackathon Submission Period, must have been **significantly updated** after the
> start of the Hackathon Submission Period, for example with new features, a major redesign or
> support for new data. Updates that don't change the user experience, such as bug fixes or
> documentation changes, do not count."

Existing work is allowed here — unlike Kiroween. **GRID data is optional.**

## 5. Category

| Category | Blueprint the sponsor named | Fit |
|---|---|---|
| 1 — VALORANT tactical scouting | Utility Placement & Ability Analysis Engine, or Operator Tendency & Sniper Profiler | needs deep VALORANT domain knowledge |
| 2 — LoL macro scouting & draft management | automated Macro Scouting Tool, or **Modular Draft Organizer supporting Fearless Draft rules** | **chosen** |
| 3 — Event mini game | playable at a Cloud9 booth, Rider recommended | fun, but judged against games |

Category 2's own copy says the goal is to "eliminate spreadsheet chaos". That is a tell: the
real users are coaches running drafts out of Google Sheets, and the winning entry is the one
that is genuinely pleasant to use under time pressure, not the one with the cleverest model.

Riot constraint, verbatim: projects "must comply with Riot Games' applicable developer policies
(https://developer.riotgames.com/policies/general), and games must use original names, artwork,
assets and presentation rather than recreating Riot content."

## 6. Prizes

| Prize | Per category | Extras |
|---|---:|---|
| Best of Category | $6,000 | $100 Cloud9 store card, 1-year JetBrains All Products Pack, **GDC ticket + paid flights and hotel for one** |
| Runner-up | $2,000 | $100 store card, All Products Pack |
| Bonus prize | $1,000 | 1 winner overall — **Best AI-Powered Workflow Story** |

**Corrected 20 Nov 2026, from the submission form itself.** This section originally said the
bonus was for "the clearest evidence of JetBrains tool use". The live rules page and the
Devpost form are broader than that. Verbatim:

> **Bonus Prize: Best AI-Powered Workflow Story.** Show us how AI accelerated your build! To
> be eligible for this bonus prize, submit one of the following alongside your main entry
> (Categories 1–3): **A Short Case Study** — write a brief breakdown explaining how AI or
> JetBrains tools helped your team build and solve key challenges. **A Short Video Demo** —
> share a short video (suitable for social platforms or stories) demonstrating how AI tools
> powered your build process.
>
> Eligible Tools: JetBrains IDEs, AI Coding Agent Junie, or JetBrains Air.

So it is a story about the build process, not only a screenshot gallery, and the submission
form asks for a **direct URL** to the write-up or video. A documented, screenshotted
build-process write-up still wins it, and nobody else will bother — but it should be written
as a narrative with the problems it solved, not as evidence filed for inspection.

## 7. Submission checklist

- [ ] Project built with at least one JetBrains tool
- [ ] **Public repo** — GitHub, GitLab or Bitbucket all accepted here
- [ ] **Open source licence file**, visible in the repo's About section
- [ ] Commit `.idea` / `.junie` / `.air` as evidence of JetBrains use
- [ ] Text description that explains features **and demonstrates use of the required
      technology**
- [ ] Working demo link if it is a website; otherwise a judge-accessible build
- [ ] Demo video **under 3 minutes**, public on YouTube
- [ ] Bonus prize link, if chasing it

## 8. Judging — five equally weighted criteria

| Criterion | What it asks |
|---|---|
| Technological Implementation | "How thoroughly and skillfully does the project use JetBrains tools? Does the project reflect genuine effort and a working, non-trivial implementation?" |
| Design | "a complete, coherent product experience, not just a technical proof of concept" |
| Potential Impact | "a credible, specific case for solving a real problem for a real audience" |
| Quality of the Idea | "How creative and novel is the concept" |
| Presentation | "Does the video clearly demonstrate the project working end-to-end?" |

## 9. The project

**Working title: Fearless** — a draft organiser for League of Legends coaches that cannot
propose an illegal pick.

Fearless Draft bans every champion used by either team in previous games of the series, so by
game 5 a coach is tracking ~50 unavailable champions across five games while on a draft timer.
Coaches do this in spreadsheets and get it wrong.

- A deterministic rules engine owns champion availability: it derives the legal pool from
  series state, and it is the only thing allowed to say whether a pick is permitted.
- An advisor suggests picks and bans with reasoning. Every suggestion is filtered through the
  rules engine before it is shown; an illegal suggestion is displayed as blocked, with the
  reason and the game it was burned in. The model proposes, deterministic code decides.
- Draft board built for the clock: side selection, pick/ban order, timers, priority tiers,
  and a one-screen view of what is still available.
- Series state exports and reimports, so it survives a laptop dying between games.

The same pattern as the other two entries, in a domain where the correctness check is
objective and checkable — which makes the "measured, with provenance" numbers easy: a test
suite of real series states where the engine's legal pool is compared against ground truth.

## 10. Enrol

1. Open <https://cloud9.devpost.com/> and click **Join Hackathon**
2. Claim the **All Products Pack code** and the **AI Ultimate code** from the registration
   confirmation — "while supplies last", so do this today, not in January
3. Activate the All Products Pack first, then AI Ultimate on top of it
4. Install a JetBrains IDE (WebStorm or IntelliJ IDEA for a web stack; Rider if category 3)
5. Create the public repo with a licence on day 1
6. Build. Submit before 12 Jan 11:00 PT.
