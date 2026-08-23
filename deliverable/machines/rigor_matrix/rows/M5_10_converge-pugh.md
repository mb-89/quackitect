---
kind: matrix-row
name: converge-pugh
statement: "Converge on the winner: Pugh controlled convergence over the front."
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-architecture
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
  - name: matrix_runs
    template: decision-matrix
    reads: evaluate-set#scores
    description: the convergence runs, computed — datum the strongest rival, then the leader takes the seat
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: controlled convergence over the front, datum the
  strongest rival, the why beyond the arithmetic recorded.
minor_note: |
  Does not apply. No convergence without candidates. STRIKE PROPOSAL -
  owner adjudicates.
patch_note: |
  Does not apply. No convergence without candidates. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the recorded convergence runs and the winner's why
  beyond the arithmetic. Lives with the deciding ADRs.
specification_note: |
  DOCUMENT FORM: the convergence record - runs, datum choices, winner and
  its why - as the decision section the ADRs cite. Lives with the
  decisions chapter.
---

## Guidance

Per [[meth-pugh-convergence]] and steps 5-8 of [[meth-eight-step-decision]]. Datum = strongest viable rival; iterate with the winner as new datum — all computed, drawn by the decision-matrix card.

THERE IS NO WINNER FIELD (owner ruling 2026-08-10). The veto is withholding
the submit: a person who disagrees with the computed winner does not sign.
Anything beyond the arithmetic goes to follow_up here and into the deciding
ADRs at record-adrs, where the why lives on.
