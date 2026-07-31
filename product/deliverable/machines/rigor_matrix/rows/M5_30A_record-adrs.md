---
kind: matrix-row
name: record-adrs
statement: Record the deciding ADRs, each addressing the requirements it shapes.
state_kind: work
filled_by: agent
depends_on:
  - reverse-sensitivity
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
  - name: adrs
    description: "the decision records, each traced"
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full: every deciding ADR traced to the requirement or
  quality that forced it, rejected options as history. The why lives
  once, here.
minor_note: |
  Applies for NON-architecture decisions the delta forces: a library
  choice, a data-shape ruling, a protocol detail. Each addresses the
  requirement that forced it, rejected options recorded. Architecture
  ADRs cannot happen here - their existence escalates the column.
patch_note: |
  Does not apply. A patch decides nothing an ADR must carry; the fix's
  why lives in its commit and the leave form. STRIKE PROPOSAL - owner
  adjudicates.

  ESCALATE: needing an ADR is the proof the change was never a patch.
product_note: |
  STANDING ARTIFACT: the ADR set - the product's decision memory, each
  addressing what forced it, rejected options kept. The book's decisions
  chapter derives from it. The why lives once, here, forever.
specification_note: |
  DOCUMENT FORM: ADR nodes, one file each - statement, addresses edges,
  rejected options as history. The decisions chapter transcludes them;
  the decisions table derives. Harvest v1's ADR template and its field
  schema.
---

## Guidance

The why lives once, here. Every decision is its OWN FILE (kind: decision - id, one-line decision, status, the addresses edge to the requirement or risk that forced it; the body holds context, options and consequences). The RAID register view includes the decisions beside the risks and assumptions ([[meth-raid]]) - one surface to read, files apart underneath. The rejected options stay recorded as history.
