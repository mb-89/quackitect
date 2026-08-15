---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-15T10:51:12.810Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input is complete for the delta. Five requirement rows stand, allocated across three functions, with one new flow and one story beneath them.

The register carries nine entries this record opened: one decision, two issues, five assumptions and one risk.

THE MILESTONE CHANGED WHAT COMES NEXT. A probe that was meant to cost three minutes found that a bound iteration records no test timings at all. The figure this record ranked its work by is from 2026-08-14 and cannot be refreshed until that is repaired.

So the register is sound and the ORDER behind it moved again, for the second time in this walk, both times because a cheap check was run instead of reasoned about.

## round_0_verify

- evidence vs claims: green. Every claim opened rather than trusted. The satellite's shape read from engine/satellite.ts lines 11 to 12 and dsp-satellite-lifecycle; the missing concurrency cap from engine/bin/selftest.ts line 145; the unwritten timings from the line count and hash of .se/test-timings.jsonl before and after two runs.
- types: green. npx tsc --noEmit exited 0 on the merged tree. No TypeScript changed since: this milestone wrote markdown only, which the commit stats for e00fe0dd and e9bff787 show.
- lint: green on this record's rows. se_lint swept 202 requirements, 155 clean, 60 findings across 47 files. Two were on a row this record wrote and both are fixed. The other 58 are standing debt on rows minted earlier, in the same class as note-70c755925b31.
- tests: green, twice. The full battery ran 1301 of 1301 with biome and preflight clean, then ran again on the unchanged tree with the same result. Both were run to probe the wall clock and neither recorded one.

## round_1_validate

- exercised against the goal: yes. The goal is unchanged from the seed and every row traces to it. What moved is the build ORDER, and it moved to obey the record's own measure-first instruction rather than to dodge it.
- missing: a test for req-surface-answers-in-one-second. The owner asked for one by name, and it cannot be written from inside the lane, because the lane forbids calling its own mirror. That is recorded as a spike rather than left as a blank.
- wrong: one thing, corrected inside the milestone. The first reading of the lane going unresponsive called it single-threaded blocking. The tests already run out of process; the real cause is an uncapped fan-out of test workers starving the engine of CPU.
- out of scope: unchanged from the kickoff's five exclusions, each with its home named. Nothing was quietly added and nothing quietly dropped.
- prior art: Node's own runner already emits per-case durations in the TAP stream, and the engine drops them. Jest, Vitest and go test all surface per-test timings in every mode, so we are behind there and it is an unread field rather than a tradeoff. What ours sheds is a verdict bound to the tree it judged, which refuses a run that would prove nothing; none of those three does that.

## round_2_red_team

- STEELMAN: this milestone produced five requirement rows and no function, and spent most of its effort on defects that are not the record's subject. A reviewer could fairly call it a milestone that went looking for interesting things instead of finishing its own => Half right, and the half that is right is the effort split. The defects were not sought: two of the four were found BY the milestone's own coverage checks, and one by its own probe. What the effort bought is that the record's ranking is now known to be unrefreshable, which no amount of writing rows would have found.
- The register is too small. Twelve items came in at the kickoff and five rows came out, so seven items have no demand behind them => Answered in write-requirements and it holds. Most of the twelve are the same demand at another surface, or they are MECHANISM. Caching the comparison walk and faking the git seam are how a budget gets met, and a mechanism written as a row freezes design as obligation.
- The timings finding may be an artefact of how the battery was invoked rather than a defect => Possible, and it is why the issue node names TWO candidate mechanisms and refuses to pick. What is not in doubt is the observation: two green runs, and .se/test-timings.jsonl unchanged at 260284 lines with the same hash.
- KILL-CRITERION for this gate: the design input is wrong if a row cannot be verified as written => Looked for, and one was found. req-surface-answers-in-one-second names verify_method test, and no test can measure it from inside the lane today. The row stands because the demand is right and the CHANNEL is the gap; the gap is now a scheduled spike rather than a promise.
- The seven probe fields this walk truncated were restored from git, so no harm stands => True, and the guard that caught it fires AFTER the write. That is now note-567aef4660ba, and it is the reason to check rather than to trust that nothing else was cut.

## raid_additions

- raid-iss-a-bound-record-records-no-test-timings
- raid-asm-slow-surface-is-not-self-contention
- raid-asm-node-tap-carries-durations
- raid-asm-waiting-makes-a-person-look-less

## verdict

pass — five rows, each with an EARS statement, a kind, a verify_method, a removal test and a priority, every one refining a use case and served by a function. Coverage closed in both directions by the engine rather than by assertion, and it found two standing holes on the way: a must from i27 that no function served, and one row whose characteristic was outside the ISO 25010 nine. TWO DISSENTS ARE LOGGED. req-surface-answers-in-one-second cannot be verified from inside the lane today, so its verify_method names a channel that does not exist yet. And the record's build order now rests on a finding rather than on the plan it was seeded with, which means the kickoff's ranking is provisional until the instrument is repaired.

## follow_up

- BUILD ITEM ONE: repair the timings instrument. A bound iteration must record what its runs cost, and a run that recorded nothing must say so in its own verdict rather than passing quietly.
- BUILD ITEM TWO: the scoped run keeps its durations, per req-scoped-run-records-its-timings.
- BUILD ITEM THREE: cap the test fan-out so the engine keeps a core, and measure both the wall clock and the lane's responsiveness rather than asserting either.
- Then re-take the ranking. Everything the kickoff ordered is provisional until a fresh measurement exists.
- Two notes are owed to the retro: note-5fc54baed71c on the fixed worker number, and note-567aef4660ba on the node-table truncation.
- Still owed to the owner: the field-feedback answer the onboarding retro asked for.

## anything_else

ON A MILESTONE THAT FOUND MORE THAN IT WROTE.

Four defects surfaced during M3 and none was hunted.

- A must from i27 served by no function, found by the coverage check at a submit.
- A characteristic outside the ISO 25010 nine, found by the same submit.
- Seven probe fields truncated by a form cell, found by the guard on the next submit.
- A bound iteration recording no test timings, found by running the cheapest probe in the register.

THE PATTERN IS THE SAME EVERY TIME. A mechanical check ran and disagreed with what everybody believed. Nothing here was found by reading carefully, and three of the four had been standing for days in artifacts that had already been reviewed.

That is the argument for the checks, and it is worth writing down at the gate rather than in a retro, because the gate is where somebody would be tempted to call them ceremony.
