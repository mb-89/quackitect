---
kind: matrix-row
name: gate-release
statement: "GATE release: docs match the surface, the handover is accepted - the bless ships it."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - ship-review
floor: true
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_git
evidence:
  - name: docs_match
    description: docs complete and matching the actual surface
  - name: packaged
    description: versioned, configuration baselined, entry script in place
  - name: dependencies_ruled
    description: the ship review done, sticky rulings honored
  - name: handover_accepted
    description: the bless is the acceptance
  - name: market_block
    description: (market) real-world validation green - blocks the ship only for to-market iterations
    required: false
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  FLOOR - applies in full: docs match, packaged, dependencies ruled,
  handover accepted. The bless ships it.
minor_note: |
  FLOOR - applies in full: docs match the surface, packaged and
  baselined, dependencies ruled, handover accepted. The bless ships it.
patch_note: |
  FLOOR - never struck. Tailored to its two make-or-break checks: the touched surfaces
  match the fixed behavior (docs_match, scoped to the patch), and the
  handover is accepted - the owner's bless on the record ships it. The
  full form's packaging and dependency lines fall away with their rows.
product_note: |
  FLOOR, standing: every shipped version passed this gate - docs
  matching and packaged, then ruled and accepted. The release history IS the list of
  these blesses.
specification_note: |
  DOCUMENT FORM: the ship record - the release bless, hash-bound,
  closing the version. The release history derives from these records.
---

## Guidance

Review per [[meth-gate-review]]. The retro waits beyond the terminal - its field-feedback question opens the next start. Market iterations: no ship without the real-world checks green.
