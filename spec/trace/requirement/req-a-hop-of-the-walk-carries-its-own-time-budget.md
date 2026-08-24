---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: req-a-hop-of-the-walk-carries-its-own-time-budget
type: "[[requirement]]"
statement: When the engine walks one hop of a record, the MECHANICAL transition from one step to the next shall complete within the published per-hop budget, and the hop shall record how long it took so the budget can be checked rather than assumed.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: every hop's duration is recorded on the answer that carries the hop, and the mechanical transition stays within the published budget; the work a state does inside the hop is not bounded by this row
breaks_if_removed: Every existing speed demand bounds a single answer, so a walk of many hops can crawl with all of them satisfied and nothing in the product can say it is happening.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - "owner ruling 2026-08-24: a hop can take, let us say, fifty milliseconds per step, and that goes into the performance requirement"
  - vp-rigor-without-toil
  - req-call-answers-in-one-second
weighs_with:
  - req-call-answers-in-one-second ! — that bounds ONE answer at the lane's boundary, this bounds ONE HOP inside a walk; a call may hold many hops, so satisfying that one says nothing about this one
---

## Scenario

- Source: the engine walking a record.
- Stimulus: a request for the next step, from any distance.
- Artifact: the walk.
- Environment: a committed record built to hold still, so a slowdown can be told from the record growing.
- Response: the hop completes and its duration is recorded.
- Response measure: the duration is recorded and readable on the answer. The mechanical transition stays inside the budget; the state's own work does not have to.

## The budget binds the FLIP, not the work (owner ruling 2026-08-24)

THE OWNER'S WORDS: "if something takes more than three point five seconds, like
if it's boot, then that's okay if we signal to the user that we're doing
something. When I say a hop cannot take more than 250 milliseconds, what I mean
is the mechanical part of flipping from one step to the next. If there is some
work in between, that's fine."

SO THERE ARE TWO COSTS IN A HOP and only one of them is bounded here.

| part | what it is | bounded by this row |
| --- | --- | --- |
| the flip | the transition itself, and the status the engine assembles for it | yes |
| the work | the state's own reading, condition scripts and entry duties | no |

WHAT THE WORK OWES INSTEAD is a signal. Anything that runs long says it is
running, which is [[req-a-slow-answer-does-not-freeze-the-surface-beside-it]]
and not this row.

MEASURED 2026-08-24, and it is the reason this row could be stated at all. The
status the engine assembles for a hop costs 11 to 12 milliseconds warm, against
a budget of 250. Cold, once per process, it costs 4,201. Bumping the drawing
epoch — which every hop does — costs nothing measurable, so the cache survives
it and the flip does not pay the cold price again.

AN EARLIER READING OF THE SAME MEASUREMENT WAS WRONG and is recorded here so it
is not repeated. Three boot hops each cost about 3.5 seconds, and the uniformity
looked like a fixed toll every hop pays. The epoch test refuted it: the flip is
milliseconds, and those hops were slow because of what those states DO.

## Detail

THE BUDGET IS PROPOSED AND NOT YET RATIFIED, and this row says so rather than
claiming a standing figure. The number under discussion is a twentieth of a
second. What is ratified is the owner's, and this row takes whatever they set.

THE MEASUREMENT IS HALF THE DEMAND. A budget nothing records is a wish, so
recording the duration is written into the statement rather than left to an
implementation to remember.

AND THE MEASURE IS SPLIT ALONG THAT SEAM, deliberately. The recording half is
checkable today with nothing new built. The threshold half needs two things that
do not exist: a ratified figure and the committed yardstick.

AN EARLIER DRAFT MEASURED ONLY THE THRESHOLD, which made the whole row
unverifiable and named a test nobody could write. A reviewer caught it. A row
whose verify method says test must have something testable in it on the day it
is written, or it is a promise wearing a requirement's clothes.

## Why the existing speed rows do not cover this

THEY ALL BOUND ONE ANSWER. One bounds a driver's call at the lane's dispatch.
One bounds a person's render at the surface's boundary. One bounds how many
calls a re-entry costs.

A CALL MAY HOLD MANY HOPS. So a call inside its bound tells you nothing about
whether a hop inside it was cheap, and a walk of thirty hops can be slow with
every existing row green.

MEASURED 2026-08-24: every speed criterion the product holds measures a surface
answering a person. Not one measured the walk itself.

## The yardstick is part of the demand

TIMING AGAINST A RECORD STILL BEING WORKED ON CANNOT TELL a slowdown from that
record simply growing. So the environment above names a committed record that
holds still, and without one this row is unverifiable rather than merely
unmeasured.

IT MUST APPEAR IN NO LISTING AND NO COUNT, or it becomes a record people trip
over while it is doing its job.
