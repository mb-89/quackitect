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
---

## Guidance

Per [[meth-test-first]]: every requirement's declared verify_method becomes a concrete check; push toward mechanical; the residue stays review-class. The checkable examples get wrapped - the example teaches, the check defines pass/fail ([[meth-examples-checkable]]). The M5 fitness candidates become automated where measurable. Design the checks per [[meth-test-design]]; testability itself is designed in upstream ([[meth-design-for-testability]]).
