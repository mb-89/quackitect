---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: prose-checks-run-in-go/gate
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
parent: prose-checks-run-in-go
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 00f5767c10ec6760cd8f27a6a4dbf4b50952cac0
    hash_after: 00f5767c10ec6760cd8f27a6a4dbf4b50952cac0
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: f4f2ffb2dc23a6a5
        size: 214
    def: 76c1d849e1b5a0b5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

pastReads in src/lsp/outside.go runs node with tenseScript for the past veto, a node use the ask covers, and the approach and its callers leave it out; name it as the reader that drops node when the slice reads new

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

The prose ticket and the switch-over ticket now name pastReads in src/lsp/outside.go as a node road for the past veto. It stays standing while the slice runs in shadow, and it takes the Go past veto once the slice reads new.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: both tickets name pastReads as the reader that drops node.
The change reveals no cleanup.
The fact stands in the prose ticket, and the switch-over ticket points at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
