---
unreachable_refs:
  - cand-whoever-holds-the-hands-decides
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
  - cand-whoever-holds-the-hands-decides
  - raid-dec-the-block-names-a-rung-and-never-a-model
  - raid-dec-the-no-match-is-a-returned-value-not-a-silence
  - raid-dec-difficulty-is-two-figures-and-is-named-per-state
---

The sizing element is the whole of cluster-the-sizing and nothing else. It takes
a compiled step in, produces a two-part difficulty — how hard the judgement is
and how much has to be read — resolves that pair to a rung, and publishes the
rung outward. It names no model, holds no roster, and starts nothing.

Boundary: three interfaces. The compiled step arrives through
[[if-method-compiler-to-sizing]] and [[if-engine-delta-to-sizing]]. The sized
instruction leaves through [[if-sizing-to-walk-engine]]. That narrowness is
measured rather than asserted — the three flows between its four functions are
touched by nothing else in the corpus.

THIS PARAGRAPH SAID "TWO INTERFACES AND NO MORE" UNTIL i51, and it named the
walk engine as where the compiled step comes from. Both were wrong when
written: the inbound contract was already two nodes, and neither is the walk
engine.

WHAT i51 ADDED IS THE OUTBOUND NODE. `hand-back-a-step-still-deciding` is the
first function in this tree to consume `flow-instruction`, so the return leg
became a crossing the element matrix computes. The exchange itself is as old as
the element.

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
