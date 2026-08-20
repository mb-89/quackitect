---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: el-sizing
type: "[[element]]"
statement: Works out how strong a hand each step needs and says so outward, naming a rung and never a model, so whoever holds the fleet decides what the rung means.
kind: new
realization: make
group: the-sizing
implements:
  - fn-run-a-governed-walk.obtain-a-step-s-difficulty
  - fn-run-a-governed-walk.reduce-a-milestone-to-one-difficulty
  - fn-run-a-governed-walk.resolve-a-difficulty-to-a-driver
  - fn-run-a-governed-walk.publish-the-driver-outward
source_refs:
  - cand-the-receiver-decides
  - raid-dec-the-block-names-a-rung-and-never-a-model
  - raid-dec-the-no-match-is-a-returned-value-not-a-silence
  - raid-dec-difficulty-is-two-figures-and-is-named-per-state
---

The sizing element is the whole of cluster-the-sizing and nothing else. It takes
a compiled step in, produces a two-part difficulty — how hard the judgement is
and how much has to be read — resolves that pair to a rung, and publishes the
rung outward. It names no model, holds no roster, and starts nothing.

Boundary: two interfaces and no more. `flow-compiled-machine` arrives from the
walk engine; `flow-instruction` leaves toward the agent harness. That narrowness
is measured rather than asserted — the three flows between its four functions are
touched by nothing else in the corpus.

## One function it implements and never calls

reduce-a-milestone-to-one-difficulty IS ALLOCATED HERE AND IS DEAD UNDER THE
DECLARED WINNER. `raid-dec-difficulty-is-two-figures-and-is-named-per-state`
publishes per state, so there is no milestone to reduce over and nothing calls it.

IT IS ALLOCATED RATHER THAN DROPPED ON PURPOSE. `req-a-milestone-takes-the-maximum-complexity-over-its-rows`
is a must and it demands exactly this reduction. The element that would house it
is this one, so leaving it unallocated would hide a conflict between a standing
must and the declared architecture behind a tidy matrix. The conflict is real, it
is not this element's to settle, and it is put to gate-architecture — see the
element's own allocation note and F30 in the record's field report.

## What it does not do

IT DOES NOT SPAWN, and that is a constraint rather than an omission
(`req-the-machine-names-a-driver-and-starts-nothing`). It does not resolve a rung
to a model. It does not read a roster, because under the declared architecture no
roster exists in this tree.
