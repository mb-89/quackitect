---
kind: matrix-row
name: draw-context
statement: "Draw the context: boundary, neighbours, intended use - and the binding excluded-from-intended-use list."
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-inputs
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: boundary
    description: what is inside and what is outside, in prose — the neighbours themselves are the list below
  - name: neighbours
    template: refs
    of: neighbour
    description: every neighbour that touches the box — one node each, whichever way the arrow points
  - name: intended_use
    description: one honest paragraph
  - name: excluded_use
    description: the does-NOT-do list
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: boundary, neighbours, intended and excluded use,
  redrawn for the change. Architecture moves ripple to the boundary more
  often than predicted - this is the cheap place to catch it.
minor_note: |
  Does not apply (owner ruling 2026-08-13). Boundary and neighbours do not
  move at this size, so the state could only ever answer "unchanged" - and
  a step whose only honest answer is nothing is a step that teaches skimming.

  ESCALATE: a new neighbour, or an interface that changes shape, IS the
  boundary moving. Promote the iteration to major.
patch_note: |
  Does not apply. Boundary and neighbours do not move for a behavior fix.
  STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: a patch that touches an interface to a neighbour is a minor at
  least - the boundary is the tell.
product_note: |
  STANDING ARTIFACT: the context - boundary, neighbours, intended use,
  and the BINDING excluded-use list. The context figure in the book
  derives from it. At rest every real neighbour appears; an integration
  the code has that the context lacks is a standing defect.
specification_note: |
  DOCUMENT FORM: the context FIGURE - derived inline SVG with real text
  (v1's context-model kind), built from boundary and neighbour nodes.
  The intended-use paragraph as marked prose; the excluded-use list
  verbatim. One line under the figure saying what to see.
---

## Guidance

Per [[meth-context-boundary]]. The excluded list is the scope-creep guard - system-level and binding, sharper than M1's vision-level non-goals.

THE DIAGRAM IS A BLACK BOX AND ITS NEIGHBOURS. The system sits in the middle as one box; every neighbour stands around it with its connection. Nothing else belongs in a context view.

SO THE NEIGHBOURS ARE NODES, shaped by [[neighbour]]. Each one carries:

- a statement
- a direction
- the interface that actually crosses the boundary

This field carries REFERENCES, never prose.

The figure DERIVES from the nodes. The interface list is never hand-authored
twice.

Later artifacts reference the same nodes, and the structure models among them.

The boundary field says what is inside and what is outside. It never repeats the neighbour list.
