---
minted_in: i51
id: req-a-leaving-check-does-not-hold-the-call
type: "[[requirement]]"
statement: When a walk attempt starts a state's leaving check, the product shall answer that attempt without waiting for the check to finish.
kind: functional
verify_method: test
measure: "the answering call returns in under 1 second, on every leaving check, whatever the check's own duration"
breaks_if_removed: "The walker's only verb is held for the check's whole duration, and where that outlives the caller's own limit the caller is told the work failed while it was still moving."
breaks_how_badly: crippling
priority: must
refines:
  - uc-leave-a-state-whose-check-is-still-running
source_refs:
  - sty-the-step-that-hands-the-walk-back
  - stk-agent
  - nbr-agent-harness
  - vp-rigor-without-toil
  - raid-risk-a-hop-that-finishes-later-makes-green-ambiguous
---

## Detail

THE BOUND IS NOT OURS TO SET, which is why the measure is absolute rather than
a share. The caller's limit is decided outside this product and cannot be read
from inside it, so no percentage of calls may exceed it.

WHAT COUNTS AS ANSWERING. Saying that the check has started, and naming how to
learn its outcome. An answer that says nothing actionable satisfies the clock
and fails the demand.

THE CHECK'S OWN DURATION IS UNBOUNDED BY THIS ROW. It may run for as long as it
needs. What may not happen is the walk attempt waiting on it.

MEASURED TODAY AT SIXTY-EIGHT SECONDS on one leaving check, with two calls
expiring at the caller's boundary and one of those having already landed.

## Behaviour

A state model, one line per transition. It earns its place because this row
introduces a state that did not exist, and prose about a condition and a
response cannot say what exists before the first trigger fires.

    (nothing)  -> clear:    a state is entered with no check owed
    clear      -> running:  a walk attempt starts the leaving check
    running    -> running:  a second attempt joins rather than starting another
    running    -> passed:   the check ends with success
    running    -> failed:   the check ends with a failure it reported
    running    -> killed:   the check is stopped for running past its bound
    passed     -> clear:    the walk leaves the state
    failed     -> running:  a later attempt runs the check again
    killed     -> running:  a later attempt runs the check again
    passed     -> running:  the ground the verdict rested on moved

THE FIRST LINE IS THE ONE THAT PAYS. Nothing creates a pending verdict today,
because no verdict outlives its call. Naming the transition is what makes
`req-a-pending-verdict-is-recorded-against-its-state` necessary rather than
optional.

THE LAST LINE IS THE UNANSWERED ONE. How the ground moving is detected is not
settled, and it is carried as the design's question rather than asserted here.
