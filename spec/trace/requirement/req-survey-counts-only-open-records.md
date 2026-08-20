---
minted_in: i12
id: req-survey-counts-only-open-records
type: "[[requirement]]"
statement: When the survey lists what stands open, it shall exclude every record whose status is shipped.
kind: functional
verify_method: test
breaks_if_removed: The desk advises from an inflated count, so a day that has nothing left open reads as a day with work outstanding.
breaks_how_badly: abrasive
refines:
  - uc-get-work-routed
source_refs:
  - i12
priority: should
weighs_against:
  - req-bm25-below-threshold-returns-empty > — a wrong survey count misroutes planning; a weak match returned instead of nothing costs one disposition
---

## Detail

The survey is the one call that answers "what stands open", and both the
front desk and the retro open with it.

Observed on 2026-08-15. `se_survey` answered `counts.iterations: 28` and
listed `i27` among them. That
record reads `status: shipped`, closed 2026-08-14T19:54:00.895Z.

WHAT IT COSTS IS ADVICE RATHER THAN DATA. The desk's method says to sweep
the live machinery and never answer from memory. A shipped record in the
open list makes the sweep itself wrong, and the advice built on it
inherits the error without any sign.

## What counts as open

A record is open while it can still be walked. `shipped` and `closed`
records cannot.

The archive doors exist for exactly those, so a shipped record is not
hidden by this row. It is listed where it belongs.
