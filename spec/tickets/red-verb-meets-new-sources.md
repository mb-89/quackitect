---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-landing-takes-a-verb/design/review
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
group: the-verbs-land-whole
parent: every-landing-takes-a-verb
record:
  - step: do
    hand: box d7a55188b9103 · claude-code-remote
    hash_before: 6ab1de5feb7d65c637ca45abad69ff6115a964d8
    hash_after: 6ab1de5feb7d65c637ca45abad69ff6115a964d8
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/rename.js:170:1: correctness/noUnusedFunctionParameters: This parameter to is unused."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

approach item 3 writes each source's `HEAD` text, and a source new to the change has none. The working text also stands in memory alone, so a killed run loses it. Hold it on disk under `.se`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/test-verb.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`redTest` in `src/scripts/work-test.js` holds each working text on disk under `.se/.runtime/red`, beside a list of the sources. A source `HEAD` lacks stands aside whole. A run killed mid-way leaves the list, and the next run puts every source back first. The branch carries that code, and a new case in `test/level0/test-verb.test.js` holds the killed run.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the texts wait on disk, and a new source stands aside whole
- the cleanup: none stands past the new case
- the aside folder stands in `ASIDE` in the verb alone, and the design note links there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
