---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-engineer-to-mirror
type: "[[interface]]"
statement: Everything a person sees of the machine, and every act they take on it, crosses here.
source: nbr-engineer
destination: el-mirror
carries:
  - flow-surface
  - flow-choice
  - flow-position
  - flow-note-inbox
  - flow-call-log
form: HTTP, rendered HTML
bound: 1 second
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
  - "i33 draft-vision goal_system, third ruling: honesty wins over quiet"
---

THE ONLY EDGE WHERE A PERSON TOUCHES THE PRODUCT DIRECTLY. Everything else
they know about the machine, they know because this drew it.

## What crosses

- the rendered surface: the machine, the panel, the log, the trace
- an act on a control — a dial moved, a checkbox ticked, a target aimed
- the standing position the panel draws from

## Not reachable from inside the cage, 2026-08-17

THIS CROSSING CANNOT BE TIMED BY THE AGENT. Calling the running mirror over
HTTP from a lane command deadlocks the server's event loop, which is a
standing rule rather than a discovery. So the render time recorded below came
from the engine's own phase instrumentation, not from exercising the edge.

WHAT THAT COSTS. A person can time this edge by opening the panel and
watching. An agent cannot, so this boundary's honesty depends on the
instrumentation staying truthful rather than on a check anybody runs.

## The bound, and both halves of it

ONE SECOND ON THE LOOK. A render measured at 113.1 ms and 114.3 ms on two
consecutive draws, of which the drawing sets held 79 to 82 percent — so this
edge is inside its bound today for the ordinary draw.

THE ACT IS THE HALF THAT FAILS, and it fails silently. A control that declines
looks identical to a control nobody pressed. Three sightings are on record: the
stop-at notch, the emergency rung, and the shutdown row. None failed a check,
because nothing checked.

SO THE BOUND HERE IS NOT ONLY TIME. An act that lands must show the state it
produced, and an act that is refused must say why and what would make it
possible. That is req-a-refused-act-says-why-and-what-next and
req-a-surface-shows-the-state-an-act-produced, and this is the edge they bind.

## Why the person is a neighbour and not an actor here

THE ELEMENT MATRIX DRAWS TRAFFIC, not intent. As a stakeholder the engineer
appears all over the trace; as a NEIGHBOUR they appear exactly here and at
nbr-vscode, because those are the two places bytes actually cross.
