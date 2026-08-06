---
kind: matrix-row
name: gate-motivation
statement: "GATE motivation: the one interestingness discussion - past this gate the vision is axiomatic."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - scope-non-goals
  - log-risks
  - pressure-test
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: vision_scope_stated
    description: "the packet is complete: idea, to-be world, goals, pitch, scope, non-goals"
  - name: problem_agreed
    description: the delta is real and the goal is worth having - argue it here
  - name: prior_art_positioned
    description: the idea positioned against what exists and what failed
  - name: success_measurable
    description: every need carries its pass lines
  - name: risks_logged
    description: the register is open with owners and triggers
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full. A major re-argues its worth: the delta is real, the
  cost of moving architecture is justified, the risks are logged. The
  resident vision stays axiom unless the packet amended it - then the
  amendment is exactly what this gate adjudicates.
minor_note: |
  Tailored to the delta: is THIS extension worth having - argued in one
  short exchange, not the full interestingness discussion. The resident
  vision is axiom and stays out of scope. The killer survives scaled:
  the delta is real and worth building.
patch_note: |
  Does not apply. The vision axiom is not re-litigated for a behavior fix.
  The kickoff's one-line reason carries the whole motivation burden at
  this size. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The product-level bless of the frame: the one record that says the
  problem is real and worth this product. It stands until a major amends
  the packet - then this gate re-adjudicates the amendment.
specification_note: |
  DOCUMENT FORM: the gate record - the filled evidence form and the
  bless, hash-bound. Gate records render as the milestone acceptance
  table in the project chapter, derived, never hand-written.
---

## Guidance

THE one place where the frame's worth is argued - this gate may fail on a trivial motivation. Past it, the vision is accepted as axiom and never re-litigated downstream. Review per [[meth-gate-review]]: specifics below first, the standard rounds evaluate them.

## The value props are reviewed as ARTIFACTS

frame-delta hands this gate a list of REFERENCES. Follow every one to its
node in `project/spec/trace/value-prop/` and review the artifact itself, not
the list.

Per prop, in this order:

- The reference RESOLVES. An id pointing at no file fails the gate outright.
- The statement is in the audience's own words, and names a need rather than
  a feature.
- `audience` names a stakeholder that exists.
- `outcome` says what becomes true for that audience. It is what validation
  will measure, so a vague one is a defect now rather than at M8.
- Every success criterion carries a Metric and a Target. A criterion nothing
  will ever check is not a criterion.

Across the set:

- No two props claim the same id.
- No prop duplicates another in substance under a different name.
- A delta authoring ZERO props is legal, and says so in one line.
