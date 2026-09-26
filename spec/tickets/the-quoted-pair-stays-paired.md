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
    hash_before: eb3034bf01e398b5b8ccdc1e2839ea0e2add3d2d
    hash_after: a5193d466d851b3296cec3af9f790fc634cd4095
    answered:
      - name: tests
        exit: 0
        said: green, 30 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `listAt` fix takes an item as text where it opens and closes on one quote mark, and `"a": "b"` does both; the fix takes an item as text where its closing quote stands last and no colon stands past it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/schema.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`listAt` in `.claude/skills/level0/lib/schema-yaml.js` reads a list item as text where `quotedWhole` answers true.

- `quotedWhole` walks to the closing quote, past an escape, and asks whether it stands last
- an item such as `"no sentence says: a count"` then reads as text
- an item such as `"a": "b"` closes early, so it stays a pair
- the case in `test/level0/schema.test.js` decides both

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change follows the ask, or the discussion says why it departs: the closing quote decides
- [x] the cleanup the change reveals is in the change, or is a note of its own: none stands
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: yes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
