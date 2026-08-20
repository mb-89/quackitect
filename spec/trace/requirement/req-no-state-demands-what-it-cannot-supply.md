---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-no-state-demands-what-it-cannot-supply
type: "[[requirement]]"
statement: The engine shall refuse to compile a machine containing a state whose required evidence demands something no tool that state grants can produce, naming the state, the field and the verbs that would close it.
kind: functional
verify_method: test
breaks_if_removed: The walk reaches the state and has no legal move. The form asks for something, every verb that could make it is refused, and the only ways out are an escape or the shell — both failures, and both invisible to the engine because they happen outside it.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - deliverable/engine/bin/red-observed.ts
  - deliverable/engine/machine.ts
  - req-a-check-binds-without-engine-code
priority: must
---

## Detail

A STATE DECLARES TWO THINGS THAT HAVE TO AGREE.

- `legal_tools` — what may be called while standing there.
- its evidence form — what must be produced before it completes.

NOTHING CHECKED THAT THEY DID.

## Lived, twice

OBSERVE-RED could not call the test verb. Its whole job is watching new
checks fail, and its legal tools were the file verbs and `se_run`. The
agent reached for the shell. The owner's answer was to move the run into
the engine — the right fix, and one nobody would have needed if the
disagreement had refused at compile.

EVERY GATE ASKS `raid_additions`: name the register entries this review
added. Minting a register entry needs a write verb. Nine of ten gates
granted none.

MEASURED 2026-08-16, the first run of this check over the live matrix:
29 state/field pairs across four change-size columns, every one that same
shape.

## What counts as a demand

READ FROM DECLARATIONS, NEVER FROM PROSE.

- A FIELD WHOSE TEMPLATE RESOLVES. The form templates declare
  `resolves: artifact` (the named trace nodes must exist) or
  `resolves: file` (the named paths must exist on disk).
- A FIELD TYPED `files` or `run_ref`.

A state saying "run the tests" in a guidance sentence is not a
declaration. Guessing at sentences is how a check starts refusing correct
machines.

## What is not a demand

THE ENGINE'S OWN WORK. A `derived` field is computed by the engine, which
refuses a hand-written value — that is the whole point of the type.
`verification` grants no test verb on purpose, because its battery is
fired by its own exit script.

AN OPTIONAL FIELD. Nothing is owed, so nothing can be missing.

`all`. That is the whole lane, carried as a literal word rather than
expanded to every verb.

## Why the compile and not the state

REFUSING AT THE COMPILE NAMES THE STATE, THE FIELD AND THE VERBS. That is
a fix somebody can make.

Refusing at the state names nothing. By then the walk is standing in it
with no legal move, and the engine cannot see what happens next because
it happens outside the lane.

## Behaviour

NO MODEL WANTED. One pass over the states, one lookup per field, one set
membership test.
