---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-seed-dependency
type: "[[test-spec]]"
statement: A seed without depends_on refuses with the call to make instead, an empty list lands as a stated decision, and a named dependency becomes an edge the container reads.
method: test
verifies:
  - req-a-seed-states-its-dependency
files:
  - tests/seed-dependency.test.ts
---

## Scope

The seed boundary. One argument, one membership question, and the two
answers it has to keep apart.

## Approach

BOUNDARY LEVEL, THROUGH THE LANE. The demand is about what a verb
refuses, so the cases call the verb.

THE DECISIVE CASE IS THE EMPTY LIST, not the refusal. A required argument
is easy; making "I decided none" expressible is the whole point, and it
is what a plain required-field check would miss.

THE LAST CASE IS ABOUT A PERSON. The rule already stood in the tool's own
argument description and did not hold, so a line of guidance rides beside
the refusal — a person does not read a tool schema.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- A SEED OMITTING THE KEY IS REFUSED, and the refusal names the key.
- THE REMEDY SHOWS THE KEY WITH A LIST IN IT. A refusal saying only that
  the key is missing leaves the caller to guess whether empty is legal,
  and most will assume it is not.
- AN EMPTY LIST LANDS, and the record carries `depends_on: []` on disk.
  That is what makes I-decided-none different bytes from I-forgot.
- A NAMED DEPENDENCY BECOMES A REAL EDGE. The waiting iteration is not
  offered by the container until the wait clears — the DAG's only input
  doing its job.
- THE GUIDANCE STILL NAMES THE DAG for a person seeding by hand.

## What is deliberately not here

BACKFILLING. Twenty existing records carry an unset key and no case
demands they change. Backfilling guesses, and a plausible wrong edge is
worse than a visible missing one.

## The measurement behind the row

2026-08-13: twenty-seven iterations seeded, the key set on seven. Three
stated a wait in their own vision prose and carried no edge for it — the
UI sitting after the panel round, the comment system after the machine
format, and the cloud iteration after the lane binding.
