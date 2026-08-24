---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-every-wait-declares-a-bound-and-expiry-acts
type: "[[requirement]]"
statement: When the product begins waiting for anything whose end it does not control, it shall record the bound it will wait to, and on reaching that bound it shall produce an outcome naming the bound rather than continuing to wait.
kind: functional
verify_method: test
measure: "wait sites in the product declaring no bound: zero. Waits that pass their bound without producing an outcome: zero."
breaks_if_removed: "A wait with no bound is indistinguishable from a hang, and on a machine nobody watches there is no one to tell them apart, so the run is spent either way."
breaks_how_badly: crippling
priority: must
refines:
  - uc-bound-every-wait-and-act-on-expiry
source_refs:
  - raid-iss-a-finished-run-keeps-reporting-itself-as-running
  - raid-risk-one-blanket-bound-is-given-to-work-nobody-measured
  - vp-autonomy-range
---

## Detail

AN OUTCOME REACHED BY EXPIRY IS DISTINGUISHABLE FROM ONE THE WORK REPORTED.
That is part of this demand and not a separate row, because the two fail
together under one method: an expiry that produces an unlabelled outcome is a
wait that did nothing useful.

| the bound passes and | the outcome says |
| --- | --- |
| nothing finished | it ended on the bound, and names the bound |
| the work finished in the same moment | the work's own outcome, because only it knows how the work turned out |
| the bound was a default rather than a measurement | the bound, and that it was a default |

A WAIT SITE THAT DECLARES NO BOUND IS REFUSED rather than entered. Waiting for
ever on an omission is the failure this row exists to stop, and refusing at the
write is cheaper than discovering it on an unattended box.

CHOOSING THE BOUND WELL IS NOT THIS ROW. This row demands that a bound exists
and that expiry acts. How long each bound should be is a measurement, set where
the work is understood.

EVERY BOUND IN THE PRODUCT IS STILL THE DEFAULT, and that is registered as an
open risk rather than left implied —
raid-risk-one-blanket-bound-is-given-to-work-nobody-measured.

AN EXPIRY IS NOT A VERDICT, so the second row of the table is not a race the
bound can win. The bound ends the ACCOUNT'S wait; a real ending arriving
afterwards replaces its outcome and the entry is put back in front of a reader.
Without that, an expiry would spend the single answer a finished entry rides
and the work's own outcome would reach nobody.

NO BEHAVIOUR MODEL HERE. The row is one condition and one response, and the
table carries the branches.
