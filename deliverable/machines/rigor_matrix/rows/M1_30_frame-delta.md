---
kind: matrix-row
name: frame-delta
statement: "Frame the delta: the gap as a claim, the why-now, and the value-prop one-pagers with pass lines on the needs."
state_kind: work
filled_by: agent
depends_on:
  - define-actual
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
  - name: gap_claim
    description: what each alternative sheds, positioned against the scanned field
    omit:
      - minor
  - name: why_now
    description: what matured to make the gap closable
    omit:
      - minor
  - name: value_props
    template: refs
    of: value-prop
    description: the value props this delta authors
  - name: business_case
    description: what the effort buys, in whose currency - skip with a recorded reason where no acquirer exists
    required: false
major: full
minor: tailored
patch: tailored
product: full
specification: full
major_note: |
  Applies in full for the change: the gap claim for what the major
  answers and the why-now. Then the value props it EXTENDS - creating one needs
  the person's word - and the needs with
  pass lines. The resident frame inherits where the change does not touch
  it. This is where a major proves it deserves its cost.
minor_note: |
  THE CENTER OF GRAVITY BEGINS HERE, and only the new half is asked. The
  delta's new needs are written in full: which value prop they extend, their
  need|outcome lines, and their PASS LINES - a criterion nothing will check is
  not a criterion, at any size.

  A NEW PROP IS NOT YOURS TO MINT. Extend one that
  already stands. Where none fits, name the proposition you would mint and say
  why in one sentence, then carry on with the work - the person's word is what
  mints it. The value-prop item template carries the reasoning.

  THE GAP CLAIM AND THE WHY-NOW ARE NOT ASKED.
  They stand from the resident frame, and the form drops them mechanically
  at this size rather than asking anyone to be brief about them.
patch_note: |
  CLARIFICATION ONLY. The one design-input act a patch may perform: where
  the design output went wrong because the input was unclear, fix the
  unclear sentence IN PLACE - the gap claim, a pass line, a value-prop
  wording. No new needs, no new pass lines.

  ESCALATE: a new need or a changed meaning is a minor. The tell: you are
  adding a line rather than repairing one.
product_note: |
  STANDING ARTIFACT: the gap claim, the why-now, and the VALUE-PROP
  ONE-PAGERS with every need and its pass lines. The whole trace anchors
  here at rest - a need without a pass line, or a prop no story realizes,
  is a standing defect the orphan check should surface.
specification_note: |
  DOCUMENT FORM: the motivation chapter's gap and why-now as marked
  prose; each VALUE PROP transcluded from its own node, one DIN-A4
  one-pager each. The props are nodes; the trace tables derive from them.
---

## Guidance

The gap as a CLAIM: what every existing alternative sheds. That is only honest
after the scan ([[meth-state-of-the-art]]).

Then say why the gap is closable now.

THE VALUE PROPS ARE AUTHORED HERE, AS ARTIFACTS. Each one is a NODE under
`spec/trace/value-prop/`, shaped by [[value-prop]].

A value prop carries:

- a statement
- an audience
- an outcome
- a priority
- its success criteria

They are STANDING artifacts. They outlive this iteration, land on trunk when
the record closes, and a later record may change them.

SO THIS FIELD CARRIES REFERENCES, NEVER PROSE. One id per line.

The artifact is the truth, and the form points at it. gate-motivation follows
each reference and reviews the artifact itself, so a reference that resolves
to nothing fails the gate.

A delta may author ZERO new value props. An empty list is a claim too - one line saying none.

The day-to-day trace anchors at these props: the vision is their parent, and stories, use cases and requirements hang below them.

INHERIT where the frame is unchanged: reuse the resident value-props and gap, and carry only the delta's new needs and their pass lines.
