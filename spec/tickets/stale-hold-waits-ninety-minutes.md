---
kind: [[ticket]]
state: open
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

./RUNME.sh check

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
