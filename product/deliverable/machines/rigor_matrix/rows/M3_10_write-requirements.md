---
kind: matrix-row
name: write-requirements
statement: "Write the requirements in full: EARS, four kinds, detail included - verify_method named on every one."
state_kind: work
filled_by: agent
depends_on:
  - gate-inputs
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
  - name: register
    description: "the requirement set: EARS, kinds, verify_method and breaks_if_removed on every row"
  - name: set_criteria
    description: "complete, consistent, affordable, bounded - argued"
---

## Guidance

Derive from the use-case steps and extensions. EARS shapes ([[meth-ears]]); kinds functional / quality / constraint / interface - qualities carry six-part scenarios ([[meth-quality-scenarios]]), constraints link their binding norm. Naming the verify_method (test / analysis / inspection / demonstration) IS the verifiability check - unnameable means rewrite or drop. breaks_if_removed mandatory on every requirement. Every requirement carries a WEIGHT, defaulting to unimportant - the high weights become M4's criteria and only they owe a scoring definition. source_refs to stakeholders, stories, norms. Detail now - no TBD survives this milestone; requirements are design input, never build-time afterthoughts. Position the concrete set against the standard checklists for this deliverable kind ([[meth-state-of-the-art]]). Expect iteration with the functions ([[meth-twin-peaks]]).
