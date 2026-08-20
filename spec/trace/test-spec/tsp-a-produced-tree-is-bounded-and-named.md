---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: tsp-a-produced-tree-is-bounded-and-named
type: "[[test-spec]]"
statement: An act that produces or drives a tree writes inside it and nowhere else, names it once, and puts each kind of artifact where the driven arrangement says it goes.
method: test
verifies:
  - req-an-act-writes-only-the-tree-it-produced
  - req-the-product-name-is-one-fact
  - req-where-each-artifact-lands-when-driving
files:
  - tests/roots.test.ts
  - tests/resolution.test.ts
---

## Scope

THREE ROWS THAT ALL TURN ON ONE QUESTION: which tree does this write reach.
Producing a vehicle, driving a foreign project and naming a product are
different acts, and every one of them fails the same way — bytes landing
somewhere nobody chose.

WHAT IS DELIBERATELY OUT. The overlay's resolution order, which is
[[tsp-overlay-seam]]'s. The isolation direction — that nothing a vehicle does
reaches its engine — which is [[tsp-product-scaffold]]'s and is about the
artifact rather than the write.

## Approach

THE DESIGN METHOD IS BOUNDARY VALUE ANALYSIS, because every one of these rows
is a containment rule and containment rules fail at their edges. The edges are
the base itself, one level inside it, and one level outside it.

THE LEVEL IS COMPONENT. Every case here is catchable at the resolver, and
[[meth-test-design]] says a case belongs to the lowest level that can catch its
defect. Nothing needs a running product.

DEPTH FOLLOWS EXPOSURE, and it is high. raid-risk-a-write-lands-in-the-wrong-tree-silently
is graded fatal and expected, and its own words say why a test is the only
guard that works: a refusal is loud and a misroute is silent.

AND THE SPIKE FOUND THE COVERAGE GAP THAT MAKES THIS SPEC URGENT. Measured
2026-08-18: tests/roots.test.ts has four cases, and none of them asserts either
containment rule. Both behaviours are implemented in engine/paths.ts and
neither is proved.

## Steps

EVERY CASE IN THE REFERENCED FILES IS ONE STEP. The load-bearing ones, named
because they do not exist yet and must:

- A ROOT-REF ON A WRITE LANE REFUSES, with the clause it claims. `resolveInRoot`
  throws PATH_ESCAPE on any `@name/...` today, and nothing asserts it.
- A PATH CLIMBING OUT OF A DECLARED BASE REFUSES. `resolveDeclaredRoot` compares
  the resolved path against the base and rejects anything outside, and nothing
  asserts it.
- A WRITABLE DECLARED TARGET WRITES INSIDE ITS BASE and refuses one level above
  it. This is the case the second write target adds, and it is the same
  containment assertion against a different base.
- A DECLARED TARGET THAT IS THE ENGINE'S OWN TREE REFUSES. No code does this
  today and the case is written first, so it starts red.
- THE BOUND TRAVELS WITH THE PRODUCING ACT. Five cases in
  `tests/resolution.test.ts`: a write during the act lands in the tree being
  produced, a write outside it refuses NAMING that tree, a read still reaches
  the tree being copied, a failed act leaves nothing bound, and a second act
  cannot open a bound while one is open.
  THE FIRST OF THOSE USES A METHOD PATH DELIBERATELY. Method resolves to the
  machine root whatever is bound, which is right during a walk and would write
  the engine while copying it. The bound has to beat the kind routing, and
  that case is where it is proved rather than assumed.
- THE PRODUCT NAME READS BACK FROM ONE FILE. The name is written once, and a
  second place claiming it is a failure rather than a duplicate.

TWO CASES ARE OWED A FILE THAT DOES NOT EXIST. The name and the driven-tree
placement will land in the scaffold's own test file when the producers are
built. Naming them here rather than waiting is what test-first means, and
[[meth-test-design]]'s own rule is that the spec never waits for the build.

WHAT NO FILE CAN CARRY. Nothing. Every step above is a function call against a
temporary directory, which is why the level is component and the depth is high.
