---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: lsp-marks-the-held-fields/gate
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
group: lsp-takes-the-lenses
parent: lsp-marks-the-held-fields
record:
  - step: do
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 9e4d90e3d3ee104f42c6ced823d771e39703da3d
    hash_after: a8213bd2f9afdb32cedb893058a8022884328de9
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "   75.3  in all"
    inputs:
      - name: ask
        hash: 14d9ce3fc49c7e86
        size: 139
    def: 3452145127efb1bb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the design note names `marksOf` where the approach ports `marksIn` from `fields.js`, and the implement step names the function once in both

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/lsp/lenses_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The design note names `marksIn`, the function `src/modules/lsp/marks.go` ports from `fields.js`, so a reader finds the code the note names. The rename touches prose alone, so the lsp package cases stand as its test.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, a one-word rename in the note
- the change reveals no cleanup past it
- the change adds no fact

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
