---
form: verification
by: agent
signed_off: 2026-08-20T10:55:12.943Z
authors: agent
files: null
---

# Evidence form / verification

## current_situation

verification, by a tester subagent with fresh context. IT FAILS, and the findings are real.

FOUR OF THEM INDEPENDENTLY MEAN A REAL RUN CANNOT PRODUCE A TRUSTWORTHY NUMBER. The cost derivation returns empty on a real log, an empty rewind is indistinguishable from a correct one, the ceiling is wired to no verb, and nothing can start a run at all.

THE SUITE IS GREEN ANYWAY, and the tester explains why: the fixture invents a record shape the product never emits, and several cases assert against module constants or unfalsifiable conditions.

I VERIFIED THE CENTRAL FINDING MYSELF rather than taking it. `CallRecord` in `engine/calllog.ts` carries ref, ts, tool, args, ok, outcome, duration_ms, response, actor and se_version. There is NO `where` field, and `outcome` is the enum `result | rejected | errored` — never a clause. `costPerState` reads both. It attributes nothing.

NOTHING IS FIXED HERE. The discipline card says collect everything before fixing anything, because fixing mid-verification blinds the rest of the run. fix-findings is the state that fixes.

## claims

- [owed] tsp-a-benchmark-run-leaves-the-archive-untouched — raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in
- [owed] tsp-a-slow-signal-keeps-the-wait — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-a-vehicle-is-made-and-then-drives-something-else — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-autonomy-tiers — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-bound-surface — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-coupling-disposition — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-derivation-analysis — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-desk-and-gates — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-first-run — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-one-door-into-the-pool — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-opening-the-folder-is-the-whole-interaction — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-panel-walkthrough — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-prose-inspection — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-read-back-inspection — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-record-inspection — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-the-arrival-in-one-act — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-the-cited-refs-resolve — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-the-engine-keeps-no-record-of-what-it-produced — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-tour-run — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-two-machines — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
- [owed] tsp-unattended-start — raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger

## follow_up

THE FINDINGS, ranked, for fix-findings. Numbers are the tester's.

- 1 — `costPerState` READS FIELDS THAT DO NOT EXIST. `rec.where` is absent from `CallRecord`; the clause lives in `response.clause`, not in `outcome`. Measured on the live log: 13,619 records, 2,298 pulls, 0 with `.where`, and `costPerState` returns `{}`. CONFIRMED independently against `calllog.ts`.
- 2 — THE RAID ASSUMPTION'S PREMISE IS WRONG. `raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls` says every `se_pull` carries its `where`. The pull RESPONSE does, as a `string[]` inside a CAPPED summary: 2,233 of 2,298 responses are truncated to invalid JSON, and 31 are recoverable. So the boundaries are not recoverable by inference at all.
- 3 — AN EMPTY REWIND REPORTS SUCCESS. `countFiles` runs AFTER the CURRENT dirs are copied forward, so `files > 0` is satisfied by the copy. The `stood empty` refusal can only fire when git itself errors. Reproduced against an empty root commit: 2 files, `project/spec` absent, guard passes.
- 4 — THE POSITIVE CONTROL IS NEVER CALLED. `controlFilesPresent` says of itself that it is part of the design rather than the test; `benchmarkBind` never calls it. With 3, there is no product-path defence against an empty rewind.
- 5 — THE CEILING IS WIRED TO NOTHING. `resolvesInBoundTree` returns a bare boolean, so a missing `.git` and an out-of-range commit are indistinguishable. No lane verb consults it or `isBound`.
- 6 — THE RUN HAS NO DOOR. The three modules are imported by exactly one file, the test. There is no `se_benchmark` verb, no bin entry, no CLI. `el-benchmark-binding` specifies one and it was not built.
- 7 — SENTINELS LAUNDER ABSENCE PAST THE GUARD. `unknown`, `unpinned` and `gone` are non-empty, so `reportProblems` passes a report whose harness, model and effort are all absent. `SE_HARNESS`/`SE_MODEL`/`SE_EFFORT` are read in one place and set nowhere, and `mcp.ts` already stamps the harness on every record.
- 8 — THE STAMP SET IS COMPUTED AND THEN DISCARDED. `conditionsFor` iterates only the eight conditions and drops every per-directory hash; the item template has no `stamp_covers` field though its own prose demands one. A real report stamps the matrix alone, which this iteration called a lie in writing.
- 13 — `forms_refilled` COUNTS THE WRONG THING. Any failing call arms it, not a failing form, so an unrelated refusal before the first form yields a refill. A genuine refill is lost across a state change. A pull with no `where` bills its whole duration to the previous state. Calls before the first pull vanish with no unattributed bucket.
- 14 — `refs/bench/<id>` IS WRITTEN INTO THE LIVE REPO AND NEVER CLEANED UP. Invisible to `git status`, so the inspection checklist passes over it — the one method chosen to catch a write somewhere unexpected.
- 15 — THE TEMPLATE PROMISES A FORBIDDEN REQUEST NOTHING IMPLEMENTS.
- 9 and 10 — WHY THE SUITE WAS GREEN. Two stub-driven passes, three tautological ones, and roughly half the specs' named steps have no case at all.
- 11 — THE INSPECTION SPEC CANNOT BE PERFORMED and observe-red ticked it anyway. That tick was mine and it was wrong; the honest mark was owed.

## anything_else

THE VERIFICATION WORKED, AND THAT IS THE FINDING I WANT ON THE RECORD.

EVERY CHECK I RAN WAS GREEN. `tsc` clean, biome clean, preflight green, sweep green, 1616 of 1618 passing with both failures declared. I signed four build chunks on that evidence and believed the build was sound.

THE TESTER RAN THE SAME CODE AGAINST THE PROJECT'S OWN CALL LOG and the central function returned `{}`. Nothing in my battery could have caught it, because the fixture I wrote invents the record shape.

THAT IS THE BUILDER-VERIFIES-THEIR-OWN-BUILD FAILURE, EXACTLY AS THE CARD DESCRIBES IT. Familiarity is what hid the fault: I wrote `CallRecordish` from the design document rather than from `CallRecord`, and then wrote a fixture from `CallRecordish`. The test and the code agreed with each other and neither agreed with the product.

ONE THING THE TESTER COULD NOT DO, and it matters for how this project spawns testers. THE `se` LANE WAS NOT IN ITS TOOL SET. It reported `No matching deferred tools found` for every lane verb and fell back to native tools, which were not blocked for it. The contract says to pass the lane rule to every subagent, and I did — the rule was correct and the tools were absent. So findings 5 and 10 rest on reading `tools-file.ts` and grepping callers rather than on driving the verbs.

THAT IS A GAP BETWEEN THE CONTRACT AND THE HARNESS, not a fault of the tester, and it belongs in a retro. A cage the parent is in and the child is not means fresh eyes see a different project than the walk does.
