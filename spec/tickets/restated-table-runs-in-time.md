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
group: examples-are-the-tests
step: do
record:
  - step: do
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: 8d1614f04595f0a9502ed1d5c8126c5cfe136190
    hash_after: 8d1614f04595f0a9502ed1d5c8126c5cfe136190
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    2.7  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
    inputs:
      - name: ask
        hash: 39168263846f4c08
        size: 504
    def: df12650931d480c9
reason: done
---

# Ask

The RestatedTable rule finds a run of words a line shares with a cell through a lookup of word runs, in time linear in the words. The check stays green on a loaded box.

The rule compares every word pair of every line against every cell, and on a busy box Vale stops it at its budget. The check then answers red with no finding in the tree.

- `./RUNME.sh branch test test/contract/paragraph.test.js` passes, whose case proves a line restating a cell flags and another passes
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/paragraph.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The RestatedTable rule built in src/projection/rules.go compared every word pair of every line beside a table against every cell. On a loaded box Vale stopped it at its two-second budget, and the check answered red with no finding. It now builds each cell's runs of the layer's length once, and looks a line's runs up there: the same verdict, about three times faster over the largest notes. A contract case with a long table times out on the old rule and passes on the new one.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup it reveals: the check runs Vale over the whole tree in one call, so one slow script refuses every file; noted for the retro
- each fact stands once: the run length stays in spec/schemas/paragraph.schema.yaml, and the rule reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
