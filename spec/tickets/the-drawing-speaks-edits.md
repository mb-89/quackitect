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

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The page now posts what a person presses, and [[spec/design_output/drawing#the-page-takes-an-edit]] owns the messages and the edit.

| file | holds |
|---|---|
| `src/scripts/graph.js` | `reached` on each node `ticket route` holds as it stands, off `reachedOf` |
| `src/extension/webview/route/edit.js` | a move and a drop over the host's `steps`, each answering the whole route or null |
| `src/extension/webview/route/drawing.js` | `jump` on a node press, `take` or `handback` on the pointer's button, `edit` on a move or drop |
| `test/level0/drawing-edit.test.js` | the edits in node, each answer checked against `aheadOnly` |
| `test/contract/drawing-page.test.js` | each message through the fake host, and the refusal behind the pointer |

The `graph` message now carries `steps` and `held`, since the graph holds no route fields to edit and no hold. The page draws no edit of its own: the host runs the verb, and the next graph draws the result. Adding a step, and picking a hand, a condition or a fail edge, wait on the desk trial the design input names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and a move or drop stands as the edit, while an add waits on the desk trial
- the cleanup it reveals is in the change: the reached rule comes from `reachedOf`, so the page and the verb share one rule
- the protocol stands in the design output note alone, and every function points at its heading

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
