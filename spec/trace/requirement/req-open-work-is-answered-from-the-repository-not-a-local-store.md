---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-open-work-is-answered-from-the-repository-not-a-local-store
type: "[[requirement]]"
statement: When anything asks what work stands open, the system shall answer from the repository, and shall not include captures that live only in a machine-local store.
kind: functional
verify_method: test
breaks_if_removed: The pool is minted and never read, which is the kill criterion this iteration named for itself at gate-motivation. Two clones then disagree about what the project is holding and neither is wrong — measured 2026-08-18, where this clone reported 0 parked options and the owner machine holds 205.
breaks_how_badly: crippling
refines:
  - uc-see-the-whole-pool-from-any-clone
source_refs:
  - vp-the-ledger
  - sty-see-what-the-other-machine-may-pull-from
priority: must
---

## Detail

| what the answer includes | binding |
| --- | --- |
| standing options from the pool | every one, with its statement and its re-entry condition |
| open records | as today, unchanged |
| undrained local captures | NEVER — an undrained note has not been judged, and this answer is a list of options rather than of everything anybody typed |

THE THIRD LINE IS THE ONE THAT IS EASY TO GET WRONG BY BEING HELPFUL. The
pending count stays a separate signal and stays useful; what it must not do is
leak into the list of options.

## Pass line

Metric: sources consulted for open work that are not the repository. Target:
zero. Measured on a clone that has trunk and an empty local store, which is
exactly the condition this row exists for.
