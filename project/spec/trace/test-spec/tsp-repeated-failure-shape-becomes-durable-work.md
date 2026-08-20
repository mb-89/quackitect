---
minted_in: i36
id: tsp-repeated-failure-shape-becomes-durable-work
type: "[[test-spec]]"
statement: A non-misuse failure shape that recurs across lane calls inside an open iteration window lands as iteration evidence or as a RAID entry carrying an owner and a trigger, rather than being absorbed call by call.
method: "test"
verifies:
  - "req-repeated-failure-shape-becomes-durable-work"
files:
  - tests/bucket.test.ts
  - tests/pool-mint.test.ts
---

## Scope

The path from a repeating failure to something a later session can act on.
Three things have to be true together.

- The shape RECURS. One occurrence is not a pattern.
- The shape is NOT MISUSE. An agent calling a tool wrongly and being refused
  is the system working.
- The result is DURABLE. Iteration evidence, or a register entry naming an
  owner and a trigger.

WHAT IS DELIBERATELY OUT. Fixing the failure. The requirement is about the
failure becoming visible work, never about it being resolved in the same
window.

## Approach

DESIGN METHOD: equivalence partitioning on the failure stream, with the
partitions chosen to be adversarial rather than convenient.

- One occurrence of a shape. Must NOT produce durable work.
- Several occurrences of one shape. Must produce it.
- Several occurrences of DIFFERENT shapes. Must not be collapsed into one.
- Several occurrences of a misuse shape. Must not produce it.

The third and fourth partitions are where a naive counter fails, and they are
the reason this is a partition exercise rather than a single happy case.

LEVEL: integration. The failure stream lives in the call log and the durable
work lives in the register and the pool, so no component sees both.

DEPTH: medium. The requirement has no numeric measure of its own, so the spec
cannot check a rate. It checks the mechanism instead, and that limit is
recorded below rather than hidden.

## Steps

Every case in `tests/bucket.test.ts` and `tests/pool-mint.test.ts` is one
step. Twenty-seven cases stand across the two files today.

THE MINTING HALF IS ALREADY GREEN, and it is what durable work is made of.

- A drain to the pool writes a work token carrying the statement, the
  condition and its note.
- The work token is a file under the pool, readable without the note store.
- A missing re-entry condition is refused.
- An empty statement is refused.
- A finding is minted once, and a second mint of the same note is refused.
- An owed item naming an open register entry is carried by the close, not
  treated as unchecked.
- An owed item naming nothing is not counted as a carried finding.

THE FOUR BELOW ARE RED TODAY. Nothing counts recurrence, so nothing can act
on it.

- A failure shape seen once inside the window produces no durable work.
- The same shape seen again produces exactly one piece of durable work,
  carrying an owner and a trigger.
- Two different shapes seen twice each produce two, not one.
- A misuse shape, however often it repeats, produces none.

## The gap this spec cannot close

The requirement carries no `measure`. Every other requirement in this
iteration states one, and this one is blank.

So the spec cannot check a rate, a threshold or a window length, because none
is defined. What "recurs" means in counted terms is undecided, and the four
steps above assume the cheapest reading: twice is recurrence.

That assumption is recorded here rather than buried in a test. If the measure
lands later and says something else, this spec is what has to change.
