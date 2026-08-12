---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-trace-integrity
type: "[[test-spec]]"
statement: The trace holds both ways with zero dangling edges, and every reader resolves against one chosen corpus, verified by test over the trace loaders and checks.
method: "test"
verifies:
  - "req-broken-trace-is-a-defect"
  - "req-coverage-checked-both-ways"
  - "req-trace-source-never-mixes"
files:
  - "tests/trace-coverage.test.ts"
  - "tests/refs.test.ts"
  - "tests/traceschema.test.ts"
  - "tests/frontmatter.test.ts"
  - "tests/requirement-checks.test.ts"
---

## Scope

The corpus's integrity laws: edges that resolve, coverage in both
directions at every adjacent pair, the edge schema, and the one-accessor
rule that keeps trunk and record corpora apart.

## Approach

Component level, over minted fixtures and over the REAL corpus — the
coverage cases sweep the actual trace folders so a hole is found because
it exists, never because somebody listed it. Fault-based for the
refusals: a dangling ref, a wrong type, a crossing edge.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: every refines edge lands on a node that
exists; every requirement connects to at least one use-case; every
use-case is refined by at least one requirement; every trace read goes
through the one accessor, so the readers cannot drift.
