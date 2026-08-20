---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-breached-bound-reaches-a-reviewer
type: "[[test-spec]]"
statement: A gate review is shown the interfaces that breached their bound since the last review, verified by test over the gate's own form.
method: test
verifies:
  - req-a-breached-bound-is-put-in-front-of-a-reviewer
files:
  - tests/rounds.test.ts
---

## Scope

Whether the measurement reaches a person who owes an answer for it. Not
whether the measurement is accurate — that is the instrument's own spec — but
whether anybody is obliged to look at it.

## Approach

AT THE GATE'S FORM, because that is where somebody is already reading and
already signing. A surface nobody is obliged to open is the failure this row
exists to prevent, so verifying it on a surface would restate the defect.

THE CLAIM IS DEFINED HERE AHEAD OF ITS CASE, the same way tsp-claims-and-drift
defines the panel naming its fallen condition ahead of the build that closes
it. The mechanics are specified now; the case lands in rounds.test.ts with the
build.

WHY IT WAITS, AND ON WHAT. The row says "every instrumented interface". The
interfaces are not nodes yet — that is milestone one, and this iteration's
scope puts the milestones in a FORCED order for exactly this reason. There is
no denominator to enumerate until they exist, so a case written now would
either assert against a hand-typed list or assert nothing.

THAT IS AN ORDERING DEPENDENCY, NOT A GAP. It is named here rather than left
for somebody to discover at the build.

## Steps

Every case in the referenced file is one step; the case name states its claim.

The load-bearing step, defined ahead of its case: a gate whose window contains
a breach cannot be filled without the breach appearing in its form, and a gate
whose window is clean says so rather than showing nothing — because an empty
list and an absent list read identically, which is the same defect as a silent
control.

The second step: the window is "since the last review of this gate", so a
breach fixed and re-broken between two reviews appears at both.
