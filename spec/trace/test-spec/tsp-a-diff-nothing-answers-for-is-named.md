---
minted_in: i51-work-running-out-of-sight-reports-itself
id: tsp-a-diff-nothing-answers-for-is-named
type: "[[test-spec]]"
statement: A change that maps to no test starts no test file, and the answer names every changed part that nothing covers.
method: test
verifies:
  - req-a-diff-no-test-answers-for-is-reported-not-swept
files:
  - tests/discipline.test.ts
---

## Scope

One branch of the scope decision: the one where NOTHING maps.

WHAT IS DELIBERATELY IN. A change whose parts map to no test at all. The answer
must run nothing from the suite and name the unanswered parts.

WHAT IS DELIBERATELY OUT, and each has a reason that survives this row. A red
standing suite, a tree whose changes cannot be read, a direct request for a full
run, and the piecemeal threshold all keep running everything.

THE VERIFICATION BATTERY IS UNTOUCHED. This row governs a question asked
mid-walk, never the release evidence, and the full suite still runs at
verification fired by that state's own leaving check.

## Approach

COMPONENT LEVEL, driving `decideScope` directly, in the file where its cases
already live. Adding a file would split one function's cases across two places
and leave the fixture duplicated.

THE FIXTURE IS THE ONE ALREADY THERE. `gitRoot()` stands a repository with one
committed TypeScript file; the new helper adds one uncommitted markdown file and
nothing else. That is the smallest tree that puts the decision in the branch
under test.

THE DESIGN METHOD IS EQUIVALENCE PARTITIONING over what a diff maps to: all
parts map, some map, none map. This spec covers the third partition. The first
is covered by the standing cases above it in the same file; the second is owed
and is named below.

RISK DECIDES DEPTH, AND THIS ROW IS `should` RATHER THAN `must`. Its evidence is
a count from one session, so two cases is proportionate. It also carries
[[raid-risk-a-narrower-test-scope-misses-a-break]], which is why nothing here
narrows what verification runs.

## Steps

Both cases sit in `tests/discipline.test.ts` and each name states its claim.

- A DOCUMENTS-ONLY CHANGE STARTS NO TEST FILE AT ALL. Fails while a markdown edit
  fires the whole suite, which answers a question nobody asked.
- THE ANSWER NAMES EVERY CHANGED PART THAT NO TEST COVERS. Fails unless the
  unanswered file is named back to the caller rather than swept past.

BOTH ARE RED AT AUTHORING, and the second may be closer than the first. Measured
2026-08-21 on this record's own run: the engine reported "131 changed file(s)
have no test that answers for them" and then ran the battery anyway. It already
names them; it does not yet decline to sweep.

WHAT IS OWED AND NOT WRITTEN. The middle partition — some parts map and some do
not — needs a fixture with both a covered source file and an uncovered document,
and it asserts that what maps runs while what does not is named. It waits for the
first branch to exist, because a decision that always returns the battery cannot
show a partial answer.
