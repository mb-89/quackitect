---
id: ifu0004-review
type: manifest
mode: deck
kind: ifu
statement: review - notes, readout, report, retro.
review-82079:
  completeness: each review lane has its own step slide, and the coverage slide links every use case this journey exercises
  correctness: the lane names and their command forms match AGENTS.md; the retro's log step is stated as recorded
  conciseness: one lane per slide; the review method itself stays in the review prompt
  comprehensibility: the arc runs from unexplained work to a record that answers questions on its own
  minimalism: the base state is referenced from the setup IFU; no lane is described twice
  accessibility: rides the book shell's slide roles and labels; the timeline figure carries its aria label
  target-group-fit: written for the owner who returns to work they did not watch and needs it explained
---
<!-- ai:3 -->
# Work you did not watch still needs explaining
<!-- ai:3 -->
A week later, nobody remembers why a check went red or where an idea went. The review lanes make the record answer those questions instead of your memory.
---
<!-- ai:3 -->
# Starting state
<!-- ai:3 -->
The idle state from [the setup IFU](ifu0001-setup), with some walked work on the board.
---
<!-- ai:3 -->
# Capture with note
<!-- ai:3 -->
`/note` captures an idea the moment it appears, frictionless, into the inbox. Triage sorts it later. Nothing gets lost because capture cost nothing.
---
<!-- ai:3 -->
# Ask the board with readout
<!-- ai:3 -->
`/review readout` answers "where am I": the progress bar, the suspects, the next move. It is pure display, safe at any time.
---
<!-- ai:3 -->
# Render the record with report
<!-- ai:3 -->
`/review report` renders the live HTML board, and the book renders the whole trace as a document. Both are snapshots: the reader re-renders when they want it current.
|||
fig: project-timeline
---
<!-- ai:3 -->
# Learn with retro
<!-- ai:3 -->
The retro turns wasted effort into method changes: field feedback in, baked rules out. A lesson that stays in one person's head is a lesson half-learned.
---
<!-- ai:3 -->
# The record explains itself
<!-- ai:3 -->
Notes hold the loose ends, the readout answers the present, the report and the book answer the past, the retro changes the future. That is the whole review story.
---
<!-- ai:3 -->
# Covered use cases
<!-- ai:3 -->
The review journey exercises:
[uc-evidence-authoring](uc-evidence-authoring), [uc-note-capture](uc-note-capture), [uc-review-readout](uc-review-readout), [uc-review-report](uc-review-report), [uc-review-retro](uc-review-retro).
Note: The coverage slide is the machine-readable reference home. Story slides stay clean.
