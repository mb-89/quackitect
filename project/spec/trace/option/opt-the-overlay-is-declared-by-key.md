---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-overlay-is-declared-by-key
type: "[[option]]"
statement: the copy's own layer sits wherever a committed configuration key says it does, and no key means there is no layer
cluster: the-bootstrap
question: where a copy's own layer lives
found_by: prior-art
source: "v1's overlayLayers, product/engine-go/resolver.go at ref main — the overlay key in the workspace's spec/project.toml"
---

## Mechanism

THE LAYER'S LOCATION IS DATA, NOT A CONSTANT. A committed configuration file
carries a key naming the folder, and the resolver reads that key to build its
layer list. v1's own comment states the fallback plainly: "no key, no layer."

WHAT IT BUYS. The copy chooses its own layout. A copy that wants its method
extensions beside its documentation puts them there and says so, rather than
arranging its tree to suit the tool.

AND THE KEY IS COMMITTED, which is the load-bearing half. It travels with the
repository, so the layer is found identically after a move, a copy to another
machine, or a colleague's clone. Nothing machine-local is involved.

v1 ALSO CARRIED IT ACROSS THE BOUNDARY. Its comment says a copy's method
extensions merge over the vendored layer "for itself AND for every stub it
drives". So the same declared layer serves the copy's own work and every
foreign project that copy drives, from one statement.

WHAT IT COSTS. It is one more thing that can be wrong, and wrong quietly. A
key naming a folder that does not exist yields no layer, which is
indistinguishable from a copy that declared nothing — and the copy's overrides
then stop applying with no signal at all.

THE ALTERNATIVE IT IS COMPETING WITH is a fixed location the tool knows. That
one cannot be misconfigured, and cannot be adapted either.
