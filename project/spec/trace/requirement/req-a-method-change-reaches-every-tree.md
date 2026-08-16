---
minted_in: i27
id: req-a-method-change-reaches-every-tree
type: "[[requirement]]"
statement: When an agent changes method while working on a record, the engine shall put that change into effect for that agent's next call without the agent leaving the record.
kind: functional
verify_method: test
breaks_if_removed: An engineer cannot change the machine while walking it, so iterations cannot be used to develop the system that runs them.
breaks_how_badly: fatal
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - sty-improve-the-machine-mid-walk
  - "owner ruling 2026-08-13: we change the machine in walks, so we need to change method in walks"
  - "measured 2026-08-13: one method edit cost five calls, four of which did no work"
  - req-an-engine-change-applies-in-its-own-record
  - "i34 2026-08-16: retired in error and restored the same day"
priority: must
---

## Detail

THIS PRODUCT DEVELOPS ITSELF. An iteration here exists to change the
machine, and the change is made while walking the machine it changes.

So the blocking is not an inconvenience inside the process. It
forecloses the process's main use, which is why this row is a must and
not a should.

MEASURED: eight step-outs in one session on 2026-08-13, three of them
inside a single verification. One edit cost five calls and four of them
did no work.

## What this does NOT say

It does not say the guard against a method write from a bound record
disappears. That guard exists because a method write once fanned a
record's stale copy over trunk and deleted two lane verbs.

THE GUARD RETIRES ONLY WHEN THIS ROW IS MET, never before. Removing it
without the mechanism removes the cost and the protection together.

## Restated 2026-08-14, and what changed

THE FAN-OUT WAS A MECHANISM FROZEN INTO A DEMAND. This row used to say
the change lands "in trunk and in every open worktree in one act". That
names HOW, and a `must` that names how refuses a design for not using it.

SO THIS ROW ASKS ONE THING ONLY: no step-out. Reaching every tree, reaching
none, or reaching some is a design choice this row does not make.

THE ENGINE'S CASE IS DIFFERENT AND STRICTER.
req-an-engine-change-applies-in-its-own-record does forbid poisoning another
agent's work, because the owner ruled that half explicitly for the engine and
not for method.

THE ID IS A MISNOMER. It reads reaches-every-tree and the row does not ask
for that. Renaming breaks every inbound link, so the rename is owed as a
sweep rather than done here.

## Deleted in error by i34, restored the same day

i34 retired this row as "satisfied by construction, so it measures nothing".
Half of that is right and the half it got wrong is the statement.

WHAT i34 REALLY MADE VACUOUS is the old Behaviour line, which read "the change
is live where it was made, and no other open record answers differently". With
one tree no record can answer differently, so that invariant checks nothing and
it is struck below.

WHAT SURVIVES IS THE STATEMENT ITSELF: no step-out. An agent changes method
from inside a record without leaving it. That is a real property, it can
regress, and restoring a refusal on method writes from a bound record would
break it tomorrow.

IT IS MET TODAY, AND BY MECHANISM RATHER THAN BY LUCK. `Session.laneRoot`
classifies a method path and resolves it to the machine root, so the write
lands correctly instead of being refused. Before that, refusing the write was
the answer, and refusing is exactly what forced the step-out this row measures.

THE ROW WAS RETIRED ON ITS ID, NOT ITS STATEMENT. The id says
reaches-every-tree, i34 deleted the trees, and the reasoning stopped there —
four lines above a paragraph saying in as many words that the id is a misnomer
and the row no longer asks about trees.

A DEMAND THAT IS MET IS NOT A DEMAND THAT IS DEAD. Satisfying a requirement is
the reason to keep checking it, never the reason to delete it. That is the
same distinction req-trees-never-mix turned on, reached by a different road.

## The restoration is contested, and both readings are here

A VERIFIER READ THE SAME ROW AND CONCLUDED THE DELETION WAS DEFENSIBLE. Its
argument, at its strongest: the row asks only for no step-out, and with one tree
there is no other tree to step out to, so one tree satisfies it by construction.
It cited this row's own lines saying the id is a misnomer.

THE ARGUMENT FOR KEEPING IT is that the row is still FALSIFIABLE, which is the
test that separates a vacuous row from a met one. "Leaving the record" no longer
means changing trees, but it still means unbinding. An engine that refused a
method write from a bound record — which is exactly what it used to do, and what
the 2026-08-07 accident argued for — would break this row tomorrow, one tree or
not. What satisfies it today is `Session.laneRoot` classifying the path, not the
tree count.

A ROW THAT CAN BE BROKEN IS NOT VACUOUS, and vacuity is the only ground for
deleting a met requirement. That is why it is restored rather than left out.

THE ADJUDICATOR DECIDES. Both readings are recorded here because neither side
built the other's case, and the disagreement is about what "by construction"
means — which is a method question, not a fact about the code.

ONE RESIDUE EITHER WAY, and the verifier is right about it. This row was
SE-C-134's retirement condition: "THE GUARD RETIRES ONLY WHEN THIS ROW IS MET,
never before." The guard is retired. The condition was deleted rather than
marked satisfied, so nothing records that the bargain was kept.

## Behaviour

No model wanted. One invariant: a method change made from inside a bound record
takes effect on the next call, with no step-out.

THE SECOND HALF OF THIS INVARIANT IS STRUCK. It read "and no other open record
answers differently", which one tree makes trivially true. What replaced that
demand, and what i34 gave up with it, is recorded on
req-shared-change-reaches-without-unlanded-work-reaching.
