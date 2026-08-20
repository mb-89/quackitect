---
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound
type: "[[test-spec]]"
statement: "The benchmark reports folder returns zero results from every lane verb while a run is bound, and returns them normally when none is."
method: "test"
verifies:
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
files:
  - "tests/benchmark-run.test.ts"
---

## Scope

THE CONDITIONAL MASK over the reports folder, at every lane verb that can name
a path or return one.

WHAT IS DELIBERATELY OUT. Concealing the ORIGINAL iteration's answers. Those are
absent from the tree rather than masked, and they are
`tsp-a-bound-run-cannot-reach-past-its-rewind-point`.

## Approach

DESIGN METHOD: state graph over one binary condition — bound or not bound —
crossed with every verb that can see a path.

LEVEL: integration.

DEPTH: high, and this spec is the one most likely to be authored as fabricated
coverage, so the approach says why. M6's spike found FOUR exclusion lists in the
lane, one of them EMPTY and three disagreeing. A test that exercises one list
and passes proves nothing about the other three.

SO THE SPEC IS WRITTEN AGAINST CALL SITES, NOT AGAINST A LIST. Four sites were
measured across three files: `paths.ts`, `search.ts`, and `fileRead` in
`files.ts`. Every one gets its own case, and a fifth case asserts the count, so
a new verb added later fails this spec rather than quietly escaping it.

THE BOTH-WAYS CASE IS NOT OPTIONAL. A mask that is always on satisfies the
first half of the requirement and breaks the system, and it would pass a spec
that only tested the bound state.

## Steps

- while a run is bound, a read of a reports path returns nothing
- while a run is bound, a search whose match lies in the reports folder returns
  zero hits
- while a run is bound, a glob over the reports folder returns zero files
- while a run is bound, a list of the reports folder's parent does not name it
- with no run bound, every one of the four above returns normally
- the number of call sites the mask covers is asserted, so a new one that skips
  it fails here
- a path that merely RESEMBLES a reports path is not masked, so the rule is a
  rule and not a substring
