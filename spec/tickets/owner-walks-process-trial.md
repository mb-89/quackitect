---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: does the work the ask names, and says what came back
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back, which the step behind this one reads
  - name: follow
    does: carries the result into the tree, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: result
    needs: ["branch test"]
    checklist: ["the change follows the result, or the discussion says why it departs", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/person]]
process_hash: 781b200dbb69dec3
step: do
---

# Ask

The owner walks one standard ticket in the editor on the desk, from the mint to its final acceptance. The owner says whether the progress, the gate and the fix tickets read as [[spec/design_input/level-two]] asks. It needs the owner's own eyes on the owner's editor, so no box can do it. It carries on [[spec/tickets/the-owner-walks-a-process]], which closes into this ticket.

The owner runs, from the tree's root on the desk:

    git pull
    ./RUNME.sh mint ticket spec/tickets/walk-trial.md --process=standard
    code spec/tickets/walk-trial.md

Then the owner pulls it step by step with `./RUNME.sh ticket pull walk-trial`, and writes under `result` what each view shows.

- the result names each view the owner reads, and what the owner sees there
- `./RUNME.sh check` exits 0 after the fixes the result asks for

# do

<!-- does the work the ask names, and says what came back -->

## result

<!-- what came back, which the step behind this one reads -->

<!-- the form is text -->

# follow

<!-- carries the result into the tree, with the test that covers it -->

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
