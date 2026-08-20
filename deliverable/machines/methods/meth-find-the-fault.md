---
kind: method
statement: Find the fault by shrinking the world around it. The method narrows the search; guessing widens it.
---

## Situation

Guidance for M7 fix-findings. A finding says WHAT failed. This card is
how to find WHY, without whack-a-mole.

## The loop

Debugging is the scientific method run fast:

- State a hypothesis about the cause.
- Design the cheapest observation that could refute it.
- Observe. The result kills the hypothesis or keeps it.
- Repeat until the cause is cornered.

Keep the audit trail — which hypotheses died and how. Rerunning on a
guess without recording it is the anti-method: the same guess returns
an hour later looking fresh.

## Corner it

- MAKE IT FAIL FIRST. A fault that cannot be reproduced on demand is
  not understood. The reproduction is the instrument every later step
  uses.
- SIMPLIFY UNTIL ONLY THE ERROR REMAINS. Strip everything the failure
  does not need — input, config, steps, data. The end state is
  1-minimal: remove any one more thing and the failure vanishes. This
  is delta debugging's ddmin, and it works by hand too.
- BISECT. Halve the search space, whichever space holds the fault:
  - the history — git bisect over commits
  - the input — half the data, does it still fail
  - the pipeline — at which stage does the value first go wrong
- CHANGE ONE THING AT A TIME. Two changes per run means the result
  blames neither.
- QUIT THINKING AND LOOK. Read the actual failing value, the actual
  log, the actual state — before theorizing about them.
- CHECK THE PLUG. Environment, versions, fixtures, the test itself.
  The instrument is a suspect like everything else.
- GET A FRESH VIEW when stuck. Explaining the fault to someone — or
  filing the note that explains it — regularly finds it.

## Real systems

- Reproduce in SIMULATION first where the system is physical or
  expensive. Fix it in the simulation, then confirm on the real thing.
  The W-model verifies intermediate products the same way — by
  simulation and prototyping before integration.
- Section the system at its interfaces. Observe at the contract
  between two parts: the side that shows the wrong value first holds
  the fault, and the other side is excluded whole.

## The fix half

- IF YOU DID NOT FIX IT, IT IS NOT FIXED. The reproduction must turn
  green BECAUSE of the fix, and the understanding names why. A red
  that faded on its own returns on its own.
- A FIXED BUG LEAVES ITS REPRODUCTION. The regression set grows only
  from real failures ([[meth-test-design]]).
- Findings are fixed in ONE COLLECTED PASS, then one confirm run —
  the fix-findings row's own law ([[meth-test-first]]).

## Sources

- Zeller's delta debugging and ddmin — [[ref-delta-debugging]]
  (searched 2026-08-11).
- Agans' nine rules — [[ref-agans-debugging]]. Used here:
  - make it fail
  - quit thinking and look
  - divide and conquer
  - change one thing at a time
  - keep an audit trail
  - check the plug
  - get a fresh view
  - if you didn't fix it, it ain't fixed
- Bisecting history — [[ref-git-bisect]].
- SyA: root-cause analysis in Situation Analysis
  (@ai/sya_kb/digest/sya/05_Analysis.md); the W-model's
  verify-by-simulation (@ai/sya_kb/digest/sya/03_Revisited.md).
