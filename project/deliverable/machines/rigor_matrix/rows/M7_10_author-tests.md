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
    description: "every in-scope requirement with its authored check"
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

Per [[meth-test-first]]: every requirement's declared verify_method becomes a concrete check; push toward mechanical; the residue stays review-class. The checkable examples get wrapped - the example teaches, the check defines pass/fail ([[meth-examples-checkable]]). The M5 fitness candidates become automated where measurable. Design the checks per [[meth-test-design]]; testability itself is designed in upstream ([[meth-design-for-testability]]).
