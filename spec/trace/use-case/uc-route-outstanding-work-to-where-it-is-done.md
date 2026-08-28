---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: uc-route-outstanding-work-to-where-it-is-done
type: "[[use-case]]"
kind: interaction
statement: Route outstanding work to the place that will do it.
actor: stk-engineer-driving-agents
trigger: the person decides what should happen to work that has no home, or sees work that belongs somewhere it is not
precondition: the work exists as its own item
guarantee: every item the person routed sits where it will be done, and the place it landed on owes it
refines:
  - sty-browse-the-backlog-and-decide-what-happens-next
  - sty-steer-a-running-iteration-by-moving-work
priority: must
---

## Main scenario

1. The person opens the outstanding work as a list, one row per item, with the fields each item carries as columns.
2. The person narrows the list by any field it carries.
3. The person groups the items they intend to act on together.
4. The person chooses a destination: a new record, or a state inside a record that is already running.
5. The system shows which places will accept the work while the person is placing it, including places that were hidden because they held nothing.
6. The person places the work.
7. The system makes the destination owe it, so that destination cannot be left until the work is settled or moved on again.
8. The system leaves the grouping behind once it is empty, because it existed only to carry.

## Extensions

1a. THE WORK DOES NOT EXIST YET. The person adds a row and writes it, and from that moment it is an item like any other.

2a. NOTHING MATCHES. The person widens the narrowing rather than being told there is no work.

4a. THE DESTINATION IS A NEW RECORD. The grouped items become that record's scope, arriving at its opening checkpoint without being retyped.

4b. THE DESTINATION IS A BUILD STEP FOR REPAYING DEBT. Small items are routed there as the build steps are made, so they are done while hands are already in that part of the system.

4c. THE DESTINATION IS EARLIER IN A RUNNING RECORD. The work is placed on the state that owns what must change, and it stands there as an open point rather than reopening anything.

7a. AN OPEN POINT IS STILL STANDING AT A CHECKPOINT. The checkpoint decides whether to accept the move and carry on, or refuse and send the earlier state back. It does not pass silently either way.

7b. THE PERSON ROUTED THE WORK OUT OF SCOPE. It returns to having no home rather than being marked finished, because moving is a change of place and finishing is a change of status.
