---
id: req-overweight-hop-stops
type: "[[requirement]]"
statement: "If the next hop's weight exceeds the autonomy setting, then the engine shall stop the walk before entering that hop."
kind: functional
verify_method: test
breaks_if_removed: "The agent walks into steps the person kept for themselves; the dial is decoration."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 4
priority: must
---

## Detail

## Detail

| situation | outcome |
| --- | --- |
| hop weighs under the setting | walked |
| first hop over the setting | the walk stops before entering it |
| the stop itself | an instruction naming the wait, never an error |
