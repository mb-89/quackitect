---
minted_in: i51-work-running-out-of-sight-reports-itself
id: if-walk-engine-to-work-registry
type: "[[interface]]"
statement: A step's leaving judgment registers itself when it starts, and its verdict lands back against the step it belongs to.
source: el-walk-engine
destination: el-work-registry
carries:
  - flow-work-under-way
  - flow-wait-bound
form: call to register, then a call to settle
bound: inherited — both calls are in-process and are paid for by the pull that started the judgment
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three
---

TWO CALLS, AND THE SECOND IS WHAT MAKES THE FIRST HONEST.

REGISTER names the step the judgment belongs to. Without that name the verdict
has nowhere to land, and `req-a-pending-verdict-is-recorded-against-its-state`
is unmet.

SETTLE carries the verdict when the judgment ends. Until it arrives the step's
standing is the third word, still deciding.

WHAT THE REGISTRY NEVER DOES: decide what the verdict means. A refused hop is
the walk engine's judgment, and this contract only moves the fact.

FAILURE BEHAVIOUR: a judgment that dies without settling leaves the entry
running past its own process. The registry reads the process, finds it gone,
and settles the entry as failed rather than leaving it deciding for ever.

## What i62 added to this crossing

THE BOUND TRAVELS WITH THE REGISTRATION, on the call that already exists.

A step that starts a leaving judgment is entering a wait. Naming how long that
wait will last is one more thing the register call says, not a second
exchange.

WHY IT IS NOT A NEW INTERFACE. The pair, the direction and the form are
unchanged. Only what is carried grew, and a new interface here would be a
second contract between two elements that already have one.

WHAT THE BOUND IS NOT. It is not a time remaining. That says how much longer
the work needs; this says how long the waiting will go on, and the two disagree
exactly when the wait is about to end something.
