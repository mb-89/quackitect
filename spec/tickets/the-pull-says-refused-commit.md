---
kind: [[ticket]]
state: closed
urgent: true
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
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: e2e985068b6e482098a6c9ff76337345a8545c6e
    hash_after: 84bd1d308fd58187b3bd50cd9205e80492a9b86c
    answered:
      - name: tests
        exit: 0
        said: green, 42 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 64 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A hand learns at the hand-back that the privacy door refuses its commit, and the record names the commit it holds.

<!-- breaks, as text: what breaks if it is never done -->
The pull stages, the pre-commit hook refuses, and the pull writes a pass with the old hash and says nothing. The branch then stands uncommitted past several leaves, and a clone of the tree carries the old code. The group `the-bridgehead-installs-upstream` met it at the change leaf: two leaves passed on one hash, and the slow test cloned the old verb.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a hand-back whose commit the hook refuses answers refused, with the hook's finding, and keeps the hold
- a unit test over a fake git proves it, with the hook answering one
- the record's `hash_after` names a commit the branch holds, or the pass stands refused

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/landed.test.js test/level0/pull.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The landing moves into its own module and reads the commit's answer. A commit the hook refuses puts the ticket file back, empties the index, keeps the hold and answers refused with the hook's finding. So no record carries a hash the branch has yet to hold. The git door answers the error text beside the output, so the finding reaches the pull. The test verb moves into its own module too, so the pull module shrinks.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the three lines under it stand in the landing, its test and the record
- the cleanup the change reveals is in the change. The test verb and the schema fixture move into their own files

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.
