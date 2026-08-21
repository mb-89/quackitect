---
minted_in: i51
id: raid-ar-a-machine-decision-repeats
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-a-machine-decision-repeats at risk — the response hinges on el-walk-engine, where a step's standing becomes time-dependent.
owner: the adjudicator
trigger: two reads of the same step's standing returning different words with nobody having acted between them
status: open
impact: While a leaving judgment is running, the same step answers deciding and then passed. Two machines given the same record can disagree on where a walk stands.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-a-machine-decision-repeats
  - el-walk-engine
  - raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three
---

Walked at evaluate-architecture by agent. The requirement is a must, graded
crippling, and it already carries `fitness_candidate: true`.

## What the requirement actually guards

ITS GUARD IS "WHILE THE INPUTS A DECISION READS ARE UNCHANGED". A judgment
landing is an input changing, so the letter of the requirement is not broken.

WHAT IS BROKEN IS WHAT IT WAS WRITTEN FOR. Its own `breaks_if_removed` says two
machines given the same record must not reach different answers with nothing to
say why. During the window, they can — and the record alone does not say the
window is open.

## The window is the whole risk

BEFORE i51 A STEP'S STANDING WAS A PURE FUNCTION OF THE TREE. Read it twice,
get the same word.

NOW THERE IS A THIRD WORD THAT DEPENDS ON WALL-CLOCK TIME. Nothing an actor did
changes it. It changes because a process finished.

WHAT KEEPS THIS FROM BEING WORSE. The third word is in a closed set of three
([[raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three]]), so a
reader can tell the window is open rather than guessing. A design that returned
`passed` optimistically would break the requirement outright.

## What would close it

A REPLAY THAT WAITS FOR THE WINDOW instead of reading through it, or a recorded
timestamp saying when the judgment started, so a reader can tell a live window
from a stale one.

NEITHER IS DECIDED HERE. Evaluation names the hinge; the choice is M7's.
