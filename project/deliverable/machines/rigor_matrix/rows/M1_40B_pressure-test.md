---
kind: matrix-row
name: pressure-test
statement: Pressure-test the drafted packet with a working-backwards PR-FAQ.
state_kind: work
filled_by: agent
depends_on:
  - frame-delta
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
  - name: prfaq
    description: "the press release and the hostile FAQ"
  - name: findings_folded
    description: "what the test changed upstream, or none-with-reason"
major: tailored
minor: none
patch: none
product: full
specification: tailored
major_note: |
  The PR-FAQ walks for the CHANGE: press release for the to-be world with
  the change in it, hostile FAQ against the architectural move
  specifically. Cheap insurance before the most expensive walk the
  process has.
minor_note: |
  Does not apply. The PR-FAQ pressure-tests a frame, and the frame is
  inherited. STRIKE PROPOSAL - owner adjudicates; the honest counter-case
  is a minor whose delta changes the story the FAQ tells, and that case
  reads as escalation material anyway.
patch_note: |
  Does not apply. The PR-FAQ tests a frame; a patch does not reframe.
  STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the PR-FAQ, kept as evidence with the vision packet.
  At product scale it is re-walked when the frame changes, and its
  unanswerable questions are standing RAID entries, not forgotten notes.
specification_note: |
  DOCUMENT FORM: an EVIDENCE DOCUMENT, linked from the motivation
  chapter, never inlined - the press release and hostile FAQ in full.
  The chapter carries one line: what the test changed.
---

## Guidance

After drafting, never before ([[meth-pr-faq]]). Every question the FAQ cannot answer cleanly folds back into the vision or the risk log before the gate.
