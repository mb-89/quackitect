---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-lint-runs-in-go/gate
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
group: lint-without-vale
parent: the-check-lint-runs-in-go
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 6a3d3fd6b3dd1395018efa50e4a8d700d202961d
    hash_after: b4ef50f32943a842977be33782b8547c65a1edd8
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   61.9  in all"
    inputs:
      - name: ask
        hash: adde8faec188d7de
        size: 341
    def: f3cc35d95a9c8980
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

since rules-lint-changed-files-first the check's first part runs `lint --changed --strict`, where a warning refuses, yet the approach leaves a warning under stood alone as lintFoundOf did, so a red changed part answers `check --errors` with no line naming it; leave a finding the lint refuses under erred, so --strict puts its warnings there

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verb_lint_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check's first part runs `lint --changed --strict`, where a warning refuses. The lint now leaves its findings where `SE_LINT_FOUND` points, through `leavesFoundAt` in `src/quack/verb_lint.go`. `lintFoundOf` puts every finding the lint refuses under erred as its line, so a red changed part names its warnings under `check --errors`. A warning the lint lets pass stands under stood by its file and source, as the stamp counts it. This writes the leave door `the-check-lint-runs-in-go` asks for, with the strict rule in it, so that ticket's own red case passes too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a finding the lint refuses leaves under erred, and a case drives a warning under --strict there
- the cleanup: the finding line's format moves into `lintLine`, which the printed rows and the erred lines share
- one place: `lintLine` owns the line's format, and `lintFound` in `src/quack/check.go` owns the shape the check reads

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
