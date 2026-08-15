---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: fn-run-a-governed-walk.show-where-it-stands
type: "[[function]]"
cluster: the-account
statement: put the whole standing position in front of a person, without them asking anybody
satisfies:
  - req-surface-answers-in-one-second
  - req-survey-counts-only-open-records
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
  - req-a-surface-resolves-to-what-it-shows
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

## One row arrived at i12, from i27's landing

req-a-surface-resolves-to-what-it-shows was minted in i27 and allocated to
el-core, el-resolution-seam and if-satellite-supervisor-to-mirror. No function
carried it, so the demand had a design and no owner in the structure.

IT BELONGS HERE, and the reason is the requirement's own Detail. The agent's
side was specified and the person's was not: the lane already had
[[req-a-read-comes-from-where-it-is-meant]] and
[[req-a-write-lands-where-it-is-meant]]. Those two govern the lane's calls,
which is [[fn-run-a-governed-walk.resolve-a-path]]. The surfaces a person
actually uses are this function, and nothing said the same about them.

BOTH HALVES ARE ALREADY WHAT THIS FUNCTION DOES. Resolving against the record
being shown is putting the STANDING position in front of a person — a panel
answering from another record's content is not showing where it stands.
Naming the record on what it shows is the same argument the rationale above
makes about drawing only what serves: a surface that resolves correctly and
says nothing is indistinguishable from one that resolves wrongly.

IT IS NOT [[fn-run-a-governed-walk.resolve-a-path]]. That function resolves a
path for a caller and proves it by read-back. This one is answerable for what
a person SEES, which fails differently — a correct resolution drawn under the
wrong record's name is still a person reading the wrong thing.
