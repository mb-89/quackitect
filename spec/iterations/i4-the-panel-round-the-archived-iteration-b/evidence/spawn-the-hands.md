---
form: spawn-the-hands
by: agent
signed_off: 2026-08-23T14:22:43.463Z
judgment: passed at 2026-08-23T14:38:33.282Z
authors: agent
files: null
---

# Evidence form / spawn-the-hands

## current_situation

This state did not exist an hour ago. It was specified in i38's design input as the milestone's setup state and never built, and it is built now.

It is being walked for the first time, by the record that added it.

## hands

- [x] Walker (deliverable/machines/methods/meth-spawn-hands.md)

## follow_up

TWO DEFECTS FOUND WHILE WALKING THIS STATE FOR THE FIRST TIME, both in the engine and neither blocking.

se_run {agent, steps} CANNOT BE SATISFIED from this harness. stepsAsked demands a number and the value arrives as a string, so the declaration half of this state refuses. The check only guards the agent path, which is why the same argument works for a shell run. It is a one-line fix and it is not made yet, so the walker above is spawned and undeclared.

A STEP ADDED BEHIND THE WALK STRANDS ITSELF. This row was added at the head of M0 while i4 stood at M2. Nothing routed back to it and it blocked every state behind it. A reload re-derived the position and reached it, which is the recovery, but the machine offered no path and said only that the feeder was unsigned.

## anything_else

