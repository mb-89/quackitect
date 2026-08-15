---
minted_in: i1
id: opt-triage-queue-in-front
type: "[[option]]"
statement: hold arriving strays in a queue that sits in front of the backlog, so nothing becomes work without a person deciding it is work
cluster: cluster-the-holding-pen
found_by: prior-art
source: "Linear Triage: A Practical Guide to the Incoming Issue Queue, https://www.issuelinker.com/blog/linear-triage"
---

## Mechanism

Triage is a separate inbox in FRONT of the team's backlog. Anything arriving
from outside collects there rather than dropping into the plan, and waits
for a person to answer one question: does this belong in our work at all.

The stated value is that the backlog stays trustworthy, because everything
in it was put there deliberately.

The same source names a second mechanism worth its own cell: one markdown
file per REJECTED concept, written as a short design document rather than a
database row, recording what was rejected, why, and every request that has
since asked for it.

WHAT IT WOULD COST HERE. The inbox already sits in front, and the drain
already forces one home per note. What this adds is the rejected-concept
file — this system records a rejection as a drain disposition in a log, so a
durably rejected idea has no document a later asker can be pointed at.
