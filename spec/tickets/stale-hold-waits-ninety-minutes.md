---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 02546332ea6d207f8a3f1d55d45bee7ac5e55e51
    hash_after: 2d25ade8f09af37dc9160a558fed7b0bb3804c7d
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
    inputs:
      - name: ask
        hash: 8b7e199e450b24f6
        size: 490
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A box working a big ticket goes past thirty minutes between pushes, because each push now waits on the full check. Past `work.staleAfter`, the next routine run reads the hold as stale and frees the branch. A box lost four commits that way, and the box after it did the same work again.

The gain is a working box that keeps its branch through a long step, while a box that left still frees it within the night.

- `./RUNME.sh config` reads `work.staleAfter 90m`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-held.test.js test/level0/stand.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`spec/config/level0.json` sets `work.staleAfter` to `90m`, over the built-in thirty minutes. `./RUNME.sh config` reads it from that file. A box now keeps its branch through a long implement step and the full check before its push. A box that left still frees its branch within an hour and a half.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the span lives in the config file, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
