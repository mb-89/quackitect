---
kind: matrix-row
name: declare-winner
statement: "Declare the winner: the selection stands on the record, where everything downstream can point."
state_kind: work
filled_by: agent
depends_on:
  - reverse-sensitivity
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: winner
    template: decision-matrix
    reads: evaluate-set#scores
    description: the computed winner, drawn — the same reading converge-pugh shows, the seat held
  - name: comments
    description: anything the declaration should carry — free text, short is fine
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: the computed winner declared on the record with the
  comments beside it. From here on, "the winner" names one candidate.
minor_note: |
  Does not apply. No candidate set at this size. STRIKE PROPOSAL - owner
  adjudicates.
patch_note: |
  Does not apply. Nothing was selected. STRIKE PROPOSAL - owner
  adjudicates.
product_note: |
  STANDING ARTIFACT: the declaration - which candidate the architecture
  IS, with the comments that rode the selection.
specification_note: |
  DOCUMENT FORM: one line in the decisions chapter naming the winner, the
  comments as its remark.
---

## Guidance

The selection is the decision model's own closing step - "select one" - and
it is RECORDED here rather than implied by arithmetic two states back
(owner ruling 2026-08-10).

The card draws the computed winner: the same decision-matrix reading
converge-pugh shows, with the seat held. Nothing here recomputes or
overrides it.

The comments field carries what the arithmetic cannot - whatever the
declaration should say beyond the name.

A work state, not a gate: the human's bless lives at the gates around it.
From this state on, every later state says "the winner" and means one thing.
