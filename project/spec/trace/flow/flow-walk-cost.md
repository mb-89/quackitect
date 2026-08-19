---
minted_in: i37-training-iterations-a-disposable-iterati
id: flow-walk-cost
type: "[[flow]]"
statement: "what the walk cost, per state, taken from the call log"
kind: signal
source_refs:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
---

## Nothing new is captured

`engine/calllog.ts` already records ts, tool, ok, outcome and duration_ms for
every dispatch. This flow is a derivation over what is already written, not a
second capture.
