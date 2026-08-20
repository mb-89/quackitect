---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-a-rung-names-an-intensity-as-well-as-a-worker
type: "[[option]]"
cluster: the-sizing
question: what the standing mapping holds
statement: the mapping's entry is not a worker's name but a pair — which worker and how hard it should try — so two steps of different difficulty can share a worker and still cost differently
found_by: prior-art
source: the request-level effort parameter documented at platform.claude.com/docs/en/build-with-claude/effort, a per-request intensity ladder orthogonal to model choice which affects tool calls as well as tokens
---

## Mechanism

THE MAPPING GAINS A SECOND COLUMN. A rung resolves to a worker AND to an
intensity setting, and the two move independently.

WHY IT MATTERS FOR THE CHEAP END: a transcribe-or-rule step does not only want
a smaller worker, it wants a worker that does not go looking for work. An
intensity dial reaches that directly, and it reaches it on workers where no
smaller sibling exists.

TWO CAVEATS THAT DECIDE THE DESIGN, both from the source: the intensity scale
is calibrated PER WORKER, so the same word means different things across them —
which means the pair cannot be decomposed into two independent lookups. And
changing intensity between requests invalidates a cache, so it should hold
constant within a stretch of work rather than varying per step.

IT IS COMPATIBLE WITH EVERY OTHER OPTION HERE, which is why it is worth
enumerating separately: it widens what an entry holds without changing who
decides or when.
