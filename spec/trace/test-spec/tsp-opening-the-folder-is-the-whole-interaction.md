---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-opening-the-folder-is-the-whole-interaction
type: "[[test-spec]]"
statement: Opening the editor on a project brings up the lane, the panel and the desk, with the person typing no command.
method: demonstration
demonstrates:
  - sty-ramp-up
verifies:
  - req-the-editor-is-the-only-entry-point
files:
  - none — the Procedure below is the whole definition; what is observed is a window filling in, and instrumenting it would replace the observation with a proxy for it
---

## Scope

EVERY START AFTER THE FIRST. The launcher runs once on a machine; this is what
happens every time afterwards.

FOUR ACTS AND THE PERSON PERFORMS NONE. The extension activates on the folder,
the engine starts, the panel draws, the agent boots and waits at the desk.

OUT OF SCOPE: the launcher itself. That fires once, installs things belonging to
the computer, and fails differently — leaving a person with no product rather
than with a product they must start by hand.

ALSO OUT: how long it takes. The clock is a separate row with a separate
measure, verified by test rather than by watching.

## Approach

WHY DEMONSTRATION RATHER THAN TEST. The claim is that a person does nothing.
An instrumented harness can prove the parts came up; it cannot show that
nothing was required of anybody, because a harness supplies whatever the person
would have supplied.

THE OBSERVATION IS THE ARTIFACT. Somebody opens a folder and watches. That is
the whole method, and it is why the files list says none.

LEVEL: acceptance. Nothing below the whole product can answer this.

DEPTH: graded abrasive, priority must. One run, on a machine where the product
is already installed, plus the close-and-reopen transition that makes the
launcher a one-time act.

## Procedure

Each step names what is DONE and what is WATCHED FOR as the pass.

- OPEN THE EDITOR ON A PROJECT FOLDER. Nothing is typed. PASS: the window
  opens and no command was issued.
- WATCH THE FOLDER BE RECOGNISED. PASS: the person never names the folder as a
  project. It is recognised or it is not.
- WATCH THE LANE ANSWER. PASS: the lane responds without anything being
  started by hand.
- WATCH THE PANEL DRAW. PASS: the machine stands on it, with the dials above
  the drawing.
- WATCH THE AGENT REACH THE DESK. PASS: it holds what it owes and waits.
- CLOSE THE WINDOW AND OPEN IT AGAIN. PASS: the same sequence runs, and the
  launcher is not run a second time. This is the transition that pays, and it
  is the difference between a one-time act and a recurring one.

## What may interrupt without failing

AN UPDATE THAT CANNOT REACH A RUNNING WINDOW ASKS FOR A RESTART. That is the
owner's accepted answer of 2026-08-19, and live reload is a non-goal.

A MESSAGE IS NOT A FAILURE OF THIS ROW. The row demands that nothing be
REQUIRED of the person to get working. A restart offered with its reason named
leaves that intact, so the observer records it and passes the step.

## What makes this observation honest

THE OBSERVER IS NOT THE BUILDER, where that can be arranged. Somebody who knows
which command would have fixed a stall will reach for it without noticing, and
the thing being watched is precisely whether anybody had to.

WHAT WAS DONE IS RECORDED, not only whether it passed. A demonstration whose
record says pass and nothing else cannot be re-read later by anybody deciding
whether it still holds.
