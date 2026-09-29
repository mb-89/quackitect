---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: agents-call-quack-directly/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: quack-verbs-switch-over
parent: agents-call-quack-directly
record:
  - step: do
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 49865e4504dac092a7f1227d183e63c9d104e125
    hash_after: 49865e4504dac092a7f1227d183e63c9d104e125
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s); green, src/modules/migration passes
      - name: check
        exit: 0
        said: "spec/tickets/verbline-spares-blocking-verbs.md:41:97: Vocabulary: nodeaccept stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: 531c7f52f2d4d471
        size: 212
    def: fb0b796fd802391d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/contract/runme-road.test.js asserts migration.verbs reads shadow in spec/config/level0.json, a caller the draft misses; it breaks ./RUNME.sh check once the key moves to new, and the builder fixes it in place

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/runme-road.test.js src/modules/migration

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The verbs slice moves to new in the tracked config and in its built-in default, as the switch-over asks. The road contract test read the mode as shadow in the tracked file, so it now reads new there.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the contract test reads the mode the tracked file now holds
- the built-in default moves with the tracked file, so a box with no tracked mode runs the same road
- the mode stands in the tracked file once, and the test reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
