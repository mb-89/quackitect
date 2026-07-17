---
id: raid-triage-overreach
type: raid
statement: The ADR triage could retire a decision that still carries load.
kind: risk
probability: 0.2
impact: 0.7
mitigation: Retire candidates ship as a bucket the owner rules. Nothing retires on agent judgment alone.
owner: the driving agent
status: open
decided_via: A
provenance:
  mitigation: user-ruling via handoff
---
## Options
A) Retire candidates are a bucket the owner rules; realized and pending sort on evidence.

B) The agent retires directly under the grant; the collection review catches mistakes.

C) No retirements this iteration; sort only.
