---
form: observe-red
judgment: passed at 2026-08-23T18:52:17.531Z
by: agent
signed_off: 2026-08-23T18:51:21.179Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

ONE NEW CHECK, AND IT IS A TEST, so the engine observes its red rather than a person.

THE CHECKLIST IS EMPTY BECAUSE NOTHING NEEDS IT. It holds the non-test specs — demonstration, inspection, analysis — where no run can show a red. This round minted one spec and its method is `test`.

THE SPEC IS `tsp-only-a-registered-module-emits` and its file is `deliverable/tests/widget-emitters.test.ts`.

IT FAILS TODAY FOR THE FIRST OF TWO REASONS. The test imports `deliverable/engine/widgets.ts`, which the first build chunk creates. Nothing green can come of a module that does not exist.

IT WILL FAIL A SECOND TIME AFTER THAT MODULE LANDS. The predicate flagged 38 of 171 engine sources on 2026-08-23 and the editor registry names twenty of them. Eighteen strays is the assertion failure, and clearing them is the last chunk.

THE TEST HOLDS NO COPY OF THE PREDICATE, deliberately. An earlier draft inlined it so the file would compile. That would have put one rule in two places, which is the exact failure this round found four separate times.

## red_observed

- [x] no non-test spec was minted this round, so no procedure needs walking by hand
- [x] the one new check is `tsp-only-a-registered-module-emits`, method `test`, and the engine observes its red at this submit

## follow_up

THE BUILD STARTS AT `the-widget-predicate`, which is what turns this red from a load failure into an assertion failure.

THE SECOND RED IS THE ONE THAT MATTERS. A module that merely exists makes the test run; only deciding the eighteen strays makes it pass. Both reds are in the drawing at `spec/iterations/i4-the-panel-round-the-archived-iteration-b/machines/build-chunks.md`.

NOTHING ELSE IS OWED HERE. No non-test spec was minted this round, so no procedure was walked by hand.

## anything_else

