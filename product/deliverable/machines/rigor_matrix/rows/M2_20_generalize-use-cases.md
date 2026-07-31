---
kind: matrix-row
name: generalize-use-cases
statement: Generalize the stories into Cockburn-shape use cases.
state_kind: work
filled_by: agent
depends_on:
  - write-stories
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
  - name: use_cases
    description: "the generalized set, every story covered"
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies for the change's stories: scenario paths, extensions, no UI
  mechanics. Use cases the architectural move invalidates are revised in
  the same pass.
minor_note: |
  Applies for the new stories: each maps into a scenario path - into an
  EXISTING use case's extension where it fits, a new use case where it
  does not. No UI mechanics, as ever.
patch_note: |
  Does not apply. No new stories, no new use cases. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the use-case set, Cockburn shape, every story
  covered. The requirements derive from these steps at rest - a use case
  no requirement traces to, or the reverse, is the orphan check's
  business.
specification_note: |
  DOCUMENT FORM: Cockburn use-case sections - numbered main path,
  extensions per step, no UI mechanics. Use cases are nodes; the design-
  input chapter transcludes them and the trace tables derive coverage.
---

## Guidance

Per [[meth-cockburn-use-case]]. Every story maps into a scenario path; extensions from numbered steps; no UI mechanics. M3 derives the requirements from these steps and extensions.
