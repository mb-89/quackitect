---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 09419e77fb94732b847bfceb3b1877053cb11c40
    hash_after: 09419e77fb94732b847bfceb3b1877053cb11c40
    answered:
      - name: tests
        exit: 0
        said: green, 41 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A payload the hand-back refuses lands nowhere the sweep reads. Today the engine writes the fields into the ticket before the checks. A refusal that inserts a step commits them, so a word the voice rules refuse reaches the branch. Done is the payload kept in the hold until the checks pass, and a test that a refused payload leaves the ticket as it stood.

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/contract/pull-payload.test.js test/level0/pull.test.js

## check

    ./RUNME.sh check

## says

The hand-back put the payload's fields into the ticket on disk before the checks. A refusal at the cap then committed them with the person step, so a refused word reached the branch. Now the engine puts the fields into the text in memory, and runs the checks over that. A refused payload rides the hold, so the next hand-back with no fields meets the same checks. The person step lands on the ticket without the payload.

## checked

- the change follows the ask: the payload waits in the hold, and a test drives the ticket as it stood
- the cleanup in it: the pull's test file is past its ceiling, so the new test stands alone
- the reading stands in the hand-back alone, and the design chapter points at it

# Discussion

The verdict chapter of agent-pulls-ticket carries a word the vocabulary refuses, because the refused payload landed with the person step. The next verdict hand rewrites the field.
