---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-resume-after-an-absence
type: "[[use-case]]"
statement: Find out where the work stands after being away, without asking anybody.
actor: stk-engineer-driving-agents
trigger: someone returns to a product after an absence, or a fresh agent starts on it
precondition: none
guarantee: the position, the open work and everything pending are readable from the surface
refines:
  - sty-come-back-after-a-week
priority: should
---

## Main scenario

1. The person opens the product's folder.
2. The engine starts and the panel draws the machine where it was left.
3. The lit node and the crumbs above it say which record and which step.
4. The step's evidence form says what was produced; the next one's emptiness says what is owed.
5. The decision graph shows the last checklist and anything deferred.
6. The inbox count says what is pending and how old.

## Extensions

- 2a. The machine was left mid-record. The position is in the record, not in a session, so nothing had to survive the shutdown.
- 3a. A fresh agent boots instead of a person. It is handed everything it owes and stops, holding nothing from before.
- 4a. A form was filled but its state's conditions no longer hold. The surface shows it unmet, and says which condition fell.
- 6a. Something was written for the next session specifically. It is in the handover, which the boot reads.
