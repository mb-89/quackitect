---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-a-separate-reader-recommends-and-never-acts
type: "[[option]]"
cluster: the-account
question: who resolves a rung to a worker
statement: "the sizing decision is made by a component that only ever reads the record and publishes advice, kept out of the walk entirely, so nothing in the walking path can spend anything on the strength of it"
found_by: prior-art
source: "four shipped recommend-only reconcilers found by the commissioned deep scan, 2026-08-20 — Kubernetes VPA in updateMode Off, Goldilocks, Robusta KRR, and Slurm's seff"
---

## Mechanism

THIS FILLS A DRY WELL THE SAME FINDER DECLARED. find_prior_art recorded that
nothing shipped was found that reports the gap between a declared class and what
the work needed, and never acts on it. That was wrong, and the deeper scan found
four.

WHAT THE FOUR HAVE IN COMMON. Kubernetes VPA in updateMode `Off` computes
recommendations continuously and writes them to the object without ever evicting
a pod. Goldilocks runs VPA in that mode across namespaces purely to produce a
dashboard. Robusta KRR reads metrics from outside the cluster and never installs
anything into it. Slurm's `seff` reports a finished job's efficiency after the
fact. All four separate the recommender from the actor, and in three of the four
the recommender cannot act even if it wanted to, because it holds no write path.

WHY THAT IS AN ARCHITECTURE AND NOT A SETTING. Our version of the same rule,
req-the-machine-names-a-driver-and-starts-nothing, is a constraint on a component
that sits inside the walk and could spawn. VPA's `Off` mode is the same rule
enforced by deployment: the recommender is a different process with different
permissions.

WHAT IT CHANGES HERE. The four sizing functions leave cluster-the-sizing and stop
being part of the walk at all. A reader tails the record, computes what each state
should have run on, and publishes. The walk itself gains nothing and loses nothing,
which is the point — the recommendation cannot be on the critical path if the thing
producing it is not.

AND IT CHANGES THE PAYOFF'S SHAPE. raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all
blocks the value of a live recommendation on a receiver that can act. A reader
that only reports has no such dependency: it is useful the day it runs, against
history, with nothing downstream of it.

WHAT IT COSTS: it can only ever be advice, and the whole seed is written as though
the machine will eventually be believed. It also cannot see a step before the step
runs, so it answers what should have happened rather than what should happen —
which is why three of the four shipped products above are dashboards.
