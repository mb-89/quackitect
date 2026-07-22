---
id: se.adr-dmvbh5y
kind: decision
statement: Slack leaves i0015. The first wave ships ntfy only. The Slack adapter defers to the corporate wave.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0016_structural_models
v1_type: adr
v1_kind: project
v1_adjudicated_by: user
v1_ready_when: the corporate wave iteration (Teams/Outlook) picks the Slack adapter up with it
v1_class: review
v1_killer: "false"
p3_note: ntfy only
---

## Rationale (not load-bearing)
Owner decision 2026-07-09, answering ask i15-ask-003 (option 3) after the phone demo round: drop Slack from i15. The M4 architecture decisions stand unchanged for when it returns - adr-slack-text-poll remains the chosen shape, its tripwire armed; the seam's exec lane and the polling pattern were sized for the corporate adapters anyway. Trigger to revisit: the ready_when condition. The build plan loses step b7; the need-engage criterion narrows to ntfy this iteration.
