---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-road-has-a-caller/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-servers-and-views-hold
parent: every-road-has-a-caller
record:
  - step: do
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 40938e1e863c66afb0cafdaab09451775c366126
    hash_after: 40938e1e863c66afb0cafdaab09451775c366126
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the write door reads the whole ticket schema. A write to a closed ticket carrying `when: returned` meets `when reads returned`. The door reads a closed ticket the way `pastHistory` in `src/bridge/findings.js` reads it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/write.test.js test/contract/one-reading.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The check reads a closed ticket as history, and the write door read it against the whole schema. So a line under Discussion on a closed ticket carrying `when: returned` came back refused. `standsClosed` in `src/bridge/findings.js` now reads the closed state once. `pastHistory` and the schema door in `src/bridge/write.js` both call it. The door skips the schema rows where the ticket on disk stands closed. The engine fields still meet their own door.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the door reads a closed ticket the way `pastHistory` reads it, through one function.
- the cleanup the change reveals is in the change: the inline read in `pastHistory` moves into `standsClosed`.
- every fact the change adds stands in one place: `standsClosed` owns the closed read, and both callers point at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
