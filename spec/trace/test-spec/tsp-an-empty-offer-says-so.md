---
minted_in: i5-engine-hygiene-one-version-source-every-
id: tsp-an-empty-offer-says-so
type: "[[test-spec]]"
statement: A field whose live source resolves to no items names that source, so an empty offer and an unwired one read differently.
method: test
verifies:
  - req-an-empty-live-source-names-itself
files:
  - deliverable/tests/empty-source.test.ts
---

## Scope

One field's resolved arguments, built against a trace that holds nothing.

WHY THIS LEVEL. The arguments are a pure function of the field's declaration
and the corpus. Rendering a whole form to read one hint would test the renderer
and the form builder together, and only one of them can be wrong here.

## Approach

TEST-FIRST, AND ALL THREE CASES ARE RED at authoring time. The count is
recorded from the run of 2026-08-19 rather than from the plan, which expected
two of them to be green.

WHY ALL THREE. The field does not exist, so it reads as absent everywhere —
including in the two cases that assert it should be EMPTY. An absent field and
an empty one are the same value to the reader, which is the very distinction
this row is about, one level up.

TWO OF THE THREE ARE BOUNDARIES rather than padding, and they go green the
moment the field exists. A literal item is not a live source. A field declaring
no items is not an empty source, and silence about a source nobody declared is
correct silence.

BOUNDARY ANALYSIS IS THE METHOD, and the partition is small enough to walk
whole: no source, a source with items, a source with none.

## Steps

1. `a live source that resolves to nothing is named on the field` — RED. The
   case asserts the premise first, that the source really is empty in this
   root, so a green from a mis-built fixture is impossible.
2. `a source with items names nothing` — GREEN.
3. `a field declaring no items at all is not an empty source` — GREEN.

## What is deliberately not here

THE SAME SILENCE RUNS WIDER — a dependency matrix over no functions draws an
empty grid, and a comparison over an empty pool reports every pair settled,
which the code's own comments call the worst way to be wrong. Those are the
same rule one class up and they are out of this record's scope.
