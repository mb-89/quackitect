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
    description: "robust, or weight-sensitive with the flip conditions"
  - name: tripwires
    description: "the credible flips as RAID watch-items, or none"
---

## Guidance

Per [[meth-pugh-convergence]]: perturb weights (engine-computed where available), hunt the losing world, judge its credibility out loud. A credible flip becomes a RAID tripwire with its fallback ([[meth-raid]]) - never a silent dismissal.
