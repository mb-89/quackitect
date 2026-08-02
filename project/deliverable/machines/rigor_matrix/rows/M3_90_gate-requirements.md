---
kind: matrix-row
name: gate-requirements
statement: "GATE requirements: the end of design input - the binding register blessed."
state_kind: gate
filled_by: agent
depends_on:
  - derive-functions
  - probe-assumptions
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: verifiable
    description: "every requirement carries its named verify_method"
  - name: traced
    description: "every requirement traces to a story or prop - the matrix shows no empty rows"
  - name: functions_cover
    description: "every requirement requires at least one function; every use-case step covered"
  - name: set_holds
    description: "complete, consistent, affordable, bounded; no TBD"
  - name: breaks_if_removed
    description: "filled on every requirement"
  - name: assumptions_probed
    description: "the register's environment assumptions probed or scheduled with reason"
major: full
minor: full
patch: none
product: full
specification: tailored
major_note: |
  Applies in full. End of design input; everything after is solution
  space. The set criteria are argued for the register as it now stands.
minor_note: |
  APPLIES IN FULL, scoped to the delta. The new rows are verifiable,
  traced, function-covered, probed; the SET criteria are re-argued for
  the register as extended - a delta can break the whole set's
  consistency, so the set-level check never shrinks. End of design input,
  at this size too.
patch_note: |
  Does not apply. A clarification edit does not reopen the register's
  bless; the repaired wording rides the patch record and the owner sees it
  at the leave. STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: if the clarification turns out to change meaning, the register
  DID move - that is a minor, and this gate returns with it.
product_note: |
  The product-level bless of the register: design input closed. Standing
  obligation: the register stays blessed as extended - every minor's
  delta re-earns the set criteria, and a suspect ripple reopens exactly
  what it invalidates.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table. The
  blessed register itself is the artifact; the gate leaves only its
  acceptance.
---

## Guidance

The design input ends here: the requirements and the solution-neutral function structure stand blessed. Everything after is solution space; the functions belong to the input - they name WHAT, never HOW. Review per [[meth-gate-review]].
