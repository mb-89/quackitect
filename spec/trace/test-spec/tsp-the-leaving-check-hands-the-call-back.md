---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: tsp-the-leaving-check-hands-the-call-back
type: "[[test-spec]]"
statement: An agent leaving a state whose leaving check runs a long program gets its call back at once, is told the check is still running rather than that it failed, and receives the verdict on a later call.
method: demonstration
demonstrates:
  - sty-the-step-that-hands-the-walk-back
verifies: none — demonstrates carries the edge; req-a-leaving-check-does-not-hold-the-call is verify method test and is carried by the test-method specs beside it
files:
  - none — the procedure below is the definition, because the pass is what the agent's only verb does while a program runs
---

## Scope

One agent, one state whose leaving check runs a program measured in minutes, and
the pulls either side of it.

## Why demonstration and not test

A TEST CAN PROVE THE CALL RETURNS INSIDE ITS BOUND. It starts a slow check and
asserts the answering call came back under a second. That case exists and it is
not this.

WHAT THIS PROCEDURE ASKS IS WHETHER THE AGENT'S ONLY VERB STAYS USABLE. That is
a claim about a whole walk rather than one call, and it is settled by walking a
real record whose check really takes minutes.

THE STORY NAMES BOTH HALVES: the call answers at once, AND the agent is never
told the work failed while it was still moving. The second half is about what
the answer SAYS, not about how fast it came.

## Procedure

- Stand in a state whose leaving check runs the whole battery.
- Pull, so the walk tries to leave and the check starts.
- Read what comes back, and time it.
- Keep working. Make other lane calls that have nothing to do with the check.
- Pull again, more than once, until the verdict arrives.

## Pass line

- THE FIRST PULL ANSWERS AT ONCE, well inside its bound, while the program runs.
- IT SAYS THE CHECK IS STILL RUNNING. It does not say the check failed, and it
  does not say the check has not started.
- IT CARRIES WHAT THE PREVIOUS RUN SAID, so a re-run never hides the last
  verdict.
- THE OTHER CALLS STILL WORK while the check runs. The only verb is not held.
- A LATER PULL CARRIES THE VERDICT, and the walk moves on a green one.

## Fail line

- The call is held until the program finishes, so the harness may give up first.
- The answer reports a failure that has not happened yet.
- A second attempt starts a second run instead of joining the one in flight.
- The check never settles at all, so the step reads as still deciding for the
  life of the engine.
