---
id: fn-run-a-governed-walk.show-where-it-stands
type: "[[function]]"
cluster: the-account
statement: put the whole standing position in front of a person, without them asking anybody
satisfies:
  - req-panel-shows-the-machine
  - req-selected-node-shows-its-claim
  - req-filter-draws-only-what-serves
  - req-boot-stands-agentless
  - req-engine-port-fallback
  - req-mirror-stays-on-the-machine
  - req-reader-keeps-their-place
  - req-every-update-reaches-the-render
  - req-colors-are-configuration
  - req-decision-graph-reads-as-branches
  - req-one-verb-says-why-a-state-is-grey
  - req-a-reopen-stands-where-it-can-work
  - req-controls-draw-from-their-spec
inputs:
  - flow-position
  - flow-trace-graph
  - flow-filter
  - flow-evidence-form
  - flow-recommendation
  - flow-note-inbox
  - flow-archive-listing
  - flow-reference-corpus
  - flow-call-log
outputs:
  - flow-surface
controls:
  - the filter, which decides what is drawn
  - the free port, where the preferred one is taken
source_refs:
  - uc-resume-after-an-absence
  - uc-trace-a-decision-to-its-origin
---

## Rationale

SHOWING IS NOT RECORDING. The record function derives the trace; this one
puts it on a surface a person can act through, and the two fail in different
ways. A correct record drawn badly is still unusable.

It stands with no agent, which is the sharpest thing about it. The panel is
the person's hand on the same walk, so every control has to work when nobody
is driving.

It draws only what serves the filter. An empty level drawn anyway is noise
that reads as an answer.

AND IT SHOWS THE RECORD TO ONE MACHINE. This function serves the whole record
— the log, the forms, the decisions — over a socket, with no authentication
anywhere. That is safe only while the socket cannot be reached from off the
machine, so the loopback bind is part of what this function does rather than
a deployment detail somebody else owns.
