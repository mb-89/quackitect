---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-finishes-its-asks/design/review
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
group: each-thing-stands-in-place
parent: the-retro-finishes-its-asks
record:
  - step: do
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 6aa33efbe4d35d67c3e100985660f6655611d166
    hash_after: 6aa33efbe4d35d67c3e100985660f6655611d166
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`--again` sets `since` to this retro's own collect, and `copyTree` writes each transcript over the same path under `input/transcripts`, so `withinWindow` there drops every line the first pass takes; the second pass filters at `sinceLast`, or appends past the lines the input holds

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/retro-collect.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The parent's change commit `c38a7232` fixes this, so this step lands no code.

- `collect` in `src/scripts/retro-collect.js` hands `outsideInto` both `since` and `window`
- `since` decides which files copy, and `--again` sets it to this retro's own collect
- `window` is `sinceLast`, so `withinWindow` cuts every transcript at the last retro's collect
- a changed transcript then copies whole again, holding the lines the first pass takes and the lines past them
- the case "a second pass keeps the lines the first pass takes, and adds the lines past it" decides it

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change follows the ask, or the discussion says why it departs: the second pass cuts at `sinceLast`
- [x] the cleanup the change reveals is in the change, or is a note of its own: none stands
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: yes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
