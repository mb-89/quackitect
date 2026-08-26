---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-block-names-a-rung-and-never-a-model
type: "[[option]]"
cluster: the-sizing
question: who resolves a rung to a worker
statement: the block publishes a rung name and holds no roster at all, so resolving that rung to a concrete model is entirely the receiver's business and no model name ever appears in our tree
found_by: transform
source: SIT Subtraction applied to cluster-the-sizing — remove the roster, which looked essential
---

## Mechanism

REMOVE THE THING THE DESIGN SEEMED TO NEED. The seed assumes a model list read
live from the repository, and req-one-model-list-is-read-live-from-the-repository
makes it a requirement. Subtraction asks what survives without it.

WHAT SURVIVES IS MOST OF THE VALUE. A rung is a statement about the work — this
step needs a strong hand. A model name is a statement about a fleet. The first is
ours to make and the second never was.

IT IS NOT THE DECLARED CLASS WITH A FALLBACK POOL. opt-a-declared-class-with-a-named-fallback-pool
keeps the pool in our tree and names what fills a class when the first choice is
gone. This keeps nothing: there is no pool, no fallback, no first choice, and the
receiver may fill a rung however it likes.

IT KILLS AN ASSUMPTION RATHER THAN CARRYING IT. raid-asm-one-model-list-serves-every-host-the-engine-supports
is unproven and probably false — a list naming one vendor's models is wrong on
any host running another. Under this option no host ever reads a list of ours, so
the assumption is not weakened, it is not needed.

WHAT IT COSTS: an unmatched rung becomes the receiver's problem, and
req-an-unmatched-rung-names-itself-and-publishes-no-driver moves outside where we
cannot enforce it. The rung vocabulary also has to be stable and public enough
for a receiver to implement against, which is a smaller version of the roster
problem rather than its absence.
