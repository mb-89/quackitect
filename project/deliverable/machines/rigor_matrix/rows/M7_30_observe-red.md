---
kind: matrix-row
name: observe-red
statement: "Observe RED: every new check runs and fails before the build."
state_kind: work
filled_by: agent
depends_on:
  - specify-build
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
evidence:
  - name: red_observed
    template: node-table
    of: test-spec
    items:
      - $test-specs
    columns:
      - method
      - red_observed
    page_size: 25
    description: "one row per spec. red_observed is written on the spec node once, at its birth — the guidance names the three legal answers."
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  Applies in full. Every new check fails before the build.
minor_note: |
  Applies in full. Every new check runs and fails before the build.
patch_note: |
  Applies in full. The reproducing check runs and FAILS before the fix
  lands. This is the cheapest state in the battery and the one that proves
  the fix fixes anything.
product_note: |
  Standing obligation: no check in the suite went green without ever
  having been seen red. The red observation is recorded per check, once,
  at its birth.
specification_note: |
  DOCUMENT FORM: the red-run reference in the iteration record, per
  check. Proof, not prose.
---

## Guidance

Last before the build, before any code lands ([[meth-test-first]]). A check green with no realized design is suspect.

THE OBSERVATION IS PER SPEC, ONCE, AT ITS BIRTH — written on the spec
node's `red_observed`. Three legal answers:

- a run reference — the new checks ran and failed, mechanically
- `claimed — <who observed what>` — for demonstration, inspection and
  analysis specs, where no run can prove it
- `impossible — <why>` — the manual override, for a spec covering
  already-implemented behavior that can never show red. Visible, never
  silent.

The law refuses a spec whose `red_observed` is empty. The mechanical
lane — the engine running the new checks itself — takes the first
answer over when the executor upgrade lands.
