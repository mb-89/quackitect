---
id: q-io-lane-scope
type: question
state: decided
decided_via: B (owner ruling 2026-07-14, recorded as adr-io-lane-default)
statement: How far does engine-mediated file-IO go for agent edits?
class: review
killer: false
provenance:
  state: user-ruling via handoff ntfy
  decided_via: user-ruling via handoff ntfy
---
## Options
A) Every write. All agent edits run through the engine. Editor tooling retires. Full audit, most friction.

B) Default with recorded exceptions. quack apply is the agent's default lane. Editor tooling stays for single interactive edits. Scripted bulk edits are the recorded exception.

C) Bulk plus audit only. The engine mediates bulk edits only. Single edits stay free. Least friction, weakest audit.

## Rationale (not load-bearing)
The generalization's real decision. Universal mediation makes corruption structurally impossible
but puts the engine in every edit's path (latency, harness friction, subagent briefs). The
default-with-exceptions middle keeps editor tooling for single edits. Undecidable at compose
time; M3 elaborates the candidates, the owner decides, and the ruling lands as an ADR addressing
req-apply-general.
