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
    hash_before: 9e9188a95f7c05e4b70462d18cdeab20d56868f4
    hash_after: 65997c88ff06dbb8d6b00981350282d13c3977c0
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    2.3  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: ab6a7850687f8740
        size: 482
    def: df12650931d480c9
reason: done
---

# Ask

The owner's words on examples stand in one design input note, from pylib's tested notebooks and pyqtgraph's example explorer, so the design note and every later ticket read the intent at its source.

The design note restates the owner's idea in its own words, and the intent drifts with each hand that reads the copy.

- `spec/design_input/examples-are-the-tests.md` stands, carrying the seven points the owner agreed and the pyqtgraph explorer behavior
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/vocabulary.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

spec/design_input/examples-are-the-tests.md holds the owner's seven points and where they come from: pylib's tested notebooks and docs browser, and pyqtgraph's example explorer and its tests running every example. The vocabulary takes the terms the note needs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the note follows the ask point by point
- the cleanup it reveals: the vocabulary rule reads a projected file, so a new term wants ./RUNME.sh project, noted for the retro
- each fact stands once: the design note points back here, and this note points nowhere ahead

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
