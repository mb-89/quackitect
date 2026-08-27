---
minted_in: i1
id: fn-run-a-governed-walk.show-where-it-stands
type: "[[function]]"
cluster: the-account
statement: put the whole standing position in front of a person, without them asking anybody
satisfies:
  - req-a-states-outstanding-count-is-read-at-a-glance
  - req-a-hand-may-break-work-into-parts-and-the-parts-are-visible
  - req-the-panel-s-paint-says-which-kind-of-green-it-is
  - req-the-actor-is-recorded-where-the-call-is-served
  - req-surface-answers-in-one-second
  - req-a-slow-answer-does-not-freeze-the-surface-beside-it
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
  - req-a-refused-act-says-why-and-what-next
  - req-a-surface-shows-the-state-an-act-produced
  - req-a-control-that-undoes-on-a-second-press-says-so-first
  - req-work-past-its-bound-says-it-is-working
  - req-a-slowness-signal-never-shortens-the-wait
inputs:
  - flow-owed-count
  - flow-view-model
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

## Addition — work tokens

THE COUNT ARRIVES DERIVED AND THIS FUNCTION DRAWS IT. Producing the figure is
[[fn-run-a-governed-walk.count-what-is-owed]]; putting it where a person
reads it without opening the position is this one.

LEGIBILITY IS A DRAWING PROPERTY, so it sits here. A count nobody scans is a
count nobody reads, and a surface laid out against the wrong magnitude has to
be redrawn after everything else is settled.

THE POPULATION IS NOT MEASURED YET. One script over an archived record
answers it, and the register carries that as an open assumption with its
probe.

## Addition — the parts of a piece of work are drawn under it

A HAND MAY BREAK ONE PIECE OF WORK INTO PARTS, and this function is where a
person SEES them. Making the parts is
[[fn-run-a-governed-walk.mint-what-a-state-owes]]; drawing them under the work
they came from is this one.

THE DEMAND IS HIERARCHY, not a list. A part shown beside its parent says
nothing about which job it belongs to, and the whole purchase is that a person
reads how the hand broke the job down without asking it.

IT FAILS DIFFERENTLY FROM MAKING THEM. Parts created correctly and drawn flat
leave the reader with more rows and no more understanding, which is worse than
the single row they replaced.

THE COUNT IS THE SEAM TO WATCH. Whatever the design rules about a parent while
its parts are open, what this function draws as outstanding may not count one
piece of work as several, or several as one, without saying which it did.
