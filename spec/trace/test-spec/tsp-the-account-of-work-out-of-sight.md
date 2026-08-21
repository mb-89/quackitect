---
minted_in: i51-work-running-out-of-sight-reports-itself
id: tsp-the-account-of-work-out-of-sight
type: "[[test-spec]]"
statement: One call lists every kind of work the session has started, and every entry states how much longer it needs together with what that figure rests on.
method: test
verifies:
  - req-one-call-reports-every-piece-of-work-out-of-sight
  - req-a-time-remaining-names-its-basis
files:
  - tests/work-account.test.ts
---

## Scope

The account itself: what is listed, and what each entry says about its own
future.

WHAT IS DELIBERATELY OUT. Whether a step's judgment holds the call is
[[tsp-a-leaving-check-hands-the-call-back]]. Whether the account reaches a
screen is outside this record entirely, and `flow-work-account` says so in its
own body.

## Approach

COMPONENT LEVEL, driving `jobList` directly. That function is where the account
is composed; `se_run`'s job listing is a thin wrapper over it, and testing the
wrapper would pass the moment the wrapper changed shape without the account
improving.

THE FIXTURE IS A TEMPORARY ROOT HOLDING BOTH KINDS. One shell job under
`.se/jobs` and one test run under `.se/test-jobs`, each a real record line in the
shape the product writes today.

WHY A FRESH ROOT PER CASE. Shared state is how a rare failure is born, and the
account is read out of a directory — a leaked entry from a sibling case would
make either assertion pass for the wrong reason.

THE DESIGN METHOD IS EQUIVALENCE PARTITIONING on the one axis that matters: the
KIND of work. Two kinds exist today and they are the two partitions. A kind added
later joins the same table and needs no new case, which is the point of
[[opt-one-operation-object-serves-every-kind-of-long-work]].

RISK DECIDES DEPTH AND BOTH ROWS ARE `must`. Two cases is the floor, and it is
what the surface can carry before it exists. Boundary cases are owed once it
does: an empty account, an entry whose progress file is missing, and an entry
that finished while nobody was looking.

## Steps

Every case in `tests/work-account.test.ts` is one step and its name states its
claim.

- ONE CALL LISTS EVERY KIND OF WORK OUT OF SIGHT, NOT JUST THE SHELL KIND. Fails
  while `jobList` reads `.se/jobs` alone, so a caller is told about one kind of
  work and never learns the other exists.
- EVERY ENTRY STATES HOW MUCH LONGER IT NEEDS AND WHAT THAT FIGURE RESTS ON.
  Fails while no entry carries a basis, and refuses a time remaining that arrives
  without one.

BOTH ARE RED AT AUTHORING. Measured 2026-08-21 in
[[exp-what-a-fresh-session-sees]]: `.se/jobs` held 35 entries, `.se/test-jobs`
held 1, and neither table can see the other.

THE SECOND CASE IS THE LOAD-BEARING ONE. A list without durations is a smaller
failure than a list of durations nobody can discount, which is why
[[raid-dec-the-duration-and-its-basis-are-one-return-value]] makes the two one
value rather than two fields a build could drift apart.

WHAT THE FILES CANNOT CARRY YET. The accuracy of a duration is not a case here
and never will be. The estimator over-predicted in one measurement and
under-predicted in another, recorded in
[[raid-asm-battery-timings-measure-work]], and the design survives that through
the basis rather than through a tighter number.
