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

The owner finishes the Vale trial on the Windows desk. That is steps 4 to 6 of [[spec/tickets/vale-ls-on-windows]], whose Discussion holds steps 1 to 3. It needs the owner's editor on Windows, so no box can do it. That ticket closes into this one.

The owner runs, in Git Bash at the tree's root:

    git pull
    code .

Then, in the editor:

1. Open `spec/guidance/working.md`.
2. Add a line such as `This is VERY LOUD TEXT HERE, yes.` without saving it.
3. Read the Problems panel, and the Vale channel of the Output panel.

- the result says whether the Problems panel draws a Vale finding on the loud line
- the result quotes any error the Vale channel prints, word for word
- `./RUNME.sh check` exits 0

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
