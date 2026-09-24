---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-drawing-draws-a-route
depends_on: [the-ticket-answers-the-editor]
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A press on a node, and an edit to the route, leave the page as a message the host runs. A person then jumps to a step's chapter, and edits the steps ahead, from the drawing alone. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]].

<!-- breaks, as text: what breaks if it is never done -->
The drawing reads and does nothing, and a person edits the YAML by hand to move a step.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a press on a node posts `jump` with the chapter and the line the engine's node places carry
- a press on the pointer posts `take` or `handback`
- an edit to a step ahead of the pointer posts `edit`, carrying the route `ticket route` takes
- the page refuses an edit to a step behind the pointer
- the browser test drives each message through the fake host, and `./RUNME.sh check` runs it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
