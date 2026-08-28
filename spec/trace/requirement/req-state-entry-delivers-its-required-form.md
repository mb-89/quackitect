---
minted_in: i61-everything-served-to-an-agent-gets-short
id: req-state-entry-delivers-its-required-form
type: "[[requirement]]"
statement: When a pull enters a state with an unfilled required evidence form, the engine shall return that form in the same pull response.
kind: functional
verify_method: test
breaks_if_removed: The walker receives an entered state without its required work surface, spends a second pull to discover the form, and can mistake the empty response for completion.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-be-handed-the-method
source_refs:
  - none
---

## Detail

The first response after state entry contains the state form when that form is
required and incomplete. A state with no required incomplete form keeps its
existing response shape.

## Behaviour

NO MODEL WANTED HERE. This is one entry condition and one response payload.
