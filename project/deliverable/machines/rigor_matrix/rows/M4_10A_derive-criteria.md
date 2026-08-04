---
kind: matrix-row
name: derive-criteria
statement: "Weight the requirements: the vital-few high-weight ones ARE the decision criteria."
state_kind: work
filled_by: agent
depends_on:
  - gate-requirements
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
  - name: criteria
    description: "the vital-few high-weight requirements, each with weight and scoring definition"
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full - this is major's own territory. The vital few, weighted,
  each with definition and requirement lineage. Standing criteria are
  reused where they still measure what matters; the change usually adds
  one or two of its own.
minor_note: |
  Does not apply. Criteria weigh architecture candidates, and none are
  enumerated at this size. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. Decision criteria exist to weigh architectures; a patch
  weighs nothing. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the weighted decision criteria with their lineage.
  They outlive the decision that minted them - the next major reuses and
  re-weighs them instead of inventing a fresh set.
specification_note: |
  DOCUMENT FORM: criteria as a derived table - name, definition,
  requirement id, weight - in the design-output chapter, feeding the
  decision records that cite them.
---

## Guidance

Criteria are PROMOTED requirements, never their own items. Every requirement carries a weight, defaulting to unimportant; weighting is steps 1-3 of [[meth-eight-step-decision]] (direct or pairwise comparison, pruned to fewer than 11 vital few). A high weight DEMANDS a scoring definition on that requirement ([[meth-scoring-anchors]]) - that filled definition is what makes it a criterion. Stakeholder tensions reference the requirements they pull apart. A criterion without requirement lineage cannot exist by construction; anything worth scoring candidates by must first be written as a requirement.
