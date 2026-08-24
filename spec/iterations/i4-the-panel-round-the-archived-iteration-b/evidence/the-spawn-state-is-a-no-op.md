---
form: the-spawn-state-is-a-no-op
by: agent
signed_off: 2026-08-23T19:38:38.180Z
authors: agent
files:
---

# Evidence form / the-spawn-state-is-a-no-op

## current_situation

THE SPAWN STATE PRINTED A GREEN THAT READ LIKE A SPAWN HAD HAPPENED. At a ceiling of zero it reported "0 walker(s) running, ceiling 0", which is true and says nothing about what the state is for.

THE STATE WAS NEVER BLOCKING. Its evidence field is `required: false` and its exit script passes at zero, so the walk already went through it without the agent answering anything.

## built

THE ZERO CASE SPEAKS FOR ITSELF NOW. `deliverable/engine/bin/hands-spawned.ts` answers at a ceiling of zero with "no walkers for this record. The ceiling is zero, so this state is a pass-through" and stops there.

IT NAMES THE DEFAULT rather than reading as an omission. A record asks for a walker deliberately; one that has not asked runs none.

A WALKER REGISTERED AT A CEILING OF ZERO IS STILL REPORTED, as the ceiling being exceeded rather than met. Silence there would have been the check going soft in the one case it is most likely to be wrong.

### What is NOT built, said plainly

THE STATE IS STILL WALKED. The chunk statement asks for it to be SKIPPED, and it is not.

SKIPPING NEEDS A MACHINE THAT CAN DISABLE A STATE, and that does not exist. A compiled machine is fixed at seed time — `deliverable/engine/machines/compile.ts` has no rigor filter and no notion of a state being off — so the drop would have to happen either at seeding, before the ceiling is known, or as a new runtime mechanism.

WHAT THE WALK ACTUALLY DOES TODAY is pass through without stopping. The three spawn states in this record were walked and their judgments passed without the agent being asked for anything. The cost is one state on the drawing that can never do anything, not a stop.

I AM NOT BUILDING THE DISABLE MECHANISM IN THIS ROUND. It is a change to how every machine is compiled, and it belongs to a record that is about machines.

## follow_up

DISABLED STATES ARE THE REAL FIX and they are a record of their own. The shape the owner described: one state machine, states that turn off when they cannot do anything, controlled by the walker ceiling, invisible and skipped when off.

THE HOOK EXISTS ALREADY IN THE ROWS. Every matrix row carries `floor`, `major` and `minor`, which is a disable mechanism keyed on rigor. Keying one on the walker ceiling would follow the same shape rather than inventing a second.

THE CEILING IS READ IN ONE PLACE, which is what makes this feasible. `walkerCeiling()` reads the kickoff gate's own evidence in the record's folder, and the compiler would need the same read.

## anything_else

