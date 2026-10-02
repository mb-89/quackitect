---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: install-drops-node/gate
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
group: node-leaves-the-boxes
parent: install-drops-node
record:
  - step: do
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: 8c1ae1bd6428111457c82fd979a645be6b37d9d2
    hash_after: f790cd00bf80efb7e5a3231b1fe6232d5a4c9728
    answered:
      - name: tests
        exit: 0
        said: green, 32 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/install-names-the-index-binary.md:41:130: Characters: The character $ stands outside the set a paragraph ad"
    inputs:
      - name: ask
        hash: 84c6996ee98dbd32
        size: 155
    def: 7406f0bc9df1ebf5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

COLD_PATH in src/scripts/probe-cold.js names install.sh alone. go-stamp.sh, setup.sh and verbs/setup.js join the install road, so the list takes all three.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/probe-cold.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The install now hands its source stamp to `go-stamp.sh` and its JavaScript steps to the setup verb, which runs `setup.sh`. A commit changing any of the three changes what a fresh box meets at its first start. So `COLD_PATH` in `src/scripts/probe-cold.js` lists all three, and the commit verb runs the cold probe on them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the list takes all three files
- the cleanup stands in the change: the list keeps its sorted order
- the list stands once in `COLD_PATH`, and the commit verb reads it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
