---
id: tsp-reading-loop
type: "[[test-spec]]"
statement: The reading loop serves every owed document and credits only a proven read, verified by test over the pull's reading path.
method: "test"
verifies:
  - "req-reading-proof"
  - "req-owed-reading-is-served"
  - "req-compaction-reowes-the-reading"
  - "req-missing-document-stops-the-walk"
files:
  - "tests/reading.test.ts"
  - "tests/reads.test.ts"
  - "tests/multiread.test.ts"
  - "tests/routereads.test.ts"
  - "tests/rowreads.test.ts"
---

## Scope

The reading half of the pull: what is owed, how it is served, what counts
as proof, and what happens when a demanded document does not exist.
The walk's other laws live in [[tsp-walk-discipline]].

## Approach

Component level, against a fresh session per case. The cases derive from
the reading's own failure modes: a wrong proof, a partial page, a
compacted reader, a dangling read demand. Boundary cases cover the
lazy-reader shortcut (the end alone is not enough) and the multi-read.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a wrong answer credits nothing and the
same document comes again; a page credits only the documents it showed
whole; it rejects a well-shaped path with nothing behind it.
