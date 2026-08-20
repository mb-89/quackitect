---
minted_in: i36
id: tsp-a-finding-outlives-the-box
type: "[[test-spec]]"
statement: A finding captured on an unattended machine is still readable by an engineer on a different clone after that machine is gone.
method: "demonstration"
demonstrates:
  - "sty-a-finding-outlives-the-box-that-found-it"
verifies: "none — demonstrates: carries the edge; the pool and mint requirements behind this story are verify_method: test and are carried by tsp-the-mint-crosses-the-boundary and tsp-one-door-into-the-pool"
files:
  - "none — a demonstration across two clones; what it observes is what survives outside any one working copy"
---

## Scope

The path from a note captured on a machine that will not exist tomorrow to an
answer a stranger reads on a clone that never held it.

WHAT IS DELIBERATELY OUT. Whether the finding was worth capturing. This is
about survival, not about judgment.

## Approach

DESIGN METHOD: end-to-end demonstration across two clones of one origin. The
story's own failure mode is that `.se/` is ignored by version control, so a
demonstration inside one working copy cannot show anything.

LEVEL: system. The mechanism spans the note store, the drain, the pool on
trunk and the desk's answer, and no component sees more than one of them.

DEPTH: high. The failure is silent and total — the box is released and the
finding is simply gone, with nothing left to notice.

## Procedure

- Capture findings on one clone and confirm the raw notes are untracked.
- Drain each to the pool with an authored statement and a re-entry condition.
- Confirm the authored statement is on trunk and the raw note is not.
- On a second clone that never held the notes, ask the desk what is offered.
- Confirm each finding appears with what it is and when it comes back.

## The deck is already evidenced

Every slide of this story carries a measured evidence half, including the
negative one: the i15 run of 2026-08-16 lost its debt note, and a search of
the whole call log for its reference returns nothing. That measurement is
what the story exists to answer.
