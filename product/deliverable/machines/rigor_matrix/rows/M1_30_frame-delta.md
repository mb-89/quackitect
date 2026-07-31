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
---

## Guidance

The gap as a CLAIM: what every existing alternative sheds - only honest after the scan ([[meth-state-of-the-art]]). Then why the gap is closable now. The value props are created here: DIN-A4 one-pagers per audience (audience, need, outcome, alternative, difference, validation_signal); needs live as need|outcome lines inside them, and the SUCCESS CRITERIA live as pass lines on those needs - a criterion nothing will ever check is not a criterion. The day-to-day trace anchors at these props.

INHERIT where the frame is unchanged: reuse the resident value-props and gap, and carry only the delta's new needs and their pass lines.
