---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: view-actions-run-through-verbs/gate
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
group: sidebar-lands-in-shadow
parent: view-actions-run-through-verbs
record:
  - step: do
    hand: box d85821f54410d · claude-code-remote
    hash_before: 8a8db6fc563e36800fcf0467039cdfef86a84f7f
    hash_after: 8a8db6fc563e36800fcf0467039cdfef86a84f7f
reason: became
successors: [view-actions-run-through-verbs]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The size list leaves out `src/tui/work/workplace.go`, which tests-red changed to pull out `PlaceValue`. The tests list names `TestPlaceAtReadsTheSharedCases`, and the file holds `TestPlaceValueReadsTheSharedCases`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/ticket-edit.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft of `view-actions-run-through-verbs` names two lines wrong. Its evidence stands under the engine, so the correction stands under that ticket's Discussion. It adds `workplace.go` to the size list, and names the Go case `TestPlaceValueReadsTheSharedCases`. The red stub's parameters take an underscore, so the check reads green until the implement step fills it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs to Discussion, since the door holds the draft evidence, and the text says why
- the cleanup the change reveals, the stub's unused parameters, is in the change
- each fact stands once, under that Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
