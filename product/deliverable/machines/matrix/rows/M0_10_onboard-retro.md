---
kind: matrix-row
name: onboard-retro
statement: "Onboarding opens with the retro: the field-feedback question first, then the notes inbox drains."
state_kind: work
filled_by: agent
depends_on: []
evidence:
  - name: field_feedback
    description: "what came back from the field, or an explicit \"nothing yet\""
  - name: notes_drained
    description: "inbox count before and after, with each note's disposition"
  - name: call_log_mined
    description: "counts and rejection clauses since the last retro, with the leads drawn"
  - name: waste_leads
    description: "rework or waste found in the record"
    required: false
  - name: process_stale
    description: "the standing state-of-the-art check on the process itself"
---

## Guidance

The retro method is the truth here - product/guidance/method/retro.md; do not restate it. This row adds only the seam: onboarding OPENS with the retro, the field-feedback question first, and the kickoff gate refuses while the inbox pends.
