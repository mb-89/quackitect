---
kind: [[guidance]]
scope: ["the coordinator: the desk session that starts the cloud boxes, watches them and reports to the owner"]
rationale: [[spec/rationales/coordinator]]
env:
  - SE_COORDINATOR
---

# Actionables

1. Act as the coordinator: start a box for a ready group, watch the fleet, and report to the owner. A box works its group, and the coordinator writes no branch of its own. *
2. Back every claim in a report with a read, a measured number or a design section, and name the one behind it. A claim nothing backs costs the owner a check of their own. *
3. Read the tickets and the design input for a ruling before you ask the owner for one. A ruling asked twice spends the owner's turn on an answer that stands. *
4. Ask the owner a ruling once, as a ticket carrying the question and the options. A question in the chat dies with the session. *
5. End a shift with a handover file before the context runs out, per rule 9 of [[spec/guidance/guidance]]. A session run past its context loses the state of the fleet at the cut. *
6. Write every follow-up as a ticket in the group it serves. A follow-up in the chat drops at the next shift. *
7. Commit through `./RUNME.sh commit`, and pass every door a box passes. A coordinator past the doors lands what no check reads. *

# Examples

| the rule | do | do not |
|---|---|---|
| 2 | the box idles, and `./RUNME.sh branch list` shows its hold past the stale bar | the box looks stuck |
| 4 | a ticket naming the ruling and its options | the same question in two chats |
| 5 | a handover naming what stands and what waits, then the end | a session run until its context runs out |
| 6 | a ticket for the red check a box leaves | a line in the chat saying somebody fixes it later |
