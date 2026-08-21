---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: cluster-the-sizing
type: "[[cluster]]"
name: deciding how strong a hand a piece of work needs, and saying so outward
coupling: sequence
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-20
---

## Rationale

FOUR FUNCTIONS IN A LINE, AND THE LINE IS THE WHOLE ARGUMENT. obtain-a-step-s-difficulty
reads a difficulty off a row; reduce-a-milestone-to-one-difficulty folds a set of
them into one; resolve-a-difficulty-to-a-driver maps that one onto a rung; publish-the-driver-outward
says the answer where a caller can hear it. Each consumes exactly what the one
before it produced, and nothing outside the four produces or consumes any of the
three flows between them (flow-step-difficulty, flow-milestone-difficulty,
flow-driver-recommendation).

THE COUPLING IS SEQUENCE, NOT SHARED-DATA. The four do not read a common store;
they hand one value along. Calling it shared-data would assert a thing they all
touch, and there is no such thing — the difficulty exists only in transit.

TWO EDGES TO THE REST OF THE TREE, MEASURED NOT ASSUMED. flow-compiled-machine
enters at obtain-a-step-s-difficulty; flow-instruction leaves from
publish-the-driver-outward. That narrowness is why M4 can substitute the whole
block: a candidate that decides sizing differently replaces these four and
touches nothing else.

NOT FOLDED INTO the-walk. Every one of these could be described as part of
running a walk, and that is exactly the reason not to: the-walk already holds
nine functions coupled by the dispatch, and these four are coupled to each other
by a value none of the nine ever sees.
