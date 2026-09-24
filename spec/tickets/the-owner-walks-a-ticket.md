---
kind: [[ticket]]
state: draft
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
    reads: [[spec/guidance/working]]
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
process_hash: 1f3006ec4b044a89
group: the-editor-holds-the-drawing
depends_on: [the-host-runs-the-verbs, a-save-fills-the-ticket, the-work-group-draws-buttons]
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Does a person create, take, work and hand back a ticket from VS Code alone? The owner walks one ticket through the editor with no terminal, and names each place the walk leaves the editor. The question comes from the group `the-editor-holds-the-drawing`, and the plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-editor-holds-the-drawing]].

- the close of the group `the-editor-holds-the-drawing`
- the close of level one, which [[spec/design_input/the-agent-pulls-tickets#three-rules-hold-level-one]] names

- the owner writes under `answer` that the walk stays in the editor, or names each place it leaves
- a ticket in this group stands for each place the walk leaves the editor
- `./RUNME.sh check` passes

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

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
