---
kind: [[ticket]]
state: open
urgency: now
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 568f402efe3adab7
---

# Ask

A function holds one thing and a file one topic, and the config names the ceiling: 150 lines a function and 600 lines a file. The write door and the check read it, so a function or a file past its ceiling meets a refusal with the line.

Without it a file grows past what a reader holds in one sitting. The rule lives in a memory note alone, where the door reads nothing.

- `spec/config/level0.json` carries the two ceilings under one key, and `./RUNME.sh config` prints them
- a write of a function past its ceiling meets a refusal naming it, and a test drives it
- a write of a file past its ceiling meets a refusal naming it, and a test drives it
- `./RUNME.sh check` names every function and file past its ceiling, and passes on this tree

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
