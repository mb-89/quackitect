---
kind: matrix-row
name: trace-design
statement: "Trace the design: every element realized, every spec's files existing, every code file claimed — the dead-code sweep."
state_kind: work
filled_by: agent
depends_on:
  - build-steps
legal_tools:
  - se_file_read
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: design_trace
    template: node-table
    of: design-spec
    items:
      - $design-specs
    columns:
      - realizes
      - files
    covers: element
    page_size: 25
    description: "the spec register against the elements — coverage is checked, never claimed. The laws add file existence and the unclaimed sweep."
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  Applies in full: the built code and the design specs agree, both ways,
  mechanically.
minor_note: |
  Applies in full. The delta's code lands in claimed files or claims new
  ones; the sweep is cheap and runs whole.
patch_note: |
  Applies in full: the fix landed inside claimed files, or the claim
  grew. The sweep does not shrink because the change was small.
product_note: |
  Standing obligation: the code base carries no unclaimed file - every
  file serves a design spec, every spec serves an element, and dead code
  cannot hide as an unclaimed remainder.
specification_note: |
  DOCUMENT FORM: the sweep counts in the iteration record. The book's
  detailed-design chapter derives the spec-to-code table live; a pasted
  copy would drift.
---

## Guidance

COVERAGE IS CHECKED, NOT CLAIMED — the field declares `covers:
element`, the same mechanism the upper trace states use, so the
register refuses while any element goes unrealized.

THE MECHANICAL HALF OF THE DESIGN TRACE, after the build. Three checks,
all law at submit:

- every element and interface is realized by at least one design spec
- every design spec's `files:` exist on disk
- every deliverable code file is claimed by at least one spec — the
  unclaimed list is the dead-code view

A LINK IS A CONTRIBUTION (trace-schema). An unclaimed file is a FINDING:
discuss it and usually cut it. Claiming it under the nearest spec to
silence the sweep is fabricated coverage, the exact thing the sweep
exists to catch.

The grain is the FILE for now. Dead code inside a claimed file is
invisible at this grain — noted, accepted, revisited when the coarse
sweep stops finding things.
