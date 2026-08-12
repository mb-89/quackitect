---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-quality-maintainability
type: "[[use-case]]"
statement: Answer what happened and change it safely
actor: stk-engineer-driving-agents
kind: quality-area
trigger: Somebody asks why a decision was taken, or something has to change under a standing claim.
precondition: The work has run and its record sits in the repository.
guarantee: The cause is answerable from the record alone, and what a change invalidates is named rather than discovered.
refines:
  - sty-what-a-quality-is
priority: must
---

## What this characteristic covers

MAINTAINABILITY, from ISO/IEC 25010:2023. The degree to which a system can be
modified to improve it, correct it, or adapt it to changes.

Its sub-characteristics, so nobody has to open the standard to use this:

- MODULARITY. A change to one component has minimal impact on the others.
- REUSABILITY. A part can be used in more than one system, or in building
  other assets.
- ANALYSABILITY. The impact of an intended change can be assessed, a
  deficiency or a cause of failure can be diagnosed, and the parts to modify
  can be identified.
- MODIFIABILITY. It can be changed without introducing defects or degrading
  what already worked.
- TESTABILITY. Criteria can be established for it and tests run to see whether
  they are met.

WHY AUDITABILITY LIVES HERE (owner ruling 2026-08-07). Answering "why did this
happen" a year later is diagnosing a course of events from the record, which
is ANALYSABILITY almost word for word. It was first placed under Security on
the strength of `accountability`, and that was the wrong fit: the audit trail
here exists to explain the system to its maintainer, not to defend it against
an attacker.

## Main scenario

1. The person asks the record for a period's calls.
2. Every dispatched call answers with one line carrying its outcome.
3. The person asks which grants were recorded; each names its role and its channel.
4. The person follows a verdict back through the trace to the evidence that carried it.
5. The person states what happened, attributed, without asking any session.
6. Something upstream changes; the machine names every claim that stops standing because of it.

## Extensions

- 2a. A dispatch left no line: the record has a hole; the audit reports the gap instead of presenting the record as whole.
- 3a. A record carries a personal identifier: the record breaks the privacy rule; the defect is counted, never shipped silently.
- 4a. A verdict points at evidence that is not there: the verdict reads unproven, never trusted on its word.
- 6a. A change lands that nothing declared as an input: the ripple cannot be computed, so the drift is reported rather than assumed absent.
