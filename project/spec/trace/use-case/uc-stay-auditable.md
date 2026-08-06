---
id: uc-stay-auditable
type: "[[use-case]]"
statement: Reconstruct what happened from the record
actor: stk-engineer-driving-agents
trigger: The person has to answer for work they did not watch.
precondition: Agent work has run and the record sits in the repository.
guarantee: Who did what, when and over which channel is answerable from the record alone.
refines:
  - sty-auditability
killer: false
---

## Main scenario

1. The person asks the record for a period's calls.
2. Every dispatched call answers with one line carrying its outcome.
3. The person asks which grants were recorded; each names its role and its channel.
4. The person follows a verdict back through the trace to the evidence that carried it.
5. The person states what happened, attributed, without asking any session.

## Extensions

- 2a. A dispatch left no line: the record has a hole; the audit reports the gap instead of presenting the record as whole.
- 3a. A record carries a personal identifier: the record breaks the privacy rule; the defect is counted, never shipped silently.
- 4a. A verdict points at evidence that is not there: the verdict reads unproven, never trusted on its word.
