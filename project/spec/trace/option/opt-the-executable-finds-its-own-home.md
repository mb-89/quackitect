---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-executable-finds-its-own-home
type: "[[option]]"
statement: the running program locates its own method by walking up from where its executable sits, and never consults the tree it is working in
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: v1's resolveEngineRoot at product/engine-go/engine.go, ref main — first step, the .quack ancestor of the executable
---

## Mechanism

THE PROGRAM ASKS THE OPERATING SYSTEM WHERE IT IS. It then walks up a bounded
number of directories looking for a marker, and the directory holding that
marker is its home.

v1 WALKS UP FOUR LEVELS from the executable's directory looking for a folder
named `.quack`. Its design note calls this resolving "independent of the
workspace", and it is the FIRST step in v1's order — everything else is a
fallback.

WHAT IT BUYS, AND IT IS THE LARGEST THING ON OFFER. There is no pointer to
write, nothing to keep in step, and nothing to lose. The working tree can be
moved, copied to another machine or cloned by a colleague and the answer does
not change, because the answer was never stored in the working tree.

WHAT IT COSTS HERE. It only works while the program and its method travel
together. The moment the two are installed separately — a binary on the path,
a method tree elsewhere — the walk finds nothing and the mechanism is silent
about it.

AND IT ANSWERS ONLY ONE OF THE TWO QUESTIONS. It says where the method lives.
It says nothing about which tree the WORK belongs to, so a second mechanism is
still needed for that.

A SECOND COST WORTH NAMING: the marker is a directory name, so any tree that
happens to contain one of the right shape is a candidate home. v1 guards this
with a stricter check elsewhere rather than in the walk itself.
