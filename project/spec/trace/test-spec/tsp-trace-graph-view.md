---
minted_in: i1
id: tsp-trace-graph-view
type: "[[test-spec]]"
statement: The trace graph draws only what serves the filter, with zero empty levels, verified by test over the layout.
method: "test"
verifies:
  - "req-filter-draws-only-what-serves"
files:
  - "tests/trace.test.ts"
  - "tests/branching.test.ts"
  - "tests/sizing.test.ts"
---

## Scope

The drawn view's honesty under filtering: type filters remove rings,
text filters keep the line of descent, empty levels draw no ring, and
the geometry laws that keep the drawing readable.

## Approach

Component level over in-memory graphs, one per case. The filter claims
are probed with and without matches, and the geometry claims assert the
SERVED numbers, never the source.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a TEXT match keeps its whole line of
descent, and drops everything else; a TYPE filter removes rings rather
than greying them; a level with nothing on it draws NO ring, and gets
one the moment it does.
