---
kind: [[ticket]]
state: open
step: answer
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
depends_on: ["the-engine-holds-the-route"]
group: loose-fixes-99f4547
---

# Ask

The owner walks one standard process in the editor, from the mint to its final acceptance. The owner says whether the progress, the gate and the fix tickets read as [[spec/design_input/level-two]] asks. The question comes from `the-engine-holds-the-route`.

- the next delivery of level two waits on what the owner finds

- the answer names each view the owner reads, and what the owner sees there
- `./RUNME.sh check` exits 0 after the fixes the answer asks for

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

This is work a person alone can do: the owner's eyes on the owner's editor. So it moves to the person route, per the owner's ruling. [[spec/tickets/owner-walks-process-trial]] carries the commands, loose on `main`. The box taking this ticket closes it `./RUNME.sh ticket pull the-owner-walks-a-process --became owner-walks-process-trial`.
