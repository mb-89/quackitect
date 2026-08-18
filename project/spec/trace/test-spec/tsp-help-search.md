---
minted_in: i8
id: tsp-help-search
type: "[[test-spec]]"
statement: se_help ranks real tools and guidance by keyword match, logs every miss to a ranked demand log, and rides the standard call log, verified by test over engine/help.ts.
method: test
verifies:
  - req-help-searches-tools-and-guidance
  - req-help-miss-is-logged
  - req-help-demand-ranked
  - req-help-query-logged-with-result
files:
  - tests/sehelp.test.ts
---

## Scope

se_help end to end: keyword ranking over tools and guidance, the miss-to-demand-log path, demand ranking by shape, and call-log visibility. Out: the introspection verb and the missing-capability enumeration — i8's own non-goals.

## Approach

Component level, black-box against the MCP call. Equivalence classes over the query: a hit against a tool's own name and description, a hit against a guidance page's own statement, and a clean miss. State-based over the demand log: a first miss opens a shape, the same words in a different order join that shape, a distinct query opens a second shape, ranked most-demanded first. Boundary case: se_help called with neither query nor demands.

## Steps

Every case in tests/sehelp.test.ts is one step; the case name states its claim.

- "a query matching a real tool's name and description ranks it first" — req-help-searches-tools-and-guidance
- "a query matching a guidance page's own statement surfaces it" — req-help-searches-tools-and-guidance
- "a nonsense query misses, is logged, and demands rank by shape" — req-help-miss-is-logged, req-help-demand-ranked
- "se_help refuses when neither query nor demands is given" — guards the call shape the other cases exercise
- "every se_help call lands on the ordinary call log, like any other tool" — req-help-query-logged-with-result
