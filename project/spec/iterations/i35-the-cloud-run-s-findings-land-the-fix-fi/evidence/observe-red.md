---
form: observe-red
by: agent
signed_off: 2026-08-17T12:04:46.651Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

The new checks are tests/arrival.test.ts, 6 cases, bound by tsp-the-arrival.

THEY WERE GREEN FROM BIRTH, because the build preceded them: the arrival was written under an owner instruction mid-run, before the walk reached M7. Green-from-birth is exactly what this state exists to catch, and the engine is right to refuse it.

So the red is being observed properly, late: the guarantee under test is broken, the engine watches the check fail, and the break is reverted immediately after.

## red_observed

- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [owed] tsp-first-run — raid-debt-human-observed-demonstrations
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [owed] tsp-tour-run — raid-debt-human-observed-demonstrations
- [owed] tsp-desk-and-gates — raid-debt-human-observed-demonstrations
- [owed] tsp-bound-surface — raid-debt-the-bound-surface-demo-leans-on-two-open-records
- [owed] tsp-autonomy-tiers — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-coupling-disposition — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-derivation-analysis — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-prose-inspection — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-read-back-inspection — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-record-inspection — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-two-machines — raid-debt-demonstration-reds-are-re-asked-every-iteration
- [owed] tsp-unattended-start — raid-debt-demonstration-reds-are-re-asked-every-iteration

## follow_up

- The order was wrong here and the record says so: build, then test, then observe red. The state caught it, which is the system working.
- One pass line inside tsp-the-cited-refs-resolve is recorded as FAILING and stays failing: a ref refusal comes back as an untyped errored rather than a typed rejection with a remedy.

## anything_else

THE TWO CHECKED BOXES, AND WHAT WAS ACTUALLY OBSERVED FOR EACH.

tsp-the-arrival-in-one-act: no run can show this red — it is a demonstration spec whose subject is a box in a state a fixture cannot be put in. ITS RED WAS MEASURED RATHER THAN IMAGINED. On this box, before the arrival existed, the procedure took most of an hour and its one-minute pass line failed outright.

tsp-the-cited-refs-resolve: its red was measured too. Before the arrival, se_file_search at ref: main answered `fatal: ambiguous argument main: unknown revision` on this clone. After `git fetch --all --prune` ALONE it answered exactly the same, which is the half that surprises people. Both observations are written into the spec.

WHAT WAS DONE, EXACTLY, SO NOBODY HAS TO RECONSTRUCT IT.

se-hook-arrive.ts guarantees exit 0 whatever the arrival did — that is req-the-arrival-never-costs-the-session, and its failure is the silent kind. The guarantee was inverted to exit 1, the suite was run, and the case `the hook survives an arrival that fails, and says so` failed on assert.equal(r.status, 0). One assertion failure, five still green. The break was then reverted.

WHY THAT PARTICULAR BREAK: it is the requirement whose failure nothing else would reveal. A hook that ends a session start is worse than the hand-work it replaces, and nothing about that going wrong would look wrong.

AND IT IS AN ASSERTION, NOT A CRASH. The engine demands that distinction and it is right to: a check that crashes from birth proves as little as one that is green from birth, because it never reached its expectation.

THIRTEEN OF THE FIFTEEN BOXES BELONG TO OTHER RECORDS, and none of them had a red for THIS delta to watch.

Ticking them would have been fabricating thirteen observations. Leaving them blank stops the walk. The third state exists for exactly this, and every owed line names an OPEN register entry with a trigger, so the claim is addressed to somebody rather than merely declared.

FIVE WERE ALREADY COVERED by raid-debt-human-observed-demonstrations and raid-debt-the-bound-surface-demo-leans-on-two-open-records. The remaining eight had no entry, so i35 opened one: raid-debt-demonstration-reds-are-re-asked-every-iteration.

ITS REPAYMENT IS ALREADY BUILT ONE STATE LATER. M7_50_verification.md carries an owner ruling from 2026-08-15 that a claim covered by an open debt arrives PRE-FILLED rather than blank. observe-red has the identical problem and no such rule, and the matching is the same set operation.
