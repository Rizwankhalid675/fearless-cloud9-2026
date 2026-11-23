# Devpost submission — Fearless

Project page: <https://devpost.com/software/fearless-rl2h3u> (currently marked
INCOMPLETE SUBMISSION)
Edit it: <https://devpost.com/submit-to/31571-cloud9-x-jetbrains-sky-s-the-limit-hackathon-2026/manage/submissions/1313675-fearless>

Every answer below is saved in the form and verified by reloading the page.
This file exists so the text is versioned and can be pasted back if the form
ever loses it.

**Deadline: 12 January 2027, 11:00 PT.** The submission is a DRAFT until the
fields in "Still to answer" are filled and Submit is pressed.

## Confirmed saved

Verified by reloading each step after saving, not by trusting the save.

| Field | Answer |
|---|---|
| Project name | Fearless |
| Elevator pitch | A Fearless Draft organiser for League of Legends coaches. A deterministic rules engine owns champion availability, so the AI advisor cannot put an illegal pick on screen. |
| Built with | react, vite, typescript, vitest, node.js, github-actions, playwright |
| Try it out | <https://rizwankhalid675.github.io/fearless-cloud9-2026/> and <https://github.com/Rizwankhalid675/fearless-cloud9-2026> |
| Demo video | <https://youtu.be/A_UkgPpzhfM> |
| Submitter type | Individual |
| Organization | N/A |
| Country | United States |
| Category | Category 2 (LoL) |
| New or existing | New |
| Repo URL | <https://github.com/Rizwankhalid675/fearless-cloud9-2026> |
| Demo URL | <https://rizwankhalid675.github.io/fearless-cloud9-2026/> |

The project story (7,091 chars), the methodology write-up (2,081), the judge
testing instructions (630) and the AI-tools answer (569) are all saved, and the
public project page renders them.

One practical note if anyone automates this form later: setting a field's value
with JavaScript looks like it works and silently does not save. The first pass
at this step appeared to succeed -- the URL advanced, no errors -- and every
field came back empty on reload. Values have to go in through real input
events.

## Still to answer — these need a person

Four of them depend on work that has not happened yet, and one set is a legal
declaration that is not mine to make.

| Field | Why it is blank |
|---|---|
| **Explain how your project meets the main technology requirement.** | The requirement is building with a JetBrains tool. Nothing has been built in one yet. |
| **Which JetBrains tools did you use?** | Same. |
| **Did you utilize the JetBrains Junie AI coding agent?** | Same — answer honestly once Junie has or has not been used. |
| Did you use JetBrains Air? | Optional. "No" unless that changes. |
| **Are you submitting for the bonus prize?** + Bonus Prize URL | The bonus is "Best AI-Powered Workflow Story". `docs/JETBRAINS.md` is the intended write-up and is still empty. Answer Yes and link it once it is real. |
| How much did this hackathon help you develop new skills? | Your opinion, not mine to invent. |
| How likely are you to use JetBrains tools again? | Same. |
| The eligibility attestations (age of majority, eligible jurisdiction, not an employee of the sponsors) | Legal declarations about you. Tick them yourself. |

## Re-verified 23 Nov 2026

Checked again rather than assumed, three days on:

- **Devpost submission 1313675: DRAFT, 3/5 steps done.** Every blank field is
  JetBrains-dependent, exactly as listed below — nothing else has gone missing.
  Already saved and intact: category, new/existing, the methodology write-up, the
  AI-tools answer, repo URL, demo URL, country, submitter type.
- **Repo is public**, MIT licensed, homepage set to the Pages URL.
- **Video is genuinely public** — `"isUnlisted":false, "isPrivate":false` read from
  the watch page. An oEmbed 200 does *not* prove this; unlisted videos return 200
  too.
- **The live site still serves `index-CfbdfETJ.js` / `index-BePOrruP.css`**, so the
  deployed build is still the submitted one.
- **Preflight: 24 passed, 0 warnings, 0 blockers.**
- **Suite: 102 passed / 10 skipped**, typecheck clean, working tree clean.

### The five unanswered dropdowns, with their real options

Read off the form on 23 Nov. Three are blocked by the session, one is answerable
now, one is an opinion that reads better after it.

| Question | Options | When |
|---|---|---|
| **Did you utilize the JetBrains Junie AI coding agent…?** | Yes, extensively / Yes, briefly / **No** | After. `No` is a perfectly good answer and costs nothing. |
| **Did you use JetBrains IDEs with JetBrains Air…?** | Yes / Partially / **No** | **Answerable now** — `No`. Not blocked by anything. |
| **Are you submitting for the bonus prize?** | Yes / No | After. `Yes`, with the Bonus Prize URL pointing at the filled `docs/JETBRAINS.md`. Leave `No` if Part 2 never gets written — an empty write-up scores nothing and an invented one is worse. |
| **How much did this hackathon help you develop new skills or knowledge?** | Not at all / A little / Somewhat / **A lot** / Significantly | Either. The build used familiar ground (TypeScript, React, Vitest); the genuinely new part is the IDE and its debugger. Honest answer before the session is `Somewhat`; after it, probably `A lot`. Waiting costs nothing. |
| **How likely are you to use JetBrains tools again…?** | Very unlikely / Unlikely / Not sure / Likely / Very likely | **After, necessarily.** The question says *again*, which presupposes having used them. There is no honest answer to it before the session. |

So the only field genuinely answerable today is **JetBrains Air → No**. The rest
are yours after the session, and all five are opinions or facts about what you
did — not mine to invent.

## Verified on 20 Nov 2026

- Deployed assets match the local build from HEAD exactly (`index-CfbdfETJ.js`,
  `index-BePOrruP.css`) — the live site is the submitted repo, not a stale build.
- Live board, cache-busted: demo loads (136 available / 37 gone / 30 burn chips),
  advisor returns "4 of 5 blocked by the rules engine" with the right reasons.
- No horizontal overflow at 320, 360, 375, 414, 570, 720, 860, 900, 980, 1100,
  1280, 1440 and 1600px.
- Devpost page: both links resolve, video embeds, screenshot present, and all five
  headline numbers match `docs/RESULTS.md`.
- Story now links `docs/JUDGE-WALKTHROUGH.md`, states the 10 skipped tests, and
  names the accessibility gap in the limits.

## The order to do it in

1. Install WebStorm with the All Products Pack code from the registration email.
2. Open this repo in it and do real work — `docs/JETBRAINS.md` lists four
   outstanding tasks suited to it, so the use is genuine rather than staged.
3. Commit `.idea/`.
4. Fill `docs/JETBRAINS.md` from what actually happened, including something a
   tool got wrong. A write-up that only shows the tool succeeding reads as
   marketing.
5. Answer the JetBrains fields above, tick the attestations, press Submit.

Nothing else is outstanding: repo is public with an MIT licence, the demo is
live, the video is public and under three minutes, and preflight is 24/24.
