---
form: fix-findings
judgment: passed at 2026-08-24T17:05:55.326Z
by: agent
signed_off: 2026-08-24T17:02:37.665Z
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

A tester with fresh eyes raised seven findings at verification. All seven were addressed in one pass before anything was re-run.

The suite went from 431 of 435 to 435 of 435. Two failures had been standing for weeks and neither was caused by this round.

## follow_up

### The two standing failures had one cause, and it was not code

`scratchpad/pkg/` held a complete second copy of the project. The vault reader walks the repository root, and its exclusion list did not name `scratchpad`. Every rigor row was counted twice, which is exactly the 126 against 63.

The same file already carried a comment about this happening once before with `dist`. The suite's own file walker skipped `scratchpad` correctly, so two walkers disagreed about what the repository contains.

Adding one name to the list cleared both table failures AND the crash in the file walker, which neither the tester nor I had tied to it.

### What each other finding got

- The hop-timing case now asserts each duration is finite and not negative, and that the hops sum inside the call.
- The failed-route case now compares. It previously asserted only that two counts were numbers.
- The stop hook now reads a target set by aiming, through EITHER door — the agent's `se_aim` and the person's own route on the mirror.
- The log tail is read once rather than twice, now that two readers walk it.
- The running-work lifecycle write moved inside a `try`.

### Three specs were amended, and each says why

THE SPEC IS THE PASS LINE, so a spec the test disagrees with is the thing that moves, not the disagreement that gets tolerated.

Two asked for medians over ten runs. Both compare millisecond-scale operations, which differ more between runs than the defect would move them. Both now carry a countable oracle with the measurement recorded as the reason.

One asked for a duration above zero. A warm expand costs a tenth of a millisecond and a memoized one rounds to zero, so the strict form would fail on the machine doing the least work.

### What is NOT fixed, and is now an open issue

Step 5 of the failed-route spec runs both cases under load. It is unimplemented, and it is the half that matters: the measured symptom appeared 36 per cent of the time under load against 2 per cent otherwise.

It is marked NOT BUILT YET in the spec and carries [raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented](spec/trace/raid/raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented.md).

IT NEEDS THE SAME AFFORDANCE THE SURFACE ROW NEEDS: a way to make an engine call run long on purpose. Two rows waiting on one unbuilt thing is a reason to name it as a single piece of work, and a note now does.

## anything_else

THE FINDING THAT MATTERED MOST CAME FROM THE FRESH EYES, and it was not in anything I built.

I had reported both standing failures as predating the round and not caused by it. That was true, and it was also where I stopped. The tester asked why they failed at all, found a stray copy of the project, and traced it to one missing name in one exclusion list.

THE COST OF NOT ASKING was that two failures stood for weeks while every walk reported them as known and unrelated. Known is not the same as understood.

### The second pass caught a half-fix

The same tester was shown the deltas and re-verified. It closed F1, F2, F3, F4 and F7, and it refused to close F5.

MY FIX TAUGHT THE HOOK THE AGENT'S AIMING DOOR AND NOT THE PERSON'S. `se_aim` is the agent's. The mirror's target route is the person's, and the contract says the person is the hand that aims. It writes no `se_aim` record, so a target set on the surface was still invisible.

THAT MADE THE BLINDNESS ASYMMETRIC RATHER THAN REMOVING IT, which is harder to reason about than the uniform blindness it replaced. The tester's words, and it is the right objection.

Both doors are recognised now, and clearing a target counts as an act rather than being skipped.

The tester also caught that the hop-sum assertion holds by construction. It is kept with a comment saying so, rather than counted as a guard it is not.
