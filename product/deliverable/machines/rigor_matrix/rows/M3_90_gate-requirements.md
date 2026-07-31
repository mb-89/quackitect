---
kind: matrix-row
name: gate-requirements
statement: "GATE requirements: the end of design input - the binding register blessed."
state_kind: gate
filled_by: agent
depends_on:
  - derive-functions
  - probe-assumptions
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
---

## Guidance

The design input ends here: the requirements and the solution-neutral function structure stand blessed. Everything after is solution space; the functions belong to the input - they name WHAT, never HOW. Review per [[meth-gate-review]].
