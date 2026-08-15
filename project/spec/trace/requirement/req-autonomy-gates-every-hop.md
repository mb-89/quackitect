---
minted_in: i1
id: req-autonomy-gates-every-hop
type: "[[requirement]]"
statement: When a pull is served, the engine shall weigh the next hop against the autonomy setting and shall stop before any hop that outweighs it, naming the waiting step.
kind: functional
verify_method: test
breaks_if_removed: The agent walks past the person's dial and the one control they hold means nothing.
breaks_how_badly: fatal
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 3
  - uc-set-the-autonomy step 4
  - uc-set-the-autonomy step 5
  - uc-set-the-autonomy ext 1a
  - ".se/req-mine-sebots.md: the person's dial and the manual path"
  - uc-set-the-autonomy ext 4a
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
priority: must
---

## Detail

One weighing, and every face it shows:

- When a pull is served, the engine shall weigh each candidate hop against the autonomy setting standing at that pull, one hop at a time.
- If the next hop's weight exceeds the autonomy setting, then the engine shall stop the walk before entering that hop.
- When the walk stops at a step above the autonomy setting, the engine shall name the waiting step and what resumes it in the same answer.
- Where the autonomy setting is zero, the engine shall enter zero steps on an agent's behalf.
- Where a step is marked above every autonomy setting, the engine shall accept that step's completion from a person's own hand alone.
