---
kind: matrix-row
name: evaluate-architecture
statement: "Evaluate the architecture: the ATAM-lite walk of the quality scenarios, with the structure metrics computed beside it."
state_kind: work
filled_by: agent
depends_on:
  - decompose-structure
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
  - name: walk
    description: each quality scenario with its verdict and carrying decision
  - name: metrics
    description: the structure numbers, computed — element coupling off the DSM, allocation balance off the function nodes — with one line saying what each number moved
  - name: fitness_candidates
    description: the measurable scenarios that could automate at M7
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full: every quality scenario walked through the structure,
  verdicts recorded, the DSM metrics computed, fitness candidates named
  for M7.
minor_note: |
  Walk ONLY the quality scenarios the delta touches through the standing
  structure. Record each one as addressed, at risk or unaddressed. The
  full walk is not repeated.
patch_note: |
  Does not apply. The quality-scenario walk holds as evaluated. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the quality-scenario walk - every scenario with its
  verdict and carrying decision. The at-risk list is a standing input to
  rank-unknowns, and the fitness candidates to author-tests.
specification_note: |
  DOCUMENT FORM: the quality-scenario walk as a derived table - scenario,
  verdict, carrying decision - in the architecture chapter, after the
  figures it judges.
---

## Guidance

Per [[meth-atam-lite]]:

- Walk each quality scenario through the structure — which elements carry
  the stimulus, where the response forms, what limits the measure.
- Record it as addressed, at risk, or unaddressed.
- Name candidate fitness functions.

THE METRICS BELONG HERE, not at the decomposition (owner ruling
2026-08-10, and the corpus files DSM analysis under quantitative REVIEW):
element coupling and cycle counts off the element DSM, allocation balance
off the function nodes. A number nobody interprets is noise — each one
carries a line saying what it moved.

Evaluation, never verification. Findings that shake the choice reopen
converge-pugh; findings that shake requirements ripple to M3.
