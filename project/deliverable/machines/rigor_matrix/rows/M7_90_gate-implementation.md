---
kind: matrix-row
name: gate-implementation
statement: "GATE implementation: built inside the baseline, verified green across all iterations."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - verification
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_test
evidence:
  - name: build_planned
    description: the seeded chunk machine exists and was walked
  - name: models_adhered
    description: the build fills the allocated elements - no unsanctioned element
  - name: red_observed
    description: every new check failed before the build
  - name: designs_realized
    description: every requirement has a realized design
  - name: verification_green
    description: the battery passes, all iterations
  - name: quality_ok
    description: internal quality reviewed
  - name: risks_acceptable
    description: implementation risks judged and folded into the RAID register
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: built inside the NEW baseline, no unsanctioned
  element, red observed, designs realized, battery green, quality and
  risks judged.
minor_note: |
  Applies in full: build planned and walked, models adhered, red observed,
  designs realized for every new requirement, battery green, quality and
  risks judged. The delivery gate does not scale down.
patch_note: |
  Tailored to three checks: the battery is green, the reproduction failed
  first, and the fix stayed inside the allocated elements. The rest of the
  form assumes a planned build that did not happen here.

  ESCALATE: an unsanctioned element in the diff sends the work to major
  through the architecture gate - the same law as at every size.
product_note: |
  Standing obligation: the code and the baseline agree - the
  models-adhered check has held at every size, so no unsanctioned element
  exists. The product-level audit of this claim is the overhaul's job.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table, as at
  every gate.
---

## Guidance

Review per [[meth-gate-review]]. Models-adhered-to is a matrix check: the build filled the allocated elements and only those; a genuinely-needed new element goes back through the architecture gate.
