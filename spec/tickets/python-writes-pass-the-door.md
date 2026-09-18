---
kind: [[ticket]]
state: closed
urgent: true
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
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 3242c2e50ad0fcd97ad030e79d8c5eb2d22c7753
    hash_after: 1dbff9e8903035842237b7ca13d9a38d6bf26c13
    answered:
      - name: tests
        exit: 0
        said: green, 50 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 47 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The shell door refuses every road that writes a tracked file from a shell, and a hand writes through Read, Edit and Write alone. So every write meets the rules, whichever program carries it.

Today the door reads the command's verbs, and a python or node one-liner that writes a file passes it. This box wrote seven files that way in one session, and the rules read none of them.

- a python, node, perl or ruby command writing a tracked file meets a refusal, and a test drives it
- the same command over a file the rules leave alone passes, and a test drives it
- the refusal names the file and the program, as the sed refusal does

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/bash.test.js test/level0/stop.test.js

## check

    ./RUNME.sh check

## says

The command door already read a write call inside a script beside a path the rules cover. A script that names its path on one line and writes on another went past it, and this box wrote seven files that way. Now a write call with no path beside it takes every path the whole body names that the rules cover. The refusal names each path and the program, as before. A read of such a path names no write, and a path outside the rules passes.

## checked

- the change follows the ask: python, node, perl and ruby all go through the interpreter road the door reads
- the cleanup the change reveals is in it: the door file stands past its ceiling, so the block lost lines
- the reading stands in the door alone, and the design chapter points at it

# Discussion

A second change rides this hand-back. The tooth's cap on holds in a row yields to a firm continue rule, and the queue rule is firm. The cap let a session with work end, which the owner saw today.
