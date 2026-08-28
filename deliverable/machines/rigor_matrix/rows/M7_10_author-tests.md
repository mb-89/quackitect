---
kind: matrix-row
name: author-tests
statement: Author an executable check for every requirement in scope; examples turn assertive.
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-implementation
entry_read:
  - deliverable/machines/methods/meth-test-design.md
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
  - se_file_delete
evidence:
  - name: checks
    template: node-table
    of: test-spec
    items:
      - $test-specs
    columns:
      - method
      - verifies
    page_size: 25
    description: the test-spec register — one row per spec; the files live on the spec node, and the law checks coverage both ways and the method match
major: full
major_complexity: C3/R3
minor: full
minor_complexity: C3/R3
patch: tailored
patch_complexity: C3/R3
product: full
product_complexity: C3/R3
specification: full
major_note: |
  Applies in full: every requirement in scope gets its check; the M5
  fitness candidates automate where measurable.
minor_note: |
  DELIVERY NEVER SHRINKS. Every new requirement's verify_method becomes a
  concrete check, mechanical where possible. The delta's checkable
  examples wrap into assertions.
patch_note: |
  DELIVERY NEVER SHRINKS. Tailored to the fix: one check that reproduces
  the wrong behavior. Test-first holds at every size - the reproduction IS
  the requirement's voice for a patch. A behavior fix with no reproducing
  check is the lazy work the process exists to stop.
product_note: |
  STANDING ARTIFACT: the check suite - every requirement's verify_method
  realized, mechanical where possible, review-class residue named. At
  rest the suite IS the register's mirror: a requirement without its
  check, or a check without its requirement, is an orphan.
specification_note: |
  DOCUMENT FORM: test nodes verifying their requirements (verifies
  edges); the verification chapter derives the requirement-to-check
  table. The checks themselves live in the code; the spec carries the
  mapping, never copies of the code.
---

## Guidance

THE SPEC IS THE ARTIFACT. This state authors
TEST-SPEC nodes ([[test-spec]]): one per verification collection, minted
from the item template's skeleton into spec/trace/test-spec/.
The spec carries the trace edge — `verifies:` names the requirement ids —
and the graph draws requirement ← test-spec in the test slice.

TEST-FIRST IS THE POINT. A requirement with no test yet gets its spec
NOW, defining how it will be verified, before the build. The build
realizes the spec; the spec never waits for the build.

THE LAW, all mechanical at this state's submit:

- every requirement is verified by at least one spec
- a spec's `method` equals the `verify_method` of every requirement it
  names — a requirement needing two methods gets two specs
- every `verifies` entry resolves to a requirement
- a test-method spec names files that exist under the deliverable

THE FILES ARE REALIZATION, NOT TRACE. For software, every case in a
referenced file is ONE STEP of its spec, and the case name states the
step's claim — nothing is copied into the note. The reverse sweep — a
test FILE no spec references — ships WARN-FIRST, later.

THE TEMPLATE VARIES BY METHOD, four shapes in one card ([[test-spec]]):
Steps for test, Procedure for demonstration, Checklist for inspection,
Model for analysis. The conformance check demands the matching section.

HOW TO WRITE A GOOD TEST — the house rules live in
guidance/craft/software.md, under writing tests. What this state adds:

- THE NAME STATES THE CLAIM, like a register title: readable as the
  requirement's voice, and arguable.
- ONE QUESTION PER TEST. A test asserting five things answers none when
  it goes red.
- MAP HONESTLY. An existing battery file may already carry a
  requirement — READ IT before a spec claims it. A mapping nobody
  checked is fabricated coverage.
- NON-TEST METHODS get specs too: the Procedure, Checklist or Model
  section IS the definition, and the files list may honestly say none.
- The M5 fitness candidates automate where measurable
  ([[meth-examples-checkable]]).

Per [[meth-test-first]] and [[meth-test-design]]; testability is
designed in upstream ([[meth-design-for-testability]]).
