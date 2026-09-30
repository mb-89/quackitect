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
    hash_before: a6cd426db40cf5e62ea4f3d0ae2240bc563e0f09
    hash_after: 9606d6331017ee8d68dbacd89b32852ed2a7c477
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/work.js:67:1: correctness/noUnusedImports: Several of these imports are unused."
    inputs:
      - name: ask
        hash: 270316fb0ca79bda
        size: 226
    def: c83b0d5d288f37b9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the third done_when line meets no case in test/level0/pull-gate.test.js; the draft points at the schema-slots case, which checks the route alone, so add a case there that rejects, hands draft-2 back, and finds its pass landing

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

A case in test/level0/pull-gate.test.js rejects at the gate, hands draft-2 back with its field, and finds the pass landing. It found a fault: reworked wrote an empty input key on a copy whose leaf carries no input, and the schema refused that ticket at its next hand-back. The copy now keeps no input where its leaf carries none.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case rejects, hands draft-2 back and finds its pass
- the cleanup it reveals is the empty input key, fixed in reworked beside the case
- the case reuses gated and the fixture, so each fact stands in one place

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
