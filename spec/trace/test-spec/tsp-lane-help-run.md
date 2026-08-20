---
minted_in: i8
id: tsp-lane-help-run
type: "[[test-spec]]"
statement: An agent finds the right lane tool from a plain-words query through se_help, and a genuine miss is logged for the retro, verified by demonstration through the automated suite and the full battery.
method: demonstration
verifies:
  - "none — demonstrates sty-ask-the-lane-what-it-can-do carries the edge; the mechanics are test-verified by tsp-help-search"
demonstrates:
  - sty-ask-the-lane-what-it-can-do
files:
  - tests/sehelp.test.ts
---

## Scope

The mechanics are test-verified by [[tsp-help-search]]
(req-help-searches-tools-and-guidance, req-help-miss-is-logged,
req-help-demand-ranked, req-help-query-logged-with-result); THIS spec
demonstrates the story end to end, and `demonstrates:` is its upward
edge.

## Approach

Automated, not a staged session: the 5 scoped tests exercise a match, a
ranked multi-match, a genuine miss with its logged record, and the
demand list read back. The full battery run (job test-msrcohsf-11)
additionally confirmed se_help live and wired into tools.ts, catching a
wiring gap the scoped tests alone had missed.

## Procedure

- Call se_help with a plain-words query that matches a known tool.
  Observe: the tool named, ranked, with enough description to judge
  fit.
- Call se_help with a query that matches nothing. Observe: an honest
  miss, logged with its query text and timestamp.
- Call se_help with demands: true. Observe: the miss log read back as a
  ranked list.
- Run the full battery. Observe: se_help live and wired, not only
  green in isolation.
