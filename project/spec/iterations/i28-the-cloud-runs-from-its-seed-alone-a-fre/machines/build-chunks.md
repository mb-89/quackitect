---
steps:
  - id: chunk-pin-the-runtime
    statement: "Correct the engines declaration and pin the exact version the engine needs, so a wrong runtime fails at the first step by name."
    depends_on: []
    realization: software
  - id: chunk-release-the-caller
    statement: "Start the lane so the launching command returns, using the platform's own detach, with a test that asserts the caller returned before the child ended."
    depends_on: []
    realization: software
  - id: chunk-the-seven-steps
    statement: "Assemble se-start.ts: verify, install, start, wait, fetch, adopt, launch, each exiting non-zero naming itself."
    depends_on:
      - chunk-pin-the-runtime
      - chunk-release-the-caller
    realization: software
---

# build-chunks — i28

Three chunks. Two run in parallel and the third joins them.

## Which lenses shaped the order

RISK FIRST, and it is the only lens that applies.

THE PIN GOES FIRST BECAUSE THE SCRIPT READS IT. The verify step compares the
running version against `engines.node` rather than against a copy, so the
declaration has to be right before the reader exists.

SPINE FIRST WOULD HAVE COST MORE HERE. It would assemble seven steps and
discover at integration what two measurements already showed.

PARALLEL FLOW DOES NOT APPLY. This is one deep chain, and the card says
forcing width onto a chain only adds seams. It was drawn with three chunks
first, and that drawing is corrected below rather than left standing.

## What flows across the edge

THE CHECK THE CARD ASKS FOR, in one line.

| edge | what flows |
| --- | --- |
| pin the runtime → the seven steps | the version string in `engines.node`, which the verify step reads |

THE EDGE IS NOT EMPTY, so it is not dropped.

## The detach and the script are one file, and the drawing splits them anyway

THE START STEP'S DETACH IS THREE LINES OF `se-start.ts`, and its test sits in
the same file as the entrypoint's other two tests. So the two chunks touch one
artifact between them.

THE SPLIT STILL EARNS ITS PLACE, for one reason: the detach is the only piece
with a MEASURED failure behind it, and drawing it separately is what makes its
evidence its own claim rather than a paragraph inside a larger one.

WHAT IT COST was one deadlock. The join waited on a leg whose work already sat
inside the other leg's file, and the route to that leg ran through the join it
was blocking. Recorded here rather than smoothed over.

## Why the seven steps are one chunk and not seven

FIVE OF THE SEVEN ARE ALREADY UNDERSTOOD. Install, wait, fetch, adopt and
launch each have a known mechanism and no measured doubt.

SPLITTING THEM WOULD DRAW SEAMS WHERE THERE ARE NONE.

## What this build does NOT do

IT DOES NOT DECIDE HOW THE RUNTIME ARRIVES. A declared image would delete
verify and install, and that candidate was not adopted. The chunk pins a
version rather than choosing a delivery mechanism.
