---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-the-desk-takes-a-sentence-in-five-seconds
type: "[[test-spec]]"
statement: The desk takes a sentence within five seconds of the window opening, and whatever is not ready by then says it is starting.
method: test
verifies:
  - req-the-desk-is-usable-soon-after-the-folder-opens
files:
  - tests/boot-bench.test.ts
---

## Scope

TWO HALVES AND THE SECOND IS THE ONE THAT MATTERS MOST. The clock, which is five
seconds from the window opening to the desk taking a sentence. And the honesty,
which is that anything still starting says so rather than appearing absent.

OUT OF SCOPE: the whole boot. The agent reading what it owes may take longer,
and the requirement says so. What is bounded is the desk taking a sentence.

ALSO OUT: which activation mechanism brings the extension up. The requirement
names none, and a test that pinned one would freeze a design choice.

## Approach

LEVEL: system. A clock claim measured below the system measures something else.

METHOD: a boundary on one number, plus a state observation. The boundary is
five seconds and the classes are under and over. There is no partition worth
drawing beyond that, because the requirement states one measure.

THE BAR IS CHOSEN, NOT OBSERVED, and the requirement says so plainly. So the
case asserts against the chosen bar and records the measured number, which is
what lets the bar move when somebody is actually watched.

DEPTH: graded abrasive, so one measurement rather than a distribution. What
earns it a case at all is that the entry-point row has no clock, and a product
coming up in four minutes satisfies that row exactly.

## Steps

WHAT THE NAMED FILE CARRIES TODAY: nothing. It is a bench harness of thirty-nine
lines with no cases, which makes it the honest home for a timing claim rather
than a file whose cases would have to be worked around.

WHAT IS OWED.

- THE DESK TAKES A SENTENCE INSIDE THE BOUND. Measure from the window opening
  to the desk accepting input, and assert it is under five seconds.
- THE NUMBER IS RECORDED, NOT ONLY COMPARED. Write the measurement where the
  timings log reads it, so the bar can be re-argued from data rather than from
  the paragraph that chose it.
- ANYTHING NOT READY SAYS SO. Hold one dependency past the bound deliberately
  and assert the surface says it is starting. This is the half nothing in the
  design answers today, and it is the half the requirement calls most
  important.
- AN EMPTY SURFACE FAILS. The negative of the case above, and it is separate
  because a surface that says nothing and a surface that says it is starting
  both render as not-ready to a naive assertion.

WHAT THE CASE MUST STUB AND NAME. The machine is ordinary and not under load,
per the requirement's environment, so the run declares what it fixed rather
than hoping the machine was quiet. A timing case that does not name its
conditions measures the machine.

## What this spec cannot settle here

TWO HOST BEHAVIOURS SIT ABOVE THIS BOUND AND ARE NOT OURS. A seven-second
timeout can kill a content-test activation, leaving only a log line, and adding
the first folder to a workspace restarts every extension. Both were read from
the host's source at i9's prototype spike. Neither is a breach of this
requirement and both change what a person actually waits, so they belong beside
this spec rather than inside it.
