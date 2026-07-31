---
kind: matrix-row
name: partition-functions
statement: "Partition the functions: the shared function DSM before any enumeration."
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
  - name: partitioning
    description: "the clustered function DSM: relation meaning, coupling reasons, clusters"
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full for the change's cone: the DSM re-clusters where the
  move lands; untouched clusters inherit. One relation meaning, coupling
  reasons classified, qualities assigned - the shared partitioning every
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

Per [[meth-function-dsm]]: one relation meaning per matrix, coupling reasons classified, clusters formed, qualities assigned (basic / additional / safety / support). This partitioning is SHARED across all candidates - the static cut into elements varies per candidate later. The matrix is a projection over the function notes' edges.
