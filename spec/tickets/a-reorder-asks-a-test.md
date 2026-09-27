---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: doors-read-what-commands-do/design/review
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
group: the-verbs-land-whole
parent: doors-read-what-commands-do
record:
  - step: do
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: b78ea7e05abd69a925311d1d11e2a9d8d156b519
    hash_after: b78ea7e05abd69a925311d1d11e2a9d8d156b519
    answered:
      - name: tests
        exit: 0
        said: green, 32 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

an added and removed multiset match in `untestedIn` passes a reorder of statements, as a `return` moved above a call, which changes code; pass only a block moved whole, contiguous lines kept in order, and add a `tested.test.js` case where a reorder still asks a test

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/tested.test.js test/level0/precommit.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`movedWhole` in `lib/tested.js` passes a file whose hunks each take away or add one whole block. Each block taken away lands again with its lines in order. A block is whole where it opens at the left margin and its brackets close. So a function moved whole asks no test, and a `return` moved inside a body still asks one. A case in `test/level0/tested.test.js` holds both sides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and it lands the fourth approach step of the parent with the tighter rule
- the cleanup: a block that is a whole statement at the left margin, as a top level call, still reads as a move, and a note of the parent's review can take it
- the rule lives in `movedWhole` alone, and `codeIn` calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
