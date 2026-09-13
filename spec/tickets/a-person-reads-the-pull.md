---
kind: [[ticket]]
state: open
urgency: soon
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
process_hash: 62642eaf8f9c9c53
---

# Ask

## gain

A person reads the pull as the owner meets it in a live session: the take, the hand-back, the refusal and the parked step. The engine checks stand green. What the tests leave out is how the words land on a person.

## breaks

The pull ships with messages no person read, so the owner learns the pull by tripping over it, and every trip costs a session.

## done_when

- the owner runs `./RUNME.sh branch take` on a group with an open child. The message names the step and the files.
- the owner hands a thin leaf back with `./RUNME.sh branch done`. The refusal says what to write, and where.
- the owner reads a parked person step on a ticket and knows what it asks, from the ticket alone
- the owner writes one line under Discussion per trip. The do step takes each into a change, or a ticket of its own.

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
