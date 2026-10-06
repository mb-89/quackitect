---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-clear-hands-back-the-leaf/gate
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
group: clear-hands-back-the-leaf
parent: the-clear-hands-back-the-leaf
record:
  - step: do
    hand: box 156418b839c4 · claude-code-remote
    hash_before: e27dc7f7514dfb2ddbc47e9402a88fec73c59da8
    hash_after: e27dc7f7514dfb2ddbc47e9402a88fec73c59da8
    why: the-clear-hands-back-the-leaf answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's tests and size lists name test/level0/probe-dry.test.js for the probe's clear cases, and the cases stand in test/level0/probe-clear.test.js, which size leaves out; the builder names that file in place

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

node --test test/level0/probe-clear.test.js test/level0/probe-dry.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Discussion of the-clear-hands-back-the-leaf names `test/level0/probe-clear.test.js` as the file the probe clear cases stand in. The draft lists name `test/level0/probe-dry.test.js`, and the draft stands locked, so the Discussion carries the correction.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change names the file in place, as the ask says, under the Discussion, the one place an open ticket takes a write
- the change reveals no cleanup
- the file name stands once, in the Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
