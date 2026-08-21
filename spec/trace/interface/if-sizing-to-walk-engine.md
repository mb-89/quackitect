---
minted_in: i51
id: if-sizing-to-walk-engine
type: "[[interface]]"
statement: The instruction the sizing element has named a rung on returns to the walk engine, which is what hands it to the caller.
source: el-sizing
destination: el-walk-engine
carries:
  - flow-instruction
form: call, returning the instruction with its rung named
bound: inherited — an in-process return has no clock of its own and is paid for by the pull it answers
source_refs:
  - decompose-structure, the element matrix's owed cell
  - fn-run-a-governed-walk.hand-back-a-step-still-deciding
  - raid-dec-the-block-names-a-rung-and-never-a-model
---

THE OUTBOUND HALF OF THE SIZING ELEMENT'S BOUNDARY. The compiled step reaches
it through [[if-method-compiler-to-sizing]] and [[if-engine-delta-to-sizing]].
This is the sized instruction leaving.

WHY IT ONLY APPEARS NOW. The engine has always returned the sized instruction.
Nothing in the function model consumed `flow-instruction` inside this tree until
i51 minted `hand-back-a-step-still-deciding`, which does.

WHAT CROSSES: the instruction, carrying a rung and never a model
([[raid-dec-the-block-names-a-rung-and-never-a-model]]).

WHAT DOES NOT CROSS: any decision about the step's standing. The sizing element
starts nothing and judges nothing. Whether the step may be left is the walk
engine's own answer, reached on the other side of this boundary.

FAILURE BEHAVIOUR: no rung is a returned value and never a silence
([[raid-dec-the-no-match-is-a-returned-value-not-a-silence]]). The instruction
comes back either way.
