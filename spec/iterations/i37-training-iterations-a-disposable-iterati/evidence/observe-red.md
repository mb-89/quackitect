---
form: observe-red
by: agent
signed_off: 2026-08-20T09:46:18.710Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

observe-red, and the red is observed.

`tests/benchmark-run.test.ts` RUNS 22 CASES AND 19 FAIL. Every failure is an assertion — `testCodeFailure` — and not one is a crash. That distinction is the state's whole point: a crash never reaches its expectation, so it says the check file is broken rather than that the design is unrealized.

THE THREE ENGINE FILES EXIST AS STUBS, and that is why the failures reach their assertions. `benchmark.ts`, `benchmark-guard.ts` and `benchmark-report.ts` carry the real API shape and answer neutrally. Importing a file that does not exist would have produced 22 crashes and no measurement.

THREE CASES PASS AND THEY PASS FOR THE WRONG REASON. All three assert an ABSENCE that a no-op satisfies for free: a report with every field has no problems, and an unbound lane conceals nothing. They are named here rather than hidden, and they go green for the right reason only once their siblings do.

## red_observed

- [x] tsp-a-benchmark-run-leaves-the-archive-untouched
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

- build-steps is next and it opens with the trunk merge, which is the first state on this walk where se_git is legal.
- FIVE CHUNKS, TWO OF THEM INDEPENDENT. stand-the-rewound-tree and derive-what-the-walk-cost share nothing and can fan out; the other three chain behind them.
- THE THREE VACUOUS PASSES ARE A JOB, not a note. Once `concealedFromLane` really answers, the unbound case stops being free. Verification should confirm all 22 are green for a reason.
- conceal-the-reports-while-a-run-is-bound WILL NOT GO GREEN in this iteration. Four of the 22 cases belong to it and they stay red, waiting on wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-.
- THE INSPECTION SPEC CANNOT BE HONESTLY RE-WALKED until a run has happened. It is checked here against the tree as it stands; verification is where it means something.

## anything_else

ONE CASE IN THIS FILE IS THERE BECAUSE OF A PROBE RESULT RATHER THAN A REQUIREMENT.

`the conditions stamp names every directory it covers, not the matrix alone` asserts a SET of six directories. The requirement only asks that a report carry its conditions, and a report stamping `rigor_matrix_hash` would satisfy it as worded.

IT WOULD ALSO BE A LIE, and the lie is measured. `rigorMatrixContentHash` hashes `rigor_matrix/rows/*.md` and nothing else. Guidance, form templates, item templates, method cards and the engine all change what a walk costs and none of them moves that hash. The placeholder fix shipped during this iteration turned an unwalkable chain into a walkable one and moved zero rows.

SO THE CHECK IS WRITTEN AGAINST WHAT THE STAMP MUST COVER rather than against what the requirement literally says. Writing it the narrow way would produce a green test over a benchmark whose central control does not control.

THAT IS THE SAME MOVE THE CONCEALMENT CASES MAKE, for the same reason. Four exclusion lists disagree, so those cases assert the CALL SITES by name and assert their count. A test written against one list would pass while three quarters of the lane leaked.

TWENTY OF THE TWENTY-ONE BOXES ON THIS FORM ARE NOT i37'S, AND THEY ARE MARKED OWED RATHER THAN TICKED.

`$claim-specs` resolved every non-test spec in the project with no owner. This state asks whether every NEW check failed BEFORE the build. Ticking a box for a red another iteration observed months ago, on a spec I did not author, would be asserting something I never saw.

THE STATE DISAGREED WITH ITSELF, which is what makes this a defect rather than a design choice. `engine/bin/red-observed.ts` filters test specs by `minted_in` and skips every one that is not the record standing here. The form half filtered nothing. One state, two halves, opposite answers about whose specs it is asking about.

THE SAME BUG WAS FOUND AND FIXED ONE FUNCTION AWAY. `$promotions` returned every promoted experiment in the project until the ruling of 2026-08-13 scoped it, and `tests/promotions-stay-home.test.ts` pins it. `claimSpecItems` sits directly above `promotionItems` in `engine/stateform.ts` and was left unscoped.

IT IS FIXED AND IT IS NOT LIVE HERE. The scoping is written, `tsc` is clean and `tests/checklists-stay-home.test.ts` pins it, but the engine serving this walk loaded the old code and `se_reload` is not legal at observe-red. So the owed marks stand, which is the third state the checklist template exists to provide.
