---
kind: matrix-row
name: author-tests
statement: Author an executable check for every requirement in scope; examples turn assertive.
state_kind: work
filled_by: agent
depends_on:
  - gate-prototype
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
  - name: checks
    template: node-table
    of: requirement
    items:
      - $requirements
    columns:
      - verified_by
    description: "every requirement's test addresses, written on the node — <test file> :: <test case name> for test rows; the artifact or named residue for the other methods"
major: full
minor: full
patch: tailored
product: full
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

THE TEST DEFINITION IS THE TEST ITSELF (owner ruling 2026-08-10). No
test notes and no specs typed in this form: every requirement carries
`verified_by` in its own frontmatter, and this form is the VIEW that
edits it — the probe-assumptions shape.

THE MAPPING IS MANY-TO-MANY, both directions owed:

- every requirement is verified by AT LEAST ONE check — the engine
  refuses a test-method row without one at this state's submit.
- every test maps back to a requirement — the reverse sweep parses the
  test files and names the orphans. It ships WARN-FIRST (the guard law):
  the standing battery predates this rule, so the orphan count informs
  before it ever refuses.

THE ADDRESS GRAMMAR, for software: `<test file> :: <test case name>`,
split on the FIRST ` :: `. A TypeScript test case is a registered NAME,
not an exported function — the (file, name) pair is its durable address,
and the battery records every pair it ran with its verdict, so the
address is checkable. WRITE EVERY ENTRY DOUBLE-QUOTED: test names carry
colons, and an unquoted colon-space breaks the node's frontmatter.

SOFTWARE-SPECIFIC BY DESIGN (owner ruling 2026-08-10): a non-software
realization keeps the field and reshapes only the address grammar — a
measurement protocol, an inspection record. That reshape waits for the
first non-software product.

HOW TO WRITE A GOOD TEST — the house rules live in
guidance/craft/software.md, under writing tests. What this state adds:

- THE NAME STATES THE CLAIM, like a register title: readable as the
  requirement's voice, and arguable.
- ONE QUESTION PER TEST. A test asserting five things answers none when
  it goes red.
- MAP HONESTLY. An existing battery test may already carry a
  requirement — READ IT before naming it. A mapping nobody checked is
  fabricated coverage.
- NON-TEST METHODS: analysis, inspection and demonstration rows name
  their evidence artifact, or the review-class residue plainly.
- The M5 fitness candidates automate where measurable
  ([[meth-examples-checkable]]).

Per [[meth-test-first]] and [[meth-test-design]]; testability is
designed in upstream ([[meth-design-for-testability]]).
