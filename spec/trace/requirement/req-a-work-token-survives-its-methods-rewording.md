---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-work-token-survives-its-methods-rewording
type: "[[requirement]]"
statement: When a state is entered again after its method card was edited, the system shall match each standing piece of work to its step by that step's own identity, creating no duplicate and orphaning none.
kind: functional
verify_method: test
breaks_if_removed: Rewording a heading orphans the work already done under it and mints a fresh copy, so editing a method card silently reopens finished work.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - uc-work-a-states-work-tokens-to-completion extension 3a
  - raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

IDENTITY, NEVER WORDING. A step carries an identity of its own, and the
match is made on that. The heading's text is a label the identity survives.

TWO ORDINARY EVENTS PRODUCE THE FAILURE, and neither needs a coincidence: a
card is improved between two entries, and a walk re-enters a state it has
already worked.

THIS IS WHY THE ROW IS SEPARATE FROM MINTING. Minting says what a first
entry produces. This says what a second entry must not produce.
