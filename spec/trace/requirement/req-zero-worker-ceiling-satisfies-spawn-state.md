---
minted_in: i61-everything-served-to-an-agent-gets-short
id: req-zero-worker-ceiling-satisfies-spawn-state
type: "[[requirement]]"
statement: When a signed iteration kickoff sets the worker ceiling to 0 workers, the engine shall accept an empty worker checklist at every spawn state in that iteration.
kind: functional
verify_method: test
breaks_if_removed: A walkthrough approved without workers cannot advance because each spawn state demands a worker that the kickoff prohibited.
breaks_how_badly: crippling
priority: must
refines:
  - uc-open-an-iteration
source_refs:
  - none
---

## Detail

The signed kickoff is the source of the ceiling. A zero ceiling produces zero
required worker rows. A nonzero ceiling retains the existing worker checklist.

## Behaviour

NO MODEL WANTED HERE. This is one persisted ceiling and one form response.
