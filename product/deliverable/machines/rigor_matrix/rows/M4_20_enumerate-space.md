---
kind: matrix-row
name: enumerate-space
statement: "Enumerate the design space: the morphological chart over the partitioned functions; the shortlist seeds the parallel candidates."
state_kind: work
filled_by: agent
depends_on:
  - partition-functions
seeds: candidates
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: chart
    description: "the morphological chart: rows, options, pruned cells with reasons"
  - name: shortlist
    description: "the seeded combinations, one line each"
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: the morphological chart over the re-partitioned
  functions, options from catalogs, patterns and reference architectures.
  SEEDS the candidate machine - one parallel compose state per
  shortlisted combination, exactly as the row draws it. The unchanged
  part of the baseline enters every candidate as a fixed block.
minor_note: |
  Does not apply. No design space opens while the architecture holds; no
  candidate machine is seeded. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. No design space opens for a behavior fix; no candidate
  machine is seeded. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the morphological chart with its pruned cells and
  reasons, and the candidate one-pagers. The design space CONSIDERED is
  part of the product's record - the rejected roads explain the taken
  one.
specification_note: |
  DOCUMENT FORM: the morphological chart as a table (rows, options,
  pruned cells greyed with reasons); each shortlisted candidate as a
  one-pager with its matrices. The design-output chapter links the
  candidates; only the chart inlines.
---

## Guidance

Per [[meth-morphological-analysis]], options fed by [[meth-frame-tactics]] R (catalogs, patterns, reference architectures, TRIZ, benchmarking - the state-of-the-art scan for architectures lives here). This state SEEDS the iteration's candidate machine: one parallel compose state per shortlisted combination. Each candidate elaborates its static partitioning, allocation DMM, element DSM, interfaces (= inter-cluster edges), structure metrics, rough feasibility ([[meth-feasibility-checks]]) and rationale.
