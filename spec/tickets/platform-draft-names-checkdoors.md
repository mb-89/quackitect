---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: level0-claims-name-the-platform/gate
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
group: level-zero-smoke
parent: level0-claims-name-the-platform
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: 3726d7234021b4c6cb4dcf50ffeaf4357cc9ddff
    hash_after: 3726d7234021b4c6cb4dcf50ffeaf4357cc9ddff
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  107.7  in all"
    inputs:
      - name: ask
        hash: 6797cbe800abc30c
        size: 278
    def: a75cd60bbcd8c836
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's size and callers lists leave out src/quack/checkdoors.go checkDoorsOf, which tests-red already changes from the windows flag to platform: runtime.GOOS, and src/quack/check_test.go TestCheckParts, whose Windows case the rename reaches; the builder names both in place

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/probe-clear.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft of level0-claims-name-the-platform now names checkDoorsOf in checkdoors.go and the Windows case of TestCheckParts, under its Discussion, since the engine writes the draft's own fields. The check then stood red on two counts. The dry probe's clear failed: this point ticket carries a todo mark, a todo ranks first in the pull, and the clone's pull past the clear handed it in place of the probe's own leaf. So the probe's clone drops every todo mark the tree carries and commits that before it mints its group. And the lint refused two red-stage files at error: detach.go now names why it reaches os/exec, as procs.go does, and the runme road reads its own source through the disk door.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change names both in place, as the ask says, under Discussion since the draft's fields stand closed to a hand
- the cleanup the change reveals, the dry probe meeting the tree's todo marks and the two lint errors, is in the change, with its case in test/level0/probe-clear.test.js
- the reason stands once, in the comment over untodo in src/scripts/probe-clear.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
