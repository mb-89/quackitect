---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-bless-outputs-ride-the-bless
type: "[[requirement]]"
statement: When a gate bless names a seeded output, the engine shall produce that output within the bless act.
kind: functional
verify_method: test
breaks_if_removed: The seeded output becomes a step after the gate, forgotten when the walk moves on.
breaks_how_badly: corrosive
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 6a
priority: should
weighs_against:
  - req-close-leaves-trunk-clean >
---

## Detail

## Detail

- Examples of seeded outputs: a compiled machine, a pinned column.
- The output is part of the gate record, never a follow-up task.
