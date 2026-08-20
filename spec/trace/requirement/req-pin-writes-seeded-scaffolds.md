---
minted_in: i2
id: req-pin-writes-seeded-scaffolds
type: "[[requirement]]"
statement: When the kickoff bless pins the machine, the engine shall write every seeded sub-machine's placeholder drawing in the same act, so no route refuses over a not-yet-authored machine.
kind: functional
verify_method: test
breaks_if_removed: The panel surfaces an SE-C-112 route refusal for machines M4 has not authored yet, and somebody hand-copies placeholders - both happened on 2026-08-11.
breaks_how_badly: abrasive
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 6
priority: should
weighs_against:
  - req-audit-answers-from-log > — a route refusal stops the walk; a guessed retro count only misinforms it
---
