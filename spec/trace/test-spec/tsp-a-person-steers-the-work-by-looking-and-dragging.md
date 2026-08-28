---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-a-person-steers-the-work-by-looking-and-dragging
type: "[[test-spec]]"
statement: A person reads what a state owes without opening it, finds and groups outstanding work, and drags a row onto a state with the destinations revealing themselves mid-drag.
method: demonstration
demonstrates:
  - sty-steer-a-running-iteration-by-moving-work
verifies:
  - req-a-state-shows-what-it-owes-without-being-opened
  - req-a-states-outstanding-count-is-read-at-a-glance
  - req-outstanding-work-is-listed-narrowed-and-grouped-in-one-place
  - req-a-destination-holding-nothing-is-revealed-while-work-is-placed
  - req-the-work-editor-needs-no-new-instruction
files:
  - none — a demonstration is watched, and the procedure below is the whole definition
---

## Scope

WHAT IT COVERS: what a person can see and do. Five rows that no test can answer,
because each is about whether a human being succeeds unaided.

WHY DEMONSTRATION RATHER THAN TEST. Every one of these turns on a person's
experience: read at a glance, needs no instruction, revealed while dragging. A
test can assert a number is rendered; it cannot assert anybody read it.

WHAT IS OUT: the accounting behind the counts, which is tested, and whether the
drag is technically possible, which the prototype phase settled.

## Procedure

Performed once, watched, with what is observed recorded per step.

- OPEN THE MACHINE AND LOOK, without opening any state. OBSERVED AS PASS: the
  watcher names how much a chosen state still owes, per slot, from the drawing
  alone.
- TIME THAT READING. OBSERVED AS PASS: within two seconds, over a real record's
  counts rather than an invented example. A count that takes longer fails the
  glance row whatever else is true.
- OPEN THE WORK LIST BESIDE IT. OBSERVED AS PASS: outstanding work is in ONE
  place, and the watcher narrows it and folds a group without being told how.
- HAND THE WATCHER THREE TASKS AND NO INSTRUCTION: narrow the list, fold a
  group, move a row. OBSERVED AS PASS: all three completed unaided, with every
  hesitation recorded rather than smoothed over.
- BEGIN A DRAG OF ONE ROW ONTO THE MACHINE. OBSERVED AS PASS: while the row is
  in the air, the states show which of their buckets will take it — INCLUDING
  buckets that were hidden a moment earlier because they held nothing.
- DROP IT ON A STATE. OBSERVED AS PASS: that state's count goes up by one, the
  origin's goes down, and the state cannot be left until the item is settled or
  moved on.
- ZOOM THE MACHINE RIGHT IN. OBSERVED AS PASS: the work list beside it is
  untouched. Two editors sharing one panel, not one view showing two things.

## Approach

ONE WATCHED ATTEMPT, and the hesitations are the data. The rows about
instruction and glance are population measures at heart, and one attempt is what
this record can honestly buy — that limit is stated rather than hidden.

THE HARDEST STEP IS THE REVEAL, because a hidden bucket appearing mid-drag is
the one affordance nothing in the tree has precedent for. It is placed late in
the procedure so a failure there does not stop the earlier steps being observed.

NO PERSONAL DATA IS RECORDED. The watcher is a role, and what is kept is what
happened rather than who it happened to.
