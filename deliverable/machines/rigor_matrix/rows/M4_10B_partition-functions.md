---
kind: matrix-row
name: partition-functions
statement: "Partition the functions: the shared function DSM before any enumeration."
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-candidates
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
  - name: clusters
    template: dsm
    of: function
    items:
      - $functions
    writes: cluster
    picks:
      cluster: $clusters
    options:
      - shared-data
      - sequence
      - timing
      - shared-failure-mode
      - same-actor
      - same-policy
      - same-external-interface
      - same-lifecycle
    page_size: 10
    description: the matrix with a box round every cluster, and the clusters named beside it
    guidance: |
      The engine groups and orders the rows so the blocks show. Move a
      function with the picker beside its row, then name each cluster.

      The method is [[meth-function-dsm]].
major: full
major_complexity: C3/R3
minor: none
patch: none
product: full
product_complexity: C3/R3
specification: full
major_note: |
  Applies in full for the change's cone: the DSM re-clusters where the
  move lands, and untouched clusters inherit. Every function placed, every
  cluster named and its coupling classed - the shared partitioning every
  candidate builds on.
minor_note: |
  Does not apply - AND THIS IS MINOR'S TRIPWIRE. The prediction behind
  the minor column is that new functions land in EXISTING clusters. The
  moment the DSM wants re-clustering, the prediction failed: STOP,
  escalate to major, walk M4 in full there. Never silently. STRIKE
  PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. The function DSM stands untouched. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the clustered function DSM - relation meaning,
  coupling reasons, quality classes. It is the shared ground every future
  candidate stands on, so it stays current with the function structure.
specification_note: |
  DOCUMENT FORM: the function DSM as a DERIVED FIGURE from the function
  nodes' edges - clusters visible, coupling reasons on hover or in the
  legend. One what-to-see line. Never a hand-drawn matrix.
---

## Guidance

TWO ACTS, AND THE ENGINE DOES EVERYTHING BETWEEN THEM.

- PLACE each function in a cluster. The engine proposes; you confirm or move.
- NAME each cluster and class its coupling. The engine cannot do this part.

THERE IS NO MATCHING STEP HERE ANY MORE. A [[flow]] is a node, picked at derive-functions, so two functions naming one flow are connected by construction. The matrix is built before you arrive.

THE MATRIX IS DERIVED AND NEVER DRAWN. It projects over the function notes' flow edges, clusters by [[meth-dsm-clustering]], and there is no second copy to drift.

THE RELATION MEANING IS FIXED, so nothing asks for it. [[meth-function-dsm]] offers five because Lindemann's method is general. Here every edge comes from a flow, so the meaning is `passes_data_to` and there is nothing to choose.

A CLUSTER IS A GROUP OF FUNCTIONS, NEVER AN ELEMENT. That is the commonest way this step goes wrong. The two look alike on a page, and the cut into elements is per candidate, later.

This partitioning is SHARED across all candidates.
