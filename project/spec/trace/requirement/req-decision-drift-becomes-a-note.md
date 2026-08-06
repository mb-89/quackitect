---
id: req-decision-drift-becomes-a-note
type: "[[requirement]]"
statement: "Where a finding needs a person's decision, the overhaul shall record it as a note and leave the finding's artifact unchanged."
kind: functional
verify_method: test
breaks_if_removed: "The sweep guesses rulings; a guessed decision hardens into method."
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up step 4
  - ".se/req-mine-sebots.md: capture, decisions, change"
priority: should
---
