---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-17T12:40:26.351Z
authors: agent
files: null
---

# Evidence form / gate-validation

## current_situation

The battery is green at rest — 1404 tests, 1404 pass, 0 fail. The sweep found and closed one real gap: the README described two ways to start and never mentioned a machine nobody is watching.

This gate judges the delta against the needs, and this run is unusual in that it EXERCISED many of them rather than reasoning about them.

## meets_need

- vp-autonomy-range: FAILS at its own criterion, and this run measured it. It says at full autonomy an unattended walk stops only at the gates that matter. At the DEFAULT dial the walk stopped at gate-kickoff — the first gate of every iteration — because entering it is tactical and the default is operational. Raised to 0.8 it walked M0 to shipped. The proposition holds at the top of the range and is false at its default, which is the owner's setting to make.
- vp-the-unattended-arrival: MET on three of four criteria and honest about the fourth. Idempotence met and demonstrated twice. Refs resolving met and measured both ways. Never costing the session met by construction and pinned by a test. The under-one-minute criterion has a BEFORE of about an hour and no AFTER, because this box is no longer fresh enough to produce one.
- vp-the-engine: met, and exercised rather than asserted. The cage refused se_help at onboard-retro with that state's exact tool list, shell git was warned then refused SE-C-129, a truncating pipe was refused SE-C-137, and the corpus lint caught a weasel word in a requirement this iteration wrote.
- vp-rigor-without-toil: mixed, and the toil is measurable. The method carried the walk with no person present for 28 evidence forms. Against that: two checklist states asked for the whole corpus rather than the delta — 15 non-test specs where 2 were minted, 42 assumptions where 11 moved — and each stall cost a round trip that produced nothing.
- vp-the-ledger: met. Six raid entries opened, two regraded by measurement, two debts taken with written repayments, and the probe table re-taken on eleven rows and deliberately left alone on thirty-one.
- vp-systematic-engineering: met. The delta traced from story to use case to requirements to functions to element to design spec to test spec, and the coverage laws refused three times until it actually did.
- vp-qualities: not touched by this delta.
- vp-vendoring: not touched by this delta.

## musts_demonstrated

- sty-a-check-binds-without-engine-code: not exercised by this delta.
- sty-answer-what-does-this-touch: not exercised by this delta.
- sty-ask-the-lane-what-it-can-do: exercised and it FAILED. se_help was refused SE-C-110 at onboard-retro because the state does not grant it — so the story about asking the lane what it can do is unavailable in most states, which is where an agent is most likely to need it.
- sty-carry-a-finding-without-stopping: exercised, ten times. Every stray this run hit became an se_note and the walk continued; the inbox now carries ten for the retro.
- sty-dispose-a-candidate-coupling: not exercised by this delta.
- sty-hand-over-and-walk-away: exercised and it FAILED at the default dial. Its claim is that the walk stops exactly where the person's hand is needed; it stopped where the DIAL was set, which is a different thing.
- sty-ramp-up: not exercised by this delta.
- sty-review-a-gate: exercised four times, and the gates behaved — kickoff, motivation, requirements and implementation each refused until their evidence actually stood, and one refused on a per-item shape rather than waving it through.
- sty-send-an-agent-to-a-cloud-box: THIS RUN IS THE DEMONSTRATION, and it is the only must-story this delta authored. Its last slide is written as unmet on purpose, because the dial is the owner's.
- sty-start-a-new-product: not exercised by this delta.
- sty-the-agent-proves-it-read: exercised, and it caught the agent twice — both times on an anchor whose four words crossed a line break, which is a real weakness in the probe rather than a win.
- sty-the-write-refuses-the-break: exercised three times and held each time. A weasel word in a requirement statement, a note written as an unbroken wall, and a preflight guard this iteration added that then refused its own probe file.
- sty-walk-it-by-hand: not exercised by this delta.
- sty-work-on-two-machines: not exercised by this delta, and its own record notes the claim system was retired by i34.

