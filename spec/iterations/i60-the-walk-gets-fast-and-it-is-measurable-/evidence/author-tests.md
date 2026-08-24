---
form: author-tests
by: agent
signed_off: 2026-08-24T17:39:33.015Z
reopened: "2026-08-24T17:34:56.059Z — The owner ruled reopen. Three specs were amended after their tests and two moved away from requirements that were left standing, so the spec layer and the requirement layer disagree. The failed-route requirement also carries a contradiction the owner has struck: its measure demands that reporting no route costs no more than reporting one, which no graph search can satisfy, and the test under it asserts the opposite ordering. The owner's ruling is to rework or remove it, and to leave no requirement standing with a contradiction in it."
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

The specs stand as authored. What moved is the layer ABOVE them: three requirements were amended so that each says what the spec under it actually checks.

### What the reopen was for

A cold reviewer found the spec layer and the requirement layer disagreeing. Three specs had been amended off timing comparisons and onto countable oracles, and the requirements they verify were left carrying the old language.

ONE OF THEM WAS NOT MERELY ADRIFT, IT WAS IMPOSSIBLE. The failed-route requirement demanded that reporting no route cost no more than reporting one. To say there is no way, a search must look everywhere it can reach; to say here is the way, it stops at the first. Finding nothing therefore always costs more.

AND THE TEST UNDER IT ASSERTED THE OPPOSITE ORDERING, and passed. On its own fixture the old measure was false in the very data the green test rested on.

### The owner's rulings, applied

ON THE FAILED-ROUTE ROW: "if we find a reason why there is no way to get there, we just return early", and leave no requirement standing with a contradiction in it. The row now demands the early return, and measures the bound that catches a hang — each reachable state expanded at most once, never twice.

ON THE BUDGET: "when I say a hop cannot take more than 250 milliseconds, what I mean is the mechanical part of flipping from one step to the next. If there is some work in between, that's fine." The hop-budget row now binds the flip and explicitly does not bind the state's own work.

### What the specs needed

The failed-route spec's statement and its step 4, because the step said the converse of what the row now asks. Its id keeps the old name, and the file says why: other nodes cite it, and renaming decays every citation.

Nothing else moved. The other specs already checked what their requirements now say.

## checks

- tsp-pointing-the-walk-costs-the-same-whatever-the-distance
- tsp-a-failed-route-answers-no-slower-than-a-drawn-one
- tsp-every-hop-records-how-long-it-took
- tsp-the-surface-answers-no-worse-while-the-engine-is-busy

## follow_up

### The measurement that settled the budget

The status the engine assembles for a hop costs 11 to 12 milliseconds warm, against a budget of 250. Cold it costs 4,201, once per process. Bumping the drawing epoch — which every hop does — costs nothing measurable, so the flip never pays the cold price twice.

AN EARLIER READING OF THE SAME NUMBERS WAS WRONG. Three boot hops each cost about 3.5 seconds and the uniformity looked like a fixed toll. The epoch test refuted it: the flip is milliseconds, and those hops are slow because of what those states DO — which the owner has ruled acceptable, provided it is signalled.

That correction is written into the hop-budget requirement so the wrong reading is not reached again.

### Two entries closed by this pass

- [the failed-route contradiction](spec/trace/raid/raid-iss-the-failed-route-test-asserts-the-converse-of-its-requirement.md)
- [the requirement and spec drift](spec/trace/raid/raid-iss-two-requirements-still-demand-comparisons-no-test-performs.md)

### What the general shape was

AMENDING A SPEC IS CHEAP AND AMENDING A REQUIREMENT IS NOT, so the pressure is always to move the lower layer. That asymmetry produced this, and it will produce it again wherever a measure turns out to be unmeasurable. The closed entry carries it.

## anything_else

TWO THINGS ABOUT THIS SET ARE WORTH A READER'S TIME.

THE HOP SPEC ASSERTS THE RECORDING AND NOT THE BUDGET, on purpose. Half its requirement is testable today and half waits on a figure nobody has ratified. An earlier draft of that requirement measured only the threshold, which named a test nobody could write, and a reviewer caught it. When a budget is set, a second spec asserts the threshold against the committed yardstick. This one does not pretend to be waiting for it.

THE SURFACE SPEC MEASURES THE SURFACE AGAINST ITSELF rather than against the standing surface bound. That bound carries an escape: answer within a second, or say what you are doing and finish in the background. Borrowing it would have let a surface paint a word in forty milliseconds, freeze for a hundred and ten seconds, and pass while the person watched the frozen screen the row forbids.

AND ONE SPEC KEEPS ITS MEANING IF ITS ASSUMPTION FAILS. The surface spec asserts a behaviour whatever the mechanism, so if the two halves are ever separated it simply passes for a better reason. That is deliberate: the row it verifies leans on a coupling that a sibling round could remove.
