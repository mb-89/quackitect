---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-becomes-a-view/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tui-shell-lands-in-shadow
parent: the-log-becomes-a-view
record:
  - step: do
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 8c5f979fb6f9cb96aa7c813086b5d380847664bd
    hash_after: 8c5f979fb6f9cb96aa7c813086b5d380847664bd
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/tree passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 675d97af378969b7
        size: 133
    def: 8a94143eab7e05cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft lists TestTheLogBaseFileDeclaresTheLogView under src/tui/log/view_test.go, and the case stands in src/tui/tree/base_test.go

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/tree/base_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft of the-log-becomes-a-view named src/tui/log/view_test.go for TestTheLogBaseFileDeclaresTheLogView, and the case stands in src/tui/tree/base_test.go. The parent Discussion now carries the correction, since the open parent refuses an edit to its draft chapter.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the correct path stands in the parent Discussion
- no cleanup showed: no code moves
- the fact stands once, in src/tui/tree/base_test.go, and the Discussion points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
