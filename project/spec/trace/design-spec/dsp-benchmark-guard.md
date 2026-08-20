---
minted_in: i37-training-iterations-a-disposable-iterati
id: dsp-benchmark-guard
type: "[[design-spec]]"
statement: "Two refusals with one owner: history above the rewind point, and the benchmark reports for as long as a run stands."
realizes:
  - el-benchmark-guard
files:
  - project/deliverable/engine/benchmark-guard.ts
  - project/deliverable/engine/paths.ts
  - project/deliverable/engine/search.ts
  - project/deliverable/engine/files.ts
---

## Responsibility

TWO REFUSALS, AND THEY ARE ONE ELEMENT because both are properties of the
BINDING rather than of a path.

- THE CEILING. Nothing newer than the rewind point resolves.
- THE CONCEALMENT. `project/spec/benchmarks` is invisible while a run is bound
  and visible everywhere else.

## Interface

The guard is consulted, never called by the agent. It sits at the lane's own
call sites and answers one question: may this path, or this ref, be seen from
where the walk stands.

## Behavior and constraints

THE CEILING IS STRUCTURAL, NOT CHECKED, and that is a change from the design
this element was minted with.

A CHECKED CEILING tests ancestry per resolution. It works, it costs 4229
microseconds per call, and the cost is the process spawn so no subcommand is
cheaper. Worse, IT FAILS OPEN: when the check errors, the wrong act passes.

A STRUCTURAL CEILING HAS NO TEST TO RUN. The depth-1 fetch leaves the future
ABSENT, so a request for a commit past the rewind point cannot be FORMED. There
is no path on which it passes silently.

THE COMPARISON THAT SURVIVES IS 4229 MICROSECONDS AGAINST ZERO, which needs no
threshold. The millisecond threshold this iteration first measured against was
the agent's own invention and is withdrawn.

THE POSITIVE CONTROL IS PART OF THE DESIGN, not part of the test. An empty fetch
and a correct rewind are indistinguishable from inside. A run asserts that a
DIFFERENT iteration's files ARE present in the same fetched tree; measured on
i33, 0 files naming i33 against 71 naming another iteration.

THE CONCEALMENT IS FOUR CALL SITES ACROSS THREE FILES: `paths.ts`, `search.ts`,
and `fileRead` in `files.ts`. That count was measured, not estimated.

IT IS WRITTEN AGAINST CALL SITES AND NEVER AGAINST A LIST. M6 found FOUR
exclusion lists in the lane, one EMPTY and three disagreeing, and the reading
verb consults none of them. A rule attached to one list is a rule that holds in
one quarter of the lane.

## Rationale

THE CONCEALMENT IS A DEPENDENCY RATHER THAN A NEIGHBOUR, and this element is
why. `wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-` owns the
lists. This design can name its four sites and cannot unify what they read.

ONE FORBIDDEN REQUEST PER RUN IS KEPT, for a different reason than it was
invented for. It was invented to prove a checked guard was watching. With a
structural ceiling there is no guard to watch, so it now proves the FETCH was
right — which is the failure mode the structural design actually has. A run
whose forbidden request SUCCEEDS is discarded rather than reported.
