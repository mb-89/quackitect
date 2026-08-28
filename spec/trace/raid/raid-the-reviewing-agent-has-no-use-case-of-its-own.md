---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-the-reviewing-agent-has-no-use-case-of-its-own
type: "[[raid]]"
kind: issue
statement: The gate's reviewing-agent pass — spawned cold at the gate, reading the phase fresh, never weaker than the guide — has no standing use case of its own, though its stakeholder is mapped and the mechanism is live today.
owner: the owner
trigger: the next use-case sweep, or whenever stk-reviewing-agent's own pass is next touched by a round
status: open
impact: uc-adjudicate-a-gate documents the PERSON's bless. Nothing documents the reviewing agent's own scenario and extensions the way that use case is documented, so a reader auditing the gate mechanism has one hand's journey written down and not the other's.
breaks_how_badly: cosmetic
how_likely: expected
source_refs:
  - deliverable/machines/methods/meth-gate-review.md, "THREE HANDS READ A GATE, AND NONE OF THEM GRADES ITS OWN WORK"
  - spec/iterations/i4-the-panel-round-the-archived-iteration-b/evidence/map-stakeholders.md, stk-reviewing-agent
  - the unspecified-capability walk at iterations/i4/gate-inputs
place: i44-the-corpus-resolves-duplicate-headings-a
---

FOUND DURING THE UNSPECIFIED-CAPABILITY WALK at this gate, comparing the
panel's live doors and this state's live lane tools against the 57 standing
use cases.

`se_run` is legal in a gate state for exactly one reason: the gate registers
its own reviewer hand, spawned cold, with no shared context, never weaker than
the guide (owner ruling 2026-08-23). `stk-reviewing-agent` is a mapped,
kept stakeholder. Neither has a use case describing that hand's own scenario:
what it reads, what it is barred from assuming, what its rounds produce.

WHY THIS DOES NOT FAIL THIS GATE. The mechanism is process/routing — how a
gate gets judged — which draw-context's own boundary places outside this
round's box ("ALSO OUTSIDE: the engine's routing"). i4 is a rendering round;
it did not introduce the reviewer mechanism and does not own fixing this gap.

WHAT WOULD CLOSE IT. A use case with actor stk-reviewing-agent, refining a
story about being spawned cold at a gate and reading it fresh — the mirror of
uc-adjudicate-a-gate from the other hand.
