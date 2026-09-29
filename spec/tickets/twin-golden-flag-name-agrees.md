---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-names-meet-their-goldens/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: check-names-meet-their-goldens
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: aed9e1c52ab1f6d1f4e86039dfd60de94cbf9f8e
    hash_after: aed9e1c52ab1f6d1f4e86039dfd60de94cbf9f8e
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: d1113f98ffee9f00
        size: 106
    def: f849b4e6f26cc929
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names -update as the flag that rewrites the goldens, where src/lsp/twins_test.go names it -twins

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/lsp

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The discussion of check-names-meet-their-goldens now names -twins, the flag src/lsp/twins_test.go declares, with the command that writes the twin goldens again. The engine writes the draft field alone, so the correction stands under Discussion, where a reader of the draft finds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask, and the discussion says why it lands under Discussion: the engine writes the draft field.
The change reveals no cleanup.
The flag name stands once, in src/lsp/twins_test.go, and the discussion points at that file.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
