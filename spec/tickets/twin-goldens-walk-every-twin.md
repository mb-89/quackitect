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
    hash_before: 05ae1c1bfe1de4c4836d8df7dd1ac052b13e6333
    hash_after: 05ae1c1bfe1de4c4836d8df7dd1ac052b13e6333
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes; green, src/modules/check passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: 525e84d12d0f4256
        size: 172
    def: f849b4e6f26cc929
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTwinGoldens in src/lsp/twins_test.go walks the twins node prints, so a twin the JavaScript side drops passes unread; walk check.Twins and fail where a side lacks a twin

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/lsp src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTwinGoldens now walks check.Twins, the list the check module owns. A twin the JavaScript side leaves out, or prints past that list, now fails the test, where before it passed unread.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the walk reads check.Twins, and a twin one side lacks fails.
The change reveals no cleanup.
The twin list stands in check.Twins, and the test reads it there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
