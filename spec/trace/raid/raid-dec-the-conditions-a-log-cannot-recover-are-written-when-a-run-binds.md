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
  - req-a-benchmark-report-carries-the-conditions-of-its-run
  - cand-the-refusing-run-with-recorded-conditions
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

## Rejected options

- DERIVE EVERYTHING FROM THE CALL LOG. Rejected on a fact: the log stamps `se_version` and nothing else about the session. The model, the reasoning effort and the harness appear in no record.
- WRITE EVERYTHING AT BIND TIME. Rejected: the matrix hash, the se version and the rewind commit are all derivable, and a second copy of a derivable fact is a copy that goes stale.
- LEAVE THE UNRECOVERABLE THREE BLANK. Rejected: a result that cannot say what it was taken on cannot be paired, which is the whole product.

## Consequences

- Binding writes three fields and no more.
- A run that cannot obtain the model, the effort or the harness refuses rather than writing a blank.
- Adding a condition to the report means deciding which of the two halves it belongs to.
