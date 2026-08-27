---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-work-only-a-person-can-settle-says-so-on-its-face
type: "[[requirement]]"
statement: "The system shall mark on its own face every piece of work that only a person can settle, and shall refuse an agent that tries to settle it."
kind: functional
verify_method: test
breaks_if_removed: "Whether to stop becomes the agent's judgment about the moment rather than a fact about the work, and an agent judging its own stopping point is the failure the sanctioned-stop list exists to patch."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-walk-a-record-on-a-smaller-model
source_refs:
  - "uc-work-a-states-work-tokens-to-completion extension 6b"
  - "the vision packet: nobody consulted a list of acceptable reasons to stop, because the reason is a fact about the work"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THE MARK IS ON THE WORK, NOT IN A RULE. A hand reaching it stops because
this piece says so, and consults no list of acceptable reasons.

THE WALK CONTINUES WHEN THE PERSON HAS ANSWERED. The stop is a property of
one piece of work rather than of the turn, so nothing else in the state is
blocked by it unless a dependency says it is.

WHAT THIS REPLACES. Today the agent decides whether a stop is sanctioned,
and the engine cannot see the decision because it happens in chat.
