---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-layered-path-search
type: "[[option]]"
statement: resolve an artifact by joining its relative path onto each layer in turn, most specific first, and take the first that exists
cluster: the-walk
question: how an override is matched to what it overrides
found_by: prior-art
source: "v1's resolver at product/engine-go/resolver.go, ref main — Resolve() and overlayLayers()"
---

## Mechanism

THE LAYERS ARE AN ORDERED LIST OF DIRECTORIES. A lookup takes the artifact's
relative path, joins it onto each directory in order, and returns the first
one that exists on disk. Nothing is merged and nothing is compared.

v1 SHIPPED EXACTLY THIS with three layers: a machine-local overlay, the
copy's own committed overlay, and the vendored defaults. `Resolve(rel)` is
eight lines and does nothing else.

WHAT IT COSTS HERE. Resolution keys on the PATH, so an artifact that moves
inside the vendored layer silently stops being overridden. The override still
exists, still looks correct, and no longer applies. Nothing in the mechanism
can detect that, because the override's only claim on the original is that
they sit at the same relative path.

AND IT CANNOT ANSWER A SECOND QUESTION. Given an override, there is no way to
ask what it overrides — only to ask, for a path, which layer won. That is the
wrong direction for reporting what a copy changed.

WHAT IT BUYS. It is the cheapest mechanism here by a wide margin. There is no
index to build, nothing to keep in step, and a person can predict the answer
by looking at the directories.
