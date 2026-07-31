---
kind: matrix-row
name: gate-architecture
statement: "GATE architecture: the matrix review - the owner adjudicates the decomposition itself."
state_kind: gate
filled_by: agent
depends_on:
  - record-adrs
  - evaluate-baseline
evidence:
  - name: choice_traced
    description: "the winner traced to the weighted criteria; both Pugh runs recorded where status-quo was used"
  - name: sensitivity_ruled
    description: "the verdict with tripwires in RAID"
  - name: matrix_review
    description: "the baseline matrices reviewed: decomposition, clustering, allocation, interfaces"
    killer: true
  - name: evaluation_recorded
    description: "every quality scenario addressed or flagged"
  - name: adrs_traced
    description: "every deciding ADR addresses its requirement"
---

## Guidance

The killer here is the MATRIX review: the clustering, the allocation, the interfaces - reviewed as data, not as a picture. Diagrams are derived views; if standardized diagrams return, a visual review can be reinstated. M7 builds inside this baseline; a new element found mid-build returns HERE, never in silently. Review per [[meth-gate-review]].
