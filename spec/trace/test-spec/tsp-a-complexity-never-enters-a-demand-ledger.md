---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-a-complexity-never-enters-a-demand-ledger
type: "[[test-spec]]"
statement: A step's complexity changes and no standing claim reopens, because the value never reaches the demand ledger a claim is checked against.
method: test
verifies:
  - req-the-complexity-value-is-read-live-and-never-pinned
files:
  - tests/sizing-live-read.test.ts
---

## Scope

ONE ROW, ALONE, BECAUSE IT IS THE CHEAPEST HIGH-VALUE THING IN THE SET and it
guards records that are open right now. Three standing records carry pinned
demands, and a complexity leaking into a ledger reopens all of them the first
time anybody edits a rating.

IT IS ALSO THE ROW THAT WOULD FAIL INVISIBLY. A pinned complexity does not throw.
It sits in a digest, and a reader discovers it as a cascade of reopened claims
weeks later with no obvious cause.

OUT OF SCOPE: whether a complexity is read from the cell, from the compiled
state, or from anywhere else. The requirement was restated at
`gate-architecture` to forbid the LEDGER and nothing else, and a spec that
pinned the source would put back the mechanism the restatement removed.

## Approach

LEVEL: unit, against the two functions that build a demand. `demandsFor` builds
each demand from an applies, an evidence and a shape; `shapeOf` serialises the
named keys. The assertion is about what those two produce, not about what any
caller does with them.

DEPTH: graded fatal. This is the one test the build owes before anything else,
and `gate-prototype` says so on its own face.

THE ASSERTION IS ON THE DIGEST AND NOT ON THE CODE PATH. A test that reads the
implementation and finds no complexity key passes while the implementation says
so. A test that compares digests before and after a complexity change passes only
while the BEHAVIOUR holds, which is the property the requirement is about.

## Steps

EVERY CASE IN THE REFERENCED FILE IS ONE STEP. What is owed:

- A COMPLEXITY CHANGE MOVES NO DEMAND DIGEST. Compute the demands for a state,
  change that state's complexity, recompute, and assert the digest is identical.
- A COMPLEXITY CHANGE MOVES NO STEP SHAPE. The same, against the serialised
  shape, because the shape is the other half of what a claim is checked against.
- A REAL CHANGE STILL MOVES THE DIGEST. Change something the ledger IS about and
  assert the digest DOES move. Without this case the first two pass on a broken
  digest that never moves at all, which is the classic false green.
- A STANDING CLAIM SURVIVES A RATING EDIT. End to end: sign a claim, edit a
  complexity, and assert the claim still stands.
