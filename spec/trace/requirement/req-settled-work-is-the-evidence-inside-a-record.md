---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-settled-work-is-the-evidence-inside-a-record
type: "[[requirement]]"
statement: "While a state belongs to a record, the system shall take that state's settled pieces of work as its evidence, and shall demand no second document restating them."
kind: functional
verify_method: inspection
breaks_if_removed: "Every result is written twice, and the two copies diverge the first time one is corrected and the other is not."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-take-a-step
source_refs:
  - "kickoff goal: inside a record a done token IS the evidence, and there is no second act of writing it"
  - "uc-work-a-states-work-tokens-to-completion steps 7 and 9"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THE HAND WRITES ITS RESULT INTO THE WORK ITSELF. There is no copying step
afterwards, and no form waiting to be filled from what the work already
says.

THIS IS THE DRY RULE APPLIED TO EVIDENCE. A stored copy never beats a
derived one, and here there is no copy to beat.

THE ONE SENTENCE THE VISION KEEPS: every piece of work is a token, and
inside a record a finished token IS the evidence.
