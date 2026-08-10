---
kind: matrix-row
name: fold-back
statement: "Fold the spike evidence back: the design advances; the ripple reopens what the evidence invalidates."
state_kind: work
filled_by: agent
depends_on:
  - run-spikes
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
  - name: folded
    template: node-table
    of: experiment
    items:
      - $experiments
    columns:
      - folds_to
      - promote
    description: per experiment — what it changed upstream, and what promotes into the build or none; the answers live on the experiment nodes
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: evidence updates requirements and architecture through
  the reopen path, keepers marked for promotion into the build.
minor_note: |
  Applies when spikes ran: evidence folds into the delta's requirements,
  keepers marked for promotion. With no spikes the state passes empty.
patch_note: |
  Does not apply. No spikes ran, nothing folds back. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  Standing obligation: NO UNFOLDED EVIDENCE. Every spike's result either
  changed the design, updated a requirement, or was recorded as
  confirming - a spike whose evidence sits unread in its record is this
  cell failing.
specification_note: |
  DOCUMENT FORM: spike evidence as EVIDENCE DOCUMENTS, linked from what
  they changed - the requirement, the ADR, the RAID entry. The fold-back
  itself is visible as those edits' history, not as a chapter.
---

## Guidance

THE ANSWERS LIVE ON THE EXPERIMENT NODES (owner ruling 2026-08-10). The
form is a VIEW — one row per experiment, editing the node's own two keys,
exactly like the assumption probes:

- `folds_to` — what the evidence changes upstream. A requirement, a
  register entry, a structure edit — or nothing moved, said plainly.
- `promote` — what enters the build through the gate, or none.

A still-commented key counts as unanswered, and the submit refuses it by
name — so no experiment can slip through unfolded.

PROMOTIONS ARE A FILTER, NEVER A LIST: the experiments whose `promote` is
not none. A typed copy would drift from the nodes.

Evidence updates requirements and architecture; the suspect mechanics
reopen exactly what it invalidates - through the gates' reopen path,
never silently. The fold-back is the twin-peaks descent
([[meth-twin-peaks]]): each peak informs the other. Promotion mechanics
are [[meth-expedition-promotion]].
