---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-an-unmatched-rung-names-itself-and-publishes-no-driver
type: "[[requirement]]"
statement: Where the model list carries no entry for a rung, the milestone shall publish no driver, naming the unmatched rung and never falling back to whatever model is currently running.
kind: functional
verify_method: test
breaks_if_removed: A silent fallback is indistinguishable from a working lookup, so a list that has quietly stopped covering the ladder keeps producing confident answers that mean nothing.
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - uc-let-the-machine-name-the-driver ext 4a
  - raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
priority: must
---

## Detail

THIS IS A REFUSAL IN WAITING and it should be typed like one: the clause names
the rung, what the list holds, and the edit that fixes it.

WHY IT MATTERS MORE HERE THAN ELSEWHERE. Every other consumer of a missing
lookup gets an error. This one would get a MODEL — the one already running —
and the walk would proceed looking exactly as it does when the lookup worked.

THE SCHEDULERS LEARNED THIS AND IT IS WHY THEY FAIL LOUD. A CI job naming a
runner label nothing matches hangs and is cancelled rather than quietly
running somewhere else.
