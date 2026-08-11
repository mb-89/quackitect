---
id: req-emergency-sits-above-full
type: "[[requirement]]"
statement: While emergency mode is armed, the engine shall hold every tool legal wherever the walk stands, arming only at the top rung, surviving the reload it was granted through, and disarming the moment the dial drops.
kind: functional
verify_method: test
breaks_if_removed: Full delegation either cannot cross the state gates at all, or crosses them without the dial ever having said so.
breaks_how_badly: crippling
refines:
  - uc-set-the-autonomy
source_refs:
  - reverse-engineered from tests/emergency.test.ts
priority: must
---

## Detail

- A fresh session is never in emergency; the resting packet says nothing about it.
- It arms only at the top rung, and refuses below it — it is past full delegation, never around it.
- It survives the reload it was granted through; lowering the dial revokes it for good.
- It can be turned off by hand without touching the rung.
