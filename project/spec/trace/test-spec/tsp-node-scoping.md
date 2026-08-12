---
minted_in: i2-parallel-iterations-across-machines-seed
id: tsp-node-scoping
type: "[[test-spec]]"
statement: Every trace node carries its minting iteration, reference views default to the current iteration's delta with an opt-in for the whole corpus, and the coverage laws keep reading everything — verified by test over the loader and the table views.
method: "test"
verifies:
  - "req-nodes-scoped-to-iteration"
files:
  - "tests/node-scoping.test.ts"
---

## Scope

The minted_in stamp, the backfill of standing nodes, the reference
views' default filter and its toggle, and the coverage laws' exemption
from the filter. The owner has stated the demand three times
(note-db7c72bd519c); the live instance is the author-tests node-table
listing all of i1 beside i2's delta.

## Approach

Component level over the trace loader, integration level over one form
render. Equivalence classes on the node's origin: minted this
iteration, backfilled standing, minted by a past record. The law case
is the guard: scoping must never hide a corpus-wide failure.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- a node minted under a bound record carries minted_in with that
  record's id
- standing nodes backfill from the branch that first carried them, or
  i1 wholesale
- a reference view lists only the current iteration's nodes by default
  and the whole corpus on the opt-in toggle
- a coverage law still fails on a corpus-wide gap the scoped view does
  not show — scoping is a view concern, never a truth concern
