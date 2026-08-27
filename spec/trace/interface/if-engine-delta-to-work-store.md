---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-engine-delta-to-work-store
type: "[[interface]]"
statement: The compiled machine tells the store what a state owes, so minting reads the method rather than guessing it.
source: el-engine-delta
destination: el-work-store
carries:
  - flow-compiled-machine
form: a read of the compiled machine, at the moment a state is entered
bound: inherited — in-process, paid for by the pull that entered the state
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-form-is-built-and-checked
---

MINTING IS A FUNCTION OF THE METHOD, and this crossing is where the method
arrives.

WHAT IT CARRIES. The state's reading demands, its marked steps, and the
evidence it must produce. Those three are what the work is derived from.

WHAT THE STORE NEVER DOES: decide what a step means. It takes the marked
heading and the guidance beneath it exactly as compiled.

FAILURE BEHAVIOUR: a method that will not compile means no work can be minted.
The state refuses entry rather than minting a partial set, because a partial
set reads as a complete one.
