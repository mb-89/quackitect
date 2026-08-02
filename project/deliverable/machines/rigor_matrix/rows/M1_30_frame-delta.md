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
    description: "what each alternative sheds, positioned against the scanned field"
  - name: why_now
    description: "what matured to make the gap closable"
  - name: value_props
    description: "the one-pagers, each with its needs and their pass lines"
  - name: business_case
    description: "what the effort buys, in whose currency - skip with a recorded reason where no acquirer exists"
    required: false
major: full
minor: tailored
patch: tailored
product: full
specification: full
major_note: |
  Applies in full for the change: the gap claim for what the major
  answers, the why-now, the value props it extends or creates, needs with
  pass lines. The resident frame inherits where the change does not touch
  it. This is where a major proves it deserves its cost.
minor_note: |
  THE CENTER OF GRAVITY BEGINS HERE. The delta's new needs are written in
  full: which value prop they extend (or the one new prop they create),
  their need|outcome lines, and their PASS LINES - a criterion nothing
  will check is not a criterion, at any size. The resident gap claim and
  why-now are inherited by pointer.
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
  prose; each VALUE PROP as its own DIN-A4 one-pager section (audience,
  need, outcome, alternative, difference, validation_signal), needs as
  need|outcome lines with pass lines attached. Needs are nodes; the
  trace tables derive from them.
---

## Guidance

The gap as a CLAIM: what every existing alternative sheds - only honest after the scan ([[meth-state-of-the-art]]). Then why the gap is closable now. The value props are created here: DIN-A4 one-pagers per audience (audience, need, outcome, alternative, difference, validation_signal); needs live as need|outcome lines inside them, and the SUCCESS CRITERIA live as pass lines on those needs - a criterion nothing will ever check is not a criterion. The day-to-day trace anchors at these props.

INHERIT where the frame is unchanged: reuse the resident value-props and gap, and carry only the delta's new needs and their pass lines.
