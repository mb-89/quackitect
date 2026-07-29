---
kind: matrix-row
name: gate-requirements
statement: "GATE requirements: the end of design input - the binding register blessed."
state_kind: gate
filled_by: agent
depends_on: [derive-functions, probe-assumptions]
---

## Guidance

Everything after this gate is solution space. Review per [[meth-gate-review]].

## Evidence form

- verifiable | every requirement carries its named verify_method | required
- traced | every requirement traces to a story or prop - the matrix shows no empty rows | required
- functions_cover | every requirement requires at least one function; every use-case step covered | required
- set_holds | complete, consistent, affordable, bounded; no TBD | required
- breaks_if_removed | filled on every requirement | required
- assumptions_probed | the register's environment assumptions probed or scheduled with reason | required
