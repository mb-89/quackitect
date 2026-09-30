---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: reject-copies-read-their-round/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: reject-copies-read-their-round
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: c5ef2e34c76aac5de0b88dc7bfcafa066fbf3739
    hash_after: d24df56b3ed2cfe114b324b6afcdfb96c594481d
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/work.js:67:1: correctness/noUnusedImports: Several of these imports are unused."
    inputs:
      - name: ask
        hash: a8a2ead213d8e3be
        size: 200
    def: c83b0d5d288f37b9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the GATED fixture holds input on implement/change, while the standard route holds it on the implement phase and has tests-green read design/tests-red, so add a case finding both rewired after a reject

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-gate.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A fixture in test/level0/pull-gate.test.js now takes the standard route's shape: the implement phase reads the design and the gate, and tests-green reads the red tests. A reject case on it finds the implement phase and tests-green reading both rounds. The first fixture carries its input on implement/change, so no case held the shape real tickets carry.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case finds both rewired after a reject
- the cleanup is none: the older fixture stays, and its cases still hold
- STANDARD derives from GATED, so the fixture text stands once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
