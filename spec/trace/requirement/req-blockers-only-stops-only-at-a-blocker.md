---
minted_in: i61-everything-served-to-an-agent-gets-short
id: req-blockers-only-stops-only-at-a-blocker
type: "[[requirement]]"
statement: While the stop-at setting is blockers only and a runnable next step is within the session autonomy, the engine shall continue the walk without returning a wait instruction.
kind: functional
verify_method: test
breaks_if_removed: A walk configured to continue until blocked pauses despite legal work, forcing the owner to resume a process that the selected stop setting delegated.
breaks_how_badly: crippling
priority: must
refines:
  - uc-set-the-autonomy
source_refs:
  - none
---

## Detail

A blocker is an unmet condition, a gate requiring an owner decision, or a step
above session autonomy. A runnable next step is not a blocker.

## Behaviour

NO MODEL WANTED HERE. This is one stop setting and one continuation rule.
