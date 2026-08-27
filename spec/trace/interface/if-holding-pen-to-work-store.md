---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-holding-pen-to-work-store
type: "[[interface]]"
statement: A judged item leaving the pen becomes a piece of work the store holds, and the pen stops counting it.
source: el-holding-pen
destination: el-work-store
carries:
  - flow-standing-option
form: one call carrying the item and where it is going
bound: inherited — one write, on the drain that judged it
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-the-raw-note-stays-local-and-is-marked-drained
---

THE PEN HOLDS WHAT NOBODY HAS JUDGED. The store holds what somebody has.

WHAT IT CARRIES. A standing option, already authored rather than pasted, with
the re-entry condition that says when it becomes ready.

WHY THE TWO MUST NOT MERGE. An undrained capture sitting in a list of work is
unjudged text presented as something a hand could commit to. The count and the
offer answer different questions.

FAILURE BEHAVIOUR: a refused write leaves the item exactly as it found it. It
stays pending, and it stays inside the pen's count.
