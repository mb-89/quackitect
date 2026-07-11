---
id: adr-dmvbh5y
decided_in: i0016_structural_models
type: adr
kind: project
adjudicated_by: user
ready_when: the corporate wave iteration (Teams/Outlook) picks the Slack adapter up with it
statement: Slack leaves i0015 - the first wave ships ntfy only; the Slack adapter defers to the corporate wave.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner decision 2026-07-09, answering ask i15-ask-003 (option 3) after the phone demo round: drop Slack from i15. The M4 architecture decisions stand unchanged for when it returns - adr-slack-text-poll remains the chosen shape, its tripwire armed; the seam's exec lane and the polling pattern were sized for the corporate adapters anyway. Trigger to revisit: the ready_when condition. The build plan loses step b7; the need-engage criterion narrows to ntfy this iteration.
