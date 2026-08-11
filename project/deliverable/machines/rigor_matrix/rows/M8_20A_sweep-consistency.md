---
kind: matrix-row
name: sweep-consistency
statement: "Sweep the describing surfaces: everything this iteration changed is re-documented where it is taught."
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
floor: true
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_lint
evidence:
  - name: swept
    template: checklist
    items:
      - $sweep_surfaces
    description: "the surface classes walked - the meth-consistency-sweep card holds the classes, and checking a box claims its documents teach the current behavior"
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  FLOOR - never struck. An architecture move touches many teaching
  surfaces; the sweep is correspondingly wide.
minor_note: |
  FLOOR - never struck. Everything the iteration changed is re-documented
  where it is taught, in full.
patch_note: |
  FLOOR - never struck. A fix that changes behavior a document teaches
  leaves that document lying until the sweep runs. The sweep is scoped to
  what the patch touched, and it always runs.
product_note: |
  FLOOR, standing: every describing surface teaches the current behavior.
  The product-level check is the book's drift law - same state, same
  bytes, and what it teaches is what ships.
specification_note: |
  DOCUMENT FORM: the swept-surfaces list in the record. The sweep's real
  output IS the corrected documents themselves.
---

## Guidance

Per [[meth-consistency-sweep]]. A doc that still teaches the superseded way is a defect here, not a later surprise.

LIST WHAT THE ITERATION CHANGED first - the evidence trail has it. Then walk the surface classes on the card, and for each class find every document teaching a changed behavior and fix it. Checking the box is the claim, per class.
