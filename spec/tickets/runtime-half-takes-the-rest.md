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
group: the-rules-hold-themselves
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
---

# Ask

The runtime half holds what dies with the box, and a handful of files the engine
writes stand outside it still:

| what stands under the private folder | what writes it |
|---|---|
| `config.json` | the values a window holds for its own session |
| `vehicle.json` | the pointer a bridgehead reads before anything else |
| `registry.json` | the register turning an identity into a place |
| `copy.json`, `project.json` | the identity of a copy, and the project it drives |

Each name stands in more than one place. A live bridgehead hook spells it, the
editor extension spells it, and the language server spells it again. So the move
wants one change reaching all of them at once.

The gain is one rule a reader reads. Everything the engine writes stands under
one folder, and the index, the retro and the privacy door each name that folder
alone.

Without it a reader learns the split by reading the list, and a new writer picks
whichever place it meets first.

- every name above stands under the runtime half
- a box carrying the old place gets it moved, and the install says so
- the bridgehead, the extension and the language server read the same path
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
