---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds
type: "[[raid]]"
kind: decision
statement: "The model, the reasoning effort and the harness are written at bind time. Everything else a report needs is derived when the report is written."
owner: the owner
trigger: "any new condition added to a report, or the first host whose model and effort cannot be obtained at bind time"
status: decided
impact: "Those three are properties of a session and appear in no call record. When the session ends they are gone, and a result that cannot say what it was taken on cannot be paired with anything."
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - "heuristic: if it must be remembered, it must be recorded"
  - "i37 evaluate-set: the refusing run scores 1 on req-walk-survives-host-swap by deriving them from a log that does not hold them"
  - "i36 \u2014 the harness is not Claude"
---

## What it settles

Which half of a report's conditions is collected and which is derived.

- DERIVED LATER: the rigor matrix hash, the se version, the rewind commit, the
  iteration id. All are in the repository or the call log.
- WRITTEN AT BIND TIME: the model, the reasoning effort, the harness.

## Why it decided the winner

It is the one cell that separates cand-the-refusing-run from the curve that was
declared. Everything else about them is identical.
