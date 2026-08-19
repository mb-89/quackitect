---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-conditions-are-taken-from-the-log-rather-than-stated-separately
type: "[[option]]"
found_by: without
statement: "Everything a result needs to be reproducible is read from the record the system already keeps, so nothing has to be gathered and written a second time."
source: "TRIMMING \u2014 asked whether stating the conditions can be absorbed into deriving the cost, since both end up on the same report"
---

## What goes

One of the two functions, and the seam between them.

## What makes it plausible

The call log already stamps se_version on every record. The matrix hash is a
file the engine can read at any moment. Neither has to be collected by a
separate act.

## What breaks, and it is why this may not survive

The model, the reasoning effort and the harness are NOT in the call log. They
are properties of the session rather than of a call, and nothing today writes
them down. Absorbing the function does not remove that work; it hides it.

## Mechanism

One derivation over the log plus whatever the environment can be asked
directly, with a refusal where a condition cannot be obtained rather than a
blank.
