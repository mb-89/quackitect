---
form: partition-functions
reopened: "2026-08-20T07:24:17.017Z — a feeder re-signed above it after the v3 merge moved the rigor matrix and the M6 spikes moved the winner"
by: agent
signed_off: 2026-08-20T07:24:20.140Z
authors: agent
files:
---

# Evidence form / partition-functions

## current_situation

i37 stands at partition-functions, the second work state of M4. derive-criteria is signed.

Eight functions were derived at M3 and every one already carries `cluster: the-benchmark-run`. This state is where that single grouping is either defended or broken up.

The owner's engine ruling landed one state ago and it bears directly here: the rewind is a content operation, so no function needs to touch the deliverable.

## clusters

| fn-the-benchmark-run.choose-the-iteration-to-re-walk | the-benchmark-run |
| fn-the-benchmark-run.locate-the-rewind-point | the-benchmark-run |
| fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run | the-benchmark-run |
| fn-the-benchmark-run.refuse-what-the-rewind-point-cannot-reach | the-benchmark-run |
| fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run | the-benchmark-run |
| fn-the-benchmark-run.derive-what-the-walk-cost | the-benchmark-run |
| fn-the-benchmark-run.state-the-conditions-of-the-run | the-benchmark-run |
| fn-the-benchmark-run.fill-the-report-and-say-where-the-run-stopped | the-benchmark-run |

## follow_up

- enumerate-space is next, and the cluster boundary decides what the morphological box has rows for.
- THE ONE THIN LINK IS WORTH WATCHING. `choose-the-iteration-to-re-walk` consumes the report flow it does not produce. If a later design makes the scheduler its own thing, that is where the cluster splits.
- The engine ruling removed a candidate family before M4 drew the box. Nothing here needs to check out an old deliverable.

## anything_else

ONE CLUSTER, AND THE CASE FOR BREAKING IT UP WAS TESTED RATHER THAN SKIPPED.

WHAT HOLDS THE EIGHT TOGETHER, against the offered coupling reasons.

- SAME LIFECYCLE. Every one of them exists only while a run is bound, and dies with it. That is the strongest link and it covers all eight.
- SEQUENCE. They run in one order: choose, locate, stand, then the two guards for the length of the walk, then derive, state, fill.
- SHARED DATA. `flow-bound-run` is consumed by four of them and produced by one. Nothing else in the corpus touches it.
- SHARED FAILURE MODE for two of them specifically. The ceiling and the concealment both fail by REVEALING something, and both fail silently.

THE THREE SPLITS CONSIDERED AND REJECTED.

- GUARDS AS THEIR OWN CLUSTER. The ceiling and the concealment do share a failure mode. They were kept in because both are properties of the binding, and a cluster boundary between a binding and the rules it carries would put the seam in the wrong place.
- REPORTING AS ITS OWN CLUSTER. Deriving cost, stating conditions and filling the report look like a reporting subsystem. They were kept in because two of the three read state that only exists while the run is bound. A reporting cluster would have to reach back into the run's lifetime, which is a thicker link than the one it removes.
- THE SCHEDULER AS ITS OWN CLUSTER. `choose-the-iteration-to-re-walk` is the only function that reads the reports folder, and it is the only one that runs before a binding exists. It is the thinnest link in the group and the most likely place for a future split.

WHY IT STAYED IN. Cycling is only meaningful as part of a run. A scheduler that picks an iteration nobody then walks is a query, not a function, and splitting it now would invent a subsystem to hold one job.

THE HONEST SUMMARY: one cluster with one thin link, named rather than hidden, so a later reader knows where the seam is if it ever has to be cut.
