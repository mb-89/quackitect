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
  - "owner ruling 2026-08-06: a method change lands in trunk and every open worktree at once"
  - "owner ruling 2026-08-13: we change the machine in walks, so we need to change method in walks"
  - "measured 2026-08-13: one method edit cost five calls, four of which did no work"
  - "owner ruling 2026-08-14: an iteration does not fold back - its method changes instantly and that is okay; the goal is that iterations do not get in each other's way"
  - req-an-engine-change-applies-in-its-own-record
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

THE OWNER'S IPO READING REPLACES IT. An iteration does not fold back.
Input is the method the record entered with. Processing is the walk,
local changes included. Output lands at close, like every other output a
record produces. So a method change made inside a record is LOCAL to that
record until it lands, and that is correct rather than a gap.

DIVERGENCE DURING A WALK IS THEREFORE INTENDED. Two open records may run
different method for as long as both are open. Landing resolves it, and
landing already exists.

WHAT STILL MATTERS is the half that was never about the fan: nobody
leaves their record to change the machine they are walking.

WHETHER THE CHANGE REACHES OTHER RECORDS IS THE DESIGN'S TO CHOOSE, and an
earlier draft of this row got that wrong. It demanded that every other open
record be left unaltered, which is a SOLUTION rather than a demand, and it
disqualified two candidates by itself. The owner questioned it the same day.

SO THIS ROW ASKS ONE THING ONLY: no step-out. Reaching every tree, reaching
none, or reaching some is a design choice this row does not make.

THE ENGINE'S CASE IS DIFFERENT AND STRICTER.
req-an-engine-change-applies-in-its-own-record does forbid poisoning another
agent's work, because the owner ruled that half explicitly for the engine and
not for method.

THE ID IS NOW A MISNOMER. It reads reaches-every-tree and the row no
longer asks for that. Renaming breaks every inbound link, so the rename
is owed as a sweep rather than done here.

## The direction that matters

TRUNK IS THE SOURCE AND NEVER THE DESTINATION for a stale copy. Whatever
a design chooses, an old tree must not push its version outward. That is
exactly the 2026-08-07 failure, which cost two lane verbs.

## Behaviour

No model wanted. One invariant, checked with two records open: the change
is live where it was made, and no other open record answers differently.
