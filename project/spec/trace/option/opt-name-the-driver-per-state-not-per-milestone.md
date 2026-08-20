---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-name-the-driver-per-state-not-per-milestone
type: "[[option]]"
cluster: the-sizing
question: what unit gets a driver named
statement: "the driver is named for each state as the walk reaches it rather than once per milestone, which removes the reduction entirely and with it the whole problem of one hard item dragging the easy ones onto an expensive walker"
found_by: without
source: "trimming — the reduction function exists only because the naming happens at milestone granularity; remove the granularity mismatch and the function has nothing left to do"
---

## Mechanism

REMOVE THE REDUCTION BY REMOVING WHAT IT WAS FOR. `reduce-a-milestone-to-one-difficulty`
exists because a milestone holds many states of differing difficulty and one
driver had to serve all of them. Name per state and there is nothing to reduce.

WHAT GOES WITH IT, and this is why the trim is worth more than one function:

- The maximum rule goes, and its requirement with it.
- `raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker`
  closes — it describes a cost that only exists at milestone granularity.
- `opt-split-a-submachine-where-the-spread-is-wide` becomes unnecessary; it was
  a repair for the same mismatch.
- One of the four flows goes.

WHY IT WAS NOT THE OBVIOUS CHOICE, AND WHY THAT REASONING IS WEAKER THAN IT
LOOKS. Naming per state sounds churny — a new driver every few minutes. But
THE MACHINE ONLY NAMES. Publishing a name costs a field on a pull; it is the
ACTING that costs, and acting is outside the box by the design's own boundary.

SO THE COST LANDS ENTIRELY ON THE RECEIVER, which may reasonably ignore a
per-state name and re-read it only when it is willing to switch. A receiver
that switches per milestone can do so against per-state names; a receiver given
only per-milestone names cannot ever do better.

WHAT IT COSTS HONESTLY: the published value changes far more often, so anything
that logs or reacts to a change sees more traffic. And a receiver with no
policy of its own would thrash. THE FIX FOR THAT IS THE RECEIVER'S, which is
precisely where this design says such decisions belong.
