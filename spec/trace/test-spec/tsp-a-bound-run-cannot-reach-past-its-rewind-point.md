---
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-a-bound-run-cannot-reach-past-its-rewind-point
type: "[[test-spec]]"
statement: "A benchmark run resolves nothing newer than its rewind point, and where ancestry cannot be established the lane refuses rather than serves."
method: "test"
verifies:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - req-a-ceiling-that-cannot-prove-ancestry-refuses
files:
  - "tests/benchmark-run.test.ts"
---

## Scope

THE CEILING, at every verb that reaches history. `se_file_read`, `se_file_search`
and `se_file_glob` all take a `ref`, so all three are in scope.

WHAT IS DELIBERATELY OUT. Whether the benchmark REPORTS folder is visible. That
is a lane visibility question rather than a history one, and it lives on
`tsp-the-benchmark-reports-are-concealed-while-a-run-is-bound`.

ALSO OUT. Whether the rewind point is found correctly for a given iteration.
That is `raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it`,
deferred with its until.

## Approach

DESIGN METHOD: equivalence classes over the ancestry relation, with the
boundary case named explicitly.

- ANCESTOR of the rewind point — must resolve.
- THE REWIND POINT ITSELF — must resolve. This is the boundary and it is the
  case an off-by-one gets wrong.
- DESCENDANT of the rewind point — must not resolve.
- NOT IN THE TREE AT ALL — must refuse, not return empty.

LEVEL: integration. The lane verb, the binding and the git object store are
three mechanisms and the requirement is about the seam between them.

DEPTH: high, and the reason is measured. The winner's ceiling is STRUCTURAL:
the objects are absent from a depth-1 fetch rather than tested for. That is
cheaper and it moves the failure mode. A checked ceiling fails OPEN when the
check errors. A structural one fails when the fetch is wrong, and a wrong fetch
looks exactly like a correct one until something is requested.

SO THE POSITIVE CONTROL IS LOAD-BEARING AND IS A STEP RATHER THAN A NICETY.
Measured on i33 during M6: 0 trace files naming i33 in the fetched tree against
71 naming a different iteration. Without that control an empty fetch and a
correct rewind are indistinguishable.

## Steps

Every case below is one step; the case name states its claim.

- a commit that is an ancestor of the rewind point resolves
- the rewind point itself resolves
- a commit newer than the rewind point does not resolve
- the positive control: a different iteration's files ARE present in the same
  fetched tree
- a request for an absent commit REFUSES rather than returning an empty result
- the refusal names the rewind point, so a reader can tell a ceiling from a
  broken fetch
- every ref-taking verb is covered: read, search and glob each refuse alike
