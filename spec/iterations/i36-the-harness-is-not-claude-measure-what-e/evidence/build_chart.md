---
form: build_chart
by: agent
signed_off: 2026-08-19T11:44:53.043Z
authors: agent
files:
---

# Evidence form / build_chart

## current_situation

All seven finders submitted. The chart below is derived from their option nodes across the five functions this change touched.

## chart

| candidate | name | what it is | visits |
| --- | --- | --- | --- |
| [[cand-a-the-adopted-baseline-refined]] | The adopted baseline, refined | Identify every harness by its handshake, keep the blocking stop hook with evidence-based interruption diagnosis and shape-level failure routing, and read old test records tolerantly. | [[opt-mcp-clientinfo-identifies-the-harness]] · [[opt-exit-code-blocks-the-stop-event-until-cleared]] · [[opt-tolerant-read-across-historical-test-record-shapes]] |
| [[cand-b-the-trimmed-spread]] | The trimmed spread | Drop per-harness identification in favour of one fixed lowest-common-denominator bound, and drop dedicated failure-shape routing in favour of the retro's existing periodic mining, while keeping the stop hook and diagnosis unchanged. | [[opt-serve-the-lowest-common-denominator-bound-always]] · [[opt-defer-failure-classification-to-periodic-retro-mining]] · [[opt-tolerant-read-across-historical-test-record-shapes]] |

## why_these

Two candidates span real variation rather than one answer dressed as a chart.

CANDIDATE A, the adopted baseline refined: identify-the-harness reads the handshake and sizes payloads to it, with a closed harness type (paired with a typecheck gate so the safety claim is honest); hold-the-session-through-work keeps the blocking hook; name-the-stopping-layer reconstructs the layer from evidence and attaches its finding to the call log; route-a-failure-shape classifies by shape; tolerate-old-test-records reads tolerantly.

CANDIDATE B, the trimmed spread: identify-the-harness is dropped in favour of one fixed lowest-common-denominator bound for every host; route-a-failure-shape is dropped in favour of the retro's existing periodic mining; the other three functions are unchanged, because find_without found no absorber for them and find_by_transforming's reversal and substitution ideas were judged complements rather than replacements.

Why only two: every other option on the chart is either a refinement of Candidate A's cells (the typecheck gate, the call-log attachment, the write-time migration) rather than a competing mechanism, or was explicitly rejected with a reason (the fixed-duration grace window). A third candidate would only recombine refinements that do not conflict, which is not a new point in the design space.

## dropped_finders

none — all seven finders applied and each contributed at least one recorded finding.

## follow_up

Candidate B (the trimmed spread) is carried forward for comparison alongside Candidate A when M4 elaborates candidates; the write-time migration and call-log attachment refinements ride with whichever candidate is chosen, since they are additive rather than exclusive.

## anything_else