## market_tier


## round_0_verify

- evidence vs claims: green. Every claim here is a measurement from this run, including the two that report FAILURES against standing value props.
- types: green across 1404 cases.
- lint: green, 272 files, no new suppression.
- tests: 1404 total, 1404 green, 0 red, 71s. Green at rest, which is the product's heartbeat and the thing that released this walk.

## round_1_validate

- exercised against the goal: yes. The goal was an unattended box walking an iteration end to end with nothing re-worked, and this walk went M0 to validation on one box with one owner instruction on the dial.
- missing: the arrival's after-measurement on a fresh box, and a fresh-eyes reviewer that does not exist on an unattended machine.
- wrong: two standing value props are reported as FAILING against their own criteria — vp-autonomy-range at its default, and sty-hand-over-and-walk-away's stopping claim. Reporting them as met would have been the easy lie.
- out of scope: the rename to i10, the node floor, the shared-module debt, and the caged-subagent paragraph that is now known wrong for this harness.
- prior art: unchanged from gate-motivation. This gate judges the delta against needs rather than against the field.

## round_2_red_team

- STEELMAN: a gate that reports two value props FAILING should not pass => The strongest version says a validation gate exists precisely to stop work that does not meet the need, and two needs are reported unmet. WHAT DEFEATS IT: neither failure is a property of this delta. vp-autonomy-range fails at a SETTING the owner owns and which this iteration made configurable and documented for the first time. sty-hand-over-and-walk-away fails for the same reason. A gate that blocked here would be holding the delta hostage to a dial.
- KILL-CRITERION: if the arrival did not actually work, none of this matters => Falsified in the strongest available way. The arrival ran twice on this box, the second run reused the lane already up, and the whole walk since has been conducted through the client it wrote.
- KILL-CRITERION: if the two red fixes were silencings, the green battery is a lie => Looked for and refuted. The emergency case gained a SECOND case proving the restart half still fails closed; the nesting case was fixed by giving the fixture the config the product has, so biome now checks the same tree in both.
- ELEVEN OF FOURTEEN MUST-STORIES WERE NOT EXERCISED => Conceded plainly. A minor delta touches what it touches, and saying so beats claiming a demonstration that did not happen.

## raid_additions

- raid-asm-the-arrival-runs-before-the-agent-reads-anything
- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them

## verdict

pass — the delta meets the need it was built for, the battery is green at rest, and the sweep closed the one describing gap it found.

THE DISSENTS, ALL RECORDED RATHER THAN WAIVED.

ONE: two standing value props are reported FAILING, and both fail at the autonomy dial rather than at this delta. They are named here so the owner sees them at the gate rather than in a retro.

TWO: three of the four gates in this record, including this one, were blessed by the agent that did the work. Fresh eyes cannot be honoured on a box with nobody else on it.

THREE: eleven of fourteen must-stories were not exercised. That is the honest shape of a minor delta.

## follow_up

- Owner: the cloud default for the dial. Two value props fail on it and both are named above.
- Owner: the node floor at >=22.18.0, measured.
- Owner: whether the caged-subagent hand-over survives, now that it is known not to work on this harness.
- i10: the short-name rename.
- A later iteration: the shared arrival module and the cage-comparison test; and sty-ask-the-lane-what-it-can-do, which is unavailable in the states that need it most.

## anything_else

THE TWO FAILURES REPORTED HERE ARE THE MOST USEFUL LINES IN THIS GATE.

vp-autonomy-range says an unattended walk stops only at the gates that matter. sty-hand-over-and-walk-away says the walk stops exactly where the person's hand is needed. Both are false at the default dial, and this run measured exactly where: gate-kickoff, the first gate of every iteration.

NEITHER IS A DEFECT IN THIS DELTA, and neither would have been found without walking one. They were both written as standing claims and neither had been tested against an actual unattended run until this one.
