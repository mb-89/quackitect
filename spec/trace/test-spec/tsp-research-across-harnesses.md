---
minted_in: i36
id: tsp-research-across-harnesses
type: "[[test-spec]]"
statement: An engineer asking for current harness research receives a primary-source comparison whose queries and sources are logged, whose gaps are named, and whose figures say where each came from.
method: demonstration
demonstrates:
  - sty-run-deep-research-across-harnesses
verifies: "none — demonstrates: carries the edge; the harness-contract requirements behind this story are verify_method: test and are carried by tsp-supported-harness-serves-one-lane-contract"
files:
  - none — a demonstration judged on the reference document and register entries a real run left behind
---

## Scope

One research run, end to end, judged on what it leaves behind rather than on
what it felt like.

- The workflow is the project's, not the host's.
- Every query reaches the log.
- Primary sources are separated from vendor claims.
- Unreachable sources are named, not omitted.
- The result becomes work with triggers.

WHAT IS DELIBERATELY OUT. Whether the findings are correct. That is the
sources' business; this demonstration is about whether the trail is there.

## Approach

DESIGN METHOD: end-to-end demonstration on a real question with a real
deadline, judged against the artifact it produced.

LEVEL: system. Provider selection, the query log, the reference document and
the register entries are four different mechanisms and the story needs all of
them.

DEPTH: medium. A weak run is visible immediately — the report is thin or the
gaps are missing. The subtle failure is a confident report with no ledger,
which is exactly what the steps below check for.

## Procedure

- Confirm the workflow read is the project's own projected copy.
- Confirm every query appears in the call log.
- Confirm each figure carried into code names its provenance.
- Confirm unreachable sources are recorded as gaps rather than dropped.
- Confirm the implications became register entries carrying triggers.

## Known partial on the 2026-08-19 run

TWO SLIDES ARE PARTIAL AND THE DECK SAYS SO. The search provider was not
selected by the lane, because `se_web_search` had no configured key and
native search carried the queries under the standing exception. Saturation
was judged by the author rather than recorded. Both are open items on
`raid-debt-harness-fallback-and-bounds-need-implementation-proof`, and this
spec is red on those two steps until that debt is repaid.
