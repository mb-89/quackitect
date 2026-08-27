---
minted_in: i1
id: fn-run-a-governed-walk.close-a-record
type: "[[function]]"
cluster: the-record-life
statement: end a record by ruling on everything it produced, leaving nothing loose
satisfies:
  - req-how-a-record-was-worked-survives-its-closing
  - req-a-shipped-record-is-never-reclaimed
  - req-close-refuses-loose-ends
  - req-close-leaves-trunk-clean
  - req-close-serves-its-findings
inputs:
  - flow-open-record
  - flow-worktree
outputs:
  - flow-findings-report
  - flow-closed-record
  - flow-trunk
controls:
  - the loose-end check, which refuses the close and names what stands
source_refs:
  - uc-close-a-record
---

## Rationale

SPLIT OUT ON THE OWNER'S RULING, 2026-08-07.

CLOSING IS A JUDGMENT ACT, not a cleanup. The record produced findings, and
each one gets a ruling before the record can end. That is why the close
SERVES the report rather than merely writing one: somebody has to read it.

The refusal is the function's whole character. A close that could proceed
past an unruled finding would turn the report into paperwork, and the
findings would quietly become history.

IT IS SEPARATE FROM LANDING because landing may happen many times while the
record stays open. Closing happens once, and only after there is nothing
left to rule on.
