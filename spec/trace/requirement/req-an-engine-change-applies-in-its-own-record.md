---
minted_in: i27
id: req-an-engine-change-applies-in-its-own-record
type: "[[requirement]]"
statement: When an agent changes the engine while working on a record, the engine shall put that change into effect for that agent's next call without the agent leaving the record, and shall leave every other agent's work unaffected by it.
kind: functional
verify_method: test
breaks_if_removed: The machine cannot be improved while it is walked, because every engine change costs a step out of the work, and a change made by one agent silently changes what every other agent is running.
breaks_how_badly: fatal
measure: With two agents at work, an engine change made by one takes effect on that agent's next call with zero steps out of their record, and zero calls by the other agent answer differently than before the change.
refines:
  - uc-change-the-method-mid-walk
  - uc-take-a-step
source_refs:
  - "owner ruling 2026-08-14: an engine change that one agent makes while working on his own work set shouldn't have an influence on other agents working on something else, and he shouldn't have to step out his own work set to change the way he works on his own work set"
  - "owner ruling 2026-08-14: the engine is hot swappable, and an engine swap doesn't poison the work of another agent in another record"
priority: must
---

## Scenario

- Source: an engineer walking a record, changing the machine that runs it.
- Stimulus: they edit the engine's own code from inside that record.
- Artifact: the running engine, and whatever else is serving other records.
- Environment: one or more records open, normal operation.
- Response: their next call in that record runs the changed engine; every
  other open record answers exactly as it did.
- Response measure: one call to take effect, zero other records altered.

## Detail

THE METHOD ROW AND THIS ROW ARE THE SAME SHAPE AND NOT THE SAME DEMAND.
Method is content the engine reads. The engine is the running code. Reading
new content on the next call is ordinary. Running new code without stopping
is not, and that difference is what a design has to answer.

MEASURED COST OF THE ABSENCE, on 2026-08-13: eight step-outs in one
session, three inside a single verification. Every engine edit today needs
a reload, and a reload ends what was in flight.

## The two halves pull apart

- NO STEP-OUT wants the change live for the agent who made it, without them
  leaving what they were doing.
- NO POISONING wants every other agent's work untouched by it.

A design meeting only the first changes the machine under agents who never
asked. A design meeting only the second is what stands today: safe, and it
costs a step out of the work every time.

## What this row does NOT say

IT NAMES NO MECHANISM, and an earlier draft did. That draft said the change
applies "in its own record", which is a SOLUTION - locality is one way to
keep one agent's change off another's desk, not the demand itself. The owner
caught it the same day.

So nothing here chooses between one engine per record, a swap inside one
engine, a sub-engine spawned when work starts, or something nobody has drawn
yet. Whether the record's own tree carries the machine it may change is
EXPLICITLY FREE (owner ruling 2026-08-14: "I don't care. It can. It's not
forbidden. It just needs to be seamless").

IT DOES NOT FORBID A RESTART either, so long as the agent does not have to
perform it or wait through it. What is forbidden is the step out.

THE ID IS A LEGACY NAME. It reads applies-in-its-own-record, which was the
solution-shaped draft. The owner allowed the name to stand; the statement is
what binds.

## Behaviour

No model wanted. One invariant, checked with two records open.
