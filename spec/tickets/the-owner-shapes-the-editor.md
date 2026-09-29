---
kind: [[ticket]]
state: open
step: do
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
depends_on: ["the-process-stays-editable"]
group: loose-fixes-99f4547
record:
  - step: answer
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 1399b4e4820f6c5cf9d5d105c2babe66530e3582
    hash_after: 1399b4e4820f6c5cf9d5d105c2babe66530e3582
    inputs:
      - name: ask
        hash: 2666e23e7826c6d7
        size: 446
      - name: [[spec/design_input/level-two]]
        hash: 8dddb2221fafbe09
        size: 15813
    def: 2280015d497a3abd
---

# Ask

The owner decides how the editor draws and edits a process file: the steps, the gates, the tags and the bless. The question comes from `the-process-stays-editable`, and [[spec/design_input/level-two]] names the editor in its chapter The levels.

- the editor for process files waits on the answer

- the answer names what the editor draws, and what a person edits there
- a ticket carrying the answer stands minted, which `./RUNME.sh check` reads

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The editor draws a process file with the drawing a ticket takes, off the graph ./RUNME.sh graph answers. A person edits there the steps, their order, on_fail, by and when: every row the-editor-draws-the-ticket names in The drawing takes an edit, save the pointer. A gate draws as a marked node, and its question and final edit as leaf fields.

The tags draw as labels on a node, and edit as a leaf field. The bless stays ./RUNME.sh ticket bless on a ticket, since a process file holds no verdict. A change reaches the open tickets through ./RUNME.sh ticket update.

Weighed: the design input already rules the drawing and the rows it edits, and leaves how far to a desk trial. Assumed: the trial stays with the editor ticket the do step mints, so a wrong call costs one ticket edit before code lands.

# do

<!-- carries the answer out, with the test that covers it -->

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

A box decides this, under the owner's ruling that a cloud box decides every step itself. The answer for the `answer` step:

- the editor draws a process file with the drawing a ticket takes, off the graph `./RUNME.sh graph` answers
- a person edits there every row [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]] names but the pointer
- those rows are the steps, their order, `on_fail`, `by` and `when`
- a gate draws as a marked node, and its question and `final` edit as leaf fields, the way `by` does
- the tags draw as labels on a node, and edit as a leaf field
- the bless stays `./RUNME.sh ticket bless` on a ticket, because a process file holds no verdict to bless
- a change reaches the open tickets through `./RUNME.sh ticket update`

What I weighed: the design input already rules the drawing and the rows it edits, and says a desk trial decides how far editing goes. So the answer takes that input whole, and the trial stays with the editor ticket the `do` step mints. A wrong call costs one ticket's edit before any code lands.
