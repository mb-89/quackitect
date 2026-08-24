---
id: i4-milestone-walk
statement: What each milestone of the panel round produced, what it cost in calls, and which costs a machine could remove.
---

# The panel round, milestone by milestone

TLDR. The round cost about 2,450 calls across its own states. Two milestones
took 57 percent of that between them, and in each case a SINGLE step is the
reason. Repairing findings cost 387 calls. Logging risks cost 271.

HOW COST IS MEASURED HERE. Every logged call carries the state it was made
from, so these are counted rather than estimated. Calls made outside any state
are excluded, and there were 898 of them.

WHY MILESTONE ROWS AND NOT STEP ROWS. Sixty-odd step rows is a wall, and the
question being asked is where the time went between one milestone and the next.
The step that dominates each milestone is named in its own row.

## The table

| milestone | calls | what it produced | what it cost | mechanizable |
| --- | --- | --- | --- | --- |
| M0 kickoff | 107 | the round opened and its rigor was pinned | the kickoff gate alone took 58 | the gate's own form is prefillable from the seed |
| M1 motivation | 648 | vision, actual, delta, scope, risks | LOGGING RISKS TOOK 271, four times any sibling | see below — this is the round's second finding |
| M2 inputs | 244 | context, stakeholders, stories, use cases | the inputs gate took 180 against 49 for all its feeders | a gate costing more than the work it judges is the tell |
| M3 requirements | 159 | requirements, functions, assumptions probed | evenly spread, nothing dominant | nothing found |
| M4 candidates | 213 | the space enumerated, scored and cut | spread across nine sub-steps | nothing found |
| M5 architecture | 164 | winner declared, structure decomposed | the architecture gate took 58 | same shape as M2's gate |
| M6 prototype | 68 | unknowns ranked, three spikes run, folded back | the cheapest milestone in the round | nothing found |
| M7 implementation | 752 | tests, build, trace, verification, repair | REPAIRING FINDINGS TOOK 387, more than the build itself | see below — this is the round's first finding |
| M8 validation | 65 | demos run, consistency swept | cheap and clean | nothing found |
| M9 release | 29 | packaged and shipped | cheapest of all | nothing found |

## The two findings worth acting on

### Repairing findings cost more than building

387 CALLS AT ONE STEP, against 213 for the whole build it was repairing. The
repair cost nearly twice what it was repairing.

WHAT IS ALREADY KNOWN ABOUT IT. That step is where the suite was driven from 34
failures to zero, and where a job that had finished kept reading as still
running, holding the walk for nineteen minutes with no process alive.

SO PART OF THAT 387 IS NOT REPAIR AT ALL. It is a walk waiting on a record that
would never settle. The watchdog over launched work is already scoped into the
next round, and it targets exactly this.

WHAT IS NOT KNOWN. How the 387 divides between real repair and waiting. The
call log carries durations, so this is answerable and has not been asked.

### Logging risks cost four times its neighbours

271 CALLS AT ONE STEP. Its siblings in the same milestone run 19 to 123.

THIS ROUND'S SLOWEST PULLS SIT INSIDE IT. Two of the six pulls that ran past two
minutes were made from this step, and both answered that nothing routed onward.

SO THE COUNT MAY NOT BE ABOUT RISKS AT ALL. A step that cannot leave gets pulled
again, and each pull is a call. That is the same suspect the next round is
already told to test first.

## The shape both gates share

TWO GATES COST MORE THAN THE WORK THEY JUDGE. The inputs gate took 180 calls
where everything it judges took 49. The architecture gate took 58.

A GATE IS A JUDGMENT ON WORK THAT IS ALREADY DONE. When it costs several times
that work, what is being paid for is not judgment.

NOT INVESTIGATED HERE, and it is the obvious next question: whether those calls
are the gate deciding, or the gate being reopened and re-signed. The log can
answer it by counting reopens against submits.

## What was deliberately not proposed

THREE ROWS FOUND NOTHING, and that is a real answer rather than a gap. M3, M4,
M8 and M9 were evenly spread with no dominant step, and inventing an improvement
for them would be noise.

AND NOTHING HERE REPEATS WHAT IS ALREADY SCHEDULED. The watchdog, the route
drawer, the per-hop budget and the prose pruning all stand in the next round
already, so they are cited above rather than proposed again.
