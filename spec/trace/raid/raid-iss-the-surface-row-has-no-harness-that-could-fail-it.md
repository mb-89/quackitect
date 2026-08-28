---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-the-surface-row-has-no-harness-that-could-fail-it
type: "[[raid]]"
kind: issue
statement: A requirement demanding that a surface answers no worse while the engine is busy has no check that could ever fail it, because nothing can hold an engine call while timing surface requests beside it.
owner: the driving agent
trigger: it has happened, and it was found at the state that observes reds
status: open
impact: The row reads as verified because a spec names it, and no case exists that could go red. That is worse than an unverified row, because the trace looks complete.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-a-slow-answer-does-not-freeze-the-surface-beside-it
  - tsp-the-surface-answers-no-worse-while-the-engine-is-busy
---

## What is missing

A LOAD HARNESS. Something that starts one engine call which will run well past
its bound, holds it there, and lets surface requests be timed alongside it.

WITHOUT IT the spec's steps cannot be executed. Steps two and three of it both
begin by assuming such a hold exists.

## Why this is an issue rather than a risk

IT HAS ALREADY HAPPENED. The requirement stands, a spec names it, and the state
that exists to observe reds found no red to observe. That is present tense.

## Why it is worse than an unverified row

A ROW WITH NO SPEC IS VISIBLY UNCOVERED. The coverage check says so and somebody
fixes it.

A ROW WITH A SPEC AND NO RUNNABLE CASE PASSES EVERY CHECK THE MACHINE MAKES. The
spec resolves, the requirement is named, the trace closes. Nothing anywhere says
the case cannot fail.

## The blocker this entry named does not exist

IT SAID THE ENGINE HAS NO WAY TO MAKE A CALL RUN LONG ON PURPOSE. Checked
2026-08-24, and that is false. `deliverable/tests/handback.test.ts` line 105
builds a state whose exit condition is a script, as a plain object, and drives
the script machinery with it. Point that script at one that sleeps and the call
runs long.

SO THE HARNESS IS BUILDABLE TODAY, and this entry sat open behind a blocker that
was not there. That is worse than the gap it described.

## The owner restated the demand, and the restatement is simpler

OWNER, 2026-08-24: anything that takes longer than a second gives feedback.

THAT IS CHECKABLE WITHOUT MEASURING A SURFACE. Start something long and assert
the call came back with a handle instead of blocking. The engine already answers
that way in one place: a test run hands back `handed_off: true` with a job
handle, and the work account rides every later call.

WHAT THE ROW REALLY DEMANDS is that everything long behaves like that.

## What would close it

A CASE THAT STARTS SOMETHING LONG AND ASSERTS THE CALL RETURNED. No surface
timing needed, and no affordance beyond what the suite already does.

AN ALTERNATIVE IS TO CHANGE THE METHOD. Observing a surface under load is
arguably a demonstration rather than a test, and a demonstration needs a person
rather than a harness. That would be honest, and it would move the row out of
the mechanical checks entirely.

WHICH OF THE TWO IS RIGHT IS NOT DECIDED HERE. Both are recorded so the choice is
made deliberately rather than by whichever is easier at the time.

## What must not happen

THE ROW MUST NOT BE QUIETLY CLAIMED. If the build ends with this entry still
open, the verification state has to say the row is unverified rather than let a
resolving spec stand in for a passing case.
