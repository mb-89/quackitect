---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-adjudicate-a-gate
type: "[[use-case]]"
statement: Judge whether the work behind a gate is good enough to build on, and record the judgment.
actor: stk-engineer-driving-agents
trigger: the walk reaches a gate
precondition: the gate's evidence form is filled
guarantee: the gate is blessed or rejected by a person, and the record keeps whose hand it was and when
refines:
  - sty-review-a-gate
priority: must
---

## Main scenario

1. The walk stops at the gate and says so.
2. The person opens the gate's evidence form, not a summary of it.
3. They read the rounds: what was verified, what was validated, what the red team tried to kill.
4. They open the artifacts the evidence points at, and read those rather than the claims about them.
5. They bless it.
6. The record keeps the bless with its hand and its time, and the walk moves on.

## Extensions

- 3a. A round is filled with words that assert rather than show. That is a rejection, and the reason names it.
- 4a. An artifact does not say what the form claims. The gate is rejected with one line naming what to redo.
- 4b. A path in the evidence resolves to nothing. The gate fails on that alone.
- 5a. The person rejects. The walk does not advance, the agent fixes the artifact rather than the sentence about it, and the form is filled again.
- 6a. The gate's bless also seeds something — a compiled machine, a pinned column. That output is part of the gate, not a step after it.
