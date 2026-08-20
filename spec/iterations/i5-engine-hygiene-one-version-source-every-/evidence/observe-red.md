---
form: observe-red
by: agent
signed_off: 2026-08-19T12:02:36.742Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

The five new files ran before any code changed. 20 cases, 3 pass, 17 fail.

EVERY FAILURE IS ITS OWN ASSERTION, not an import error. That was the one thing this state had to rule out, and it is ruled out: two files reach for things that do not exist yet — an `actor` key and a `statePaint` export — and both assert the absence explicitly rather than crashing on it.

THREE CASES PASS AND EACH IS A GUARD, not a hole. Two pin behaviour a fix must not break. One passes for a reason worth recording.

## red_observed

- [x] tsp-a-slow-signal-keeps-the-wait
- [x] tsp-a-vehicle-is-made-and-then-drives-something-else
- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-coupling-disposition
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-one-door-into-the-pool
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-the-engine-keeps-no-record-of-what-it-produced
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start

## follow_up

build-steps walks the five chunks in the drawn order.

THREE SPECS WERE CORRECTED, not the tests. The observation found more reds than the plan predicted, and the specs now record what the run found rather than what was expected.

WHAT TO WATCH AT build-steps: cases 6, 7, 12 and 13 must go green the moment their field or function exists, without their assertions changing. If any of them needs its assertion rewritten to pass, the case was measuring the fix rather than the demand.

## anything_else

THE THREE THAT PASS, one at a time, because a green before the build is exactly what this state exists to distrust.

- `a record with no stamp still reads` — GREEN and correct. It pins the fallback: records written before the stamp existed must keep reading, and the prefix rule survives for those and nothing else.
- `the reader still falls back silently` — GREEN and correct. The silent fallback at render time is settled, and a fix that removed it would trade a quiet boot for a dead panel.
- `a record carries the acting role the handler stated` — GREEN AND IT SHOULD NOT BE. It appends a record carrying an actor and reads it back, and a JSON line carries any key it is handed. The case passes before the field exists anywhere.

THAT LAST ONE IS THE FINDING OF THIS STATE. Its red is real but it lives at the TYPE gate rather than in the runner: the record type has no `actor`, so the case does not compile. A test-first case that passes against no design is what this state is meant to catch, and the honest disposition is to say where its red actually is instead of rewriting the case to fail louder.

THE COUNTS THE PLAN GOT WRONG, recorded rather than tidied. author-tests wrote "fourteen cases, nine red". The run says twenty cases, seventeen red. Two causes, both mine.

- The count was written from memory rather than from the files.
- Four cases expected green fail on the absence of the thing they assert about, because an absent field and an empty one read the same. That is the same confusion one level up that the empty-source row exists to end, and it is a small irony worth leaving on the record.

WHY THE SHELL RAN THE TESTS. This state grants `se_run` and not `se_test`, and its whole job is to run the new checks and watch them fail. The lane verb is illegal where the state stands, so the run carried its reason and the log has it.

THE CHECKLIST IS EVERY NON-TEST SPEC IN THE CORPUS, not only this delta's, and every one of them is ticked for the SECOND reason the state allows: red is impossible for a spec covering standing behaviour, and that is accepted.

WHY THAT IS AN HONEST TICK AND NOT A SWEEP. This delta authored five specs and all five are method `test`, so the engine observed their reds itself. The nineteen on the checklist are demonstrations and inspections from earlier records, over behaviour that already stands. There is nothing for them to be red about, because nothing they cover changed here.

WHAT WOULD MAKE A TICK DISHONEST, said so a later reader can check it: any of the nineteen naming a requirement this record touched. None does. The five rows this record wrote are verified by the five specs it authored and by nothing else.
