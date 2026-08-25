---
minted_in: i61-everything-served-to-an-agent-gets-short
id: req-session-serves-only-applicable-guidance
type: "[[requirement]]"
statement: When the engine assembles guidance for an attended session, it shall deliver zero documents whose applicability is limited to unattended or cloud sessions.
kind: functional
verify_method: test
breaks_if_removed: An attended session receives cloud-only instructions, which directs it to create an unwanted field report and obscures the work that actually applies.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-be-handed-the-method
source_refs:
  - none
---

## Detail

Applicability is evaluated from the current session mode before the engine
returns guidance. The same document remains available when its stated session
mode applies.

## Behaviour

NO MODEL WANTED HERE. This is one session condition and one delivery response.
