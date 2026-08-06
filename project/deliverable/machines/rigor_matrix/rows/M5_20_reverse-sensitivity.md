---
kind: matrix-row
name: reverse-sensitivity
statement: "Reverse the sensitivity: find the first plausible world where the winner loses."
state_kind: work
filled_by: agent
depends_on:
  - converge-pugh
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
  - name: sensitivity
    description: robust, or weight-sensitive with the flip conditions
  - name: tripwires
    description: the credible flips as RAID watch-items, or none
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: perturb the weights, hunt the losing world, credible
  flips become RAID tripwires with fallbacks. The one state that keeps a
  major honest about its own decision.
minor_note: |
  Does not apply. No new architecture decision to stress. STRIKE
  PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. No decision was taken, so none can flip. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the sensitivity verdict and its tripwires, living in
  RAID. At rest the tripwires are WATCHED: a flip condition that has come
  true and gone unnoticed is this cell failing.
specification_note: |
  DOCUMENT FORM: a sensitivity annex on the deciding ADR - verdict, flip
  conditions, tripwires with their RAID links.
---

## Guidance

Per [[meth-pugh-convergence]]: perturb weights (engine-computed where available), hunt the losing world, judge its credibility out loud. A credible flip becomes a RAID tripwire with its fallback ([[meth-raid]]) - never a silent dismissal.
