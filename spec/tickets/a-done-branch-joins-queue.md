---
kind: [[ticket]]
state: closed
urgency: now
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
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 2a007880753fbe573ffb268e31ab6d65c4ebb3ec
    hash_after: 2a007880753fbe573ffb268e31ab6d65c4ebb3ec
    answered:
      - name: tests
        exit: 0
        said: green, 91 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A work branch standing done waits for a review and a merge, and that wait is work of the desk. So the desk pull hands it out like a ticket. The hand runs the review, fixes what it names, merges from trunk and closes the branch.

Without it a done branch waits until a person remembers it, and the cloud's work lands late or not at all.

- a branch at done shows in the desk pull ahead of the free tickets, and a test drives it
- the hand-out names the review, the merge and the close as the steps, and the hand-back runs the merge
- a cloud box's pull hands out no such branch, and a test drives it

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/ready.test.js test/level0/pull.test.js test/level0/work.test.js

## check

    ./RUNME.sh check

## says

A desk's pull on trunk now reads the work branches before the free tickets. Where one stands done, the pull hands it out as three steps. The review and the fixes it names come first, then the merge from trunk, then the close. The merge is the hand-back, and the close takes the branch out of the queue. A cloud box's pull takes a branch instead, so a done branch is the desk's alone. The standing helpers of the work verbs stand exported for that reading.

## checked

- the change follows the ask: the done branch comes first, the steps stand named, and a cloud box gets none
- the cleanup in it: the pull and the work verbs are past their ceilings, so the reading lives in review
- the reading stands in one place, and the design chapter points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
