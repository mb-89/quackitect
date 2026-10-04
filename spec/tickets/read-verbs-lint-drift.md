---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-verbs-port-to-go/gate
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
group: read-verbs-run-in-go
parent: read-verbs-port-to-go
record:
  - step: do
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 36f6011c0c3dff03fdf035662673bdbdbe0f2eaa
    hash_after: 76dd244ec138b95c8d1b908e05c1493c3a7b599e
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "   57.3  in all"
    inputs:
      - name: ask
        hash: 24b051aa5d571a99
        size: 135
    def: 4d5ec233e043428a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the lint verb runs in Go, and the check verb still runs the lint of `cli-read.js`. The two can answer apart until the check port lands.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/lint-twins.test.js src/quack/verb_log_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint verb runs in Go, and the check still runs the lint of cli-read.js until the check port lands. A contract case drives both over one ticket carrying findings, and fails where they name different lines, so the drift shows on the next check. Moving the check onto the Go lint stays with check-verbs-run-in-go, which owns the check verb. The Go lint named magic numbers in verb_log.go, so its span seconds and parse base take names, with a case on each span unit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: it holds the two lints to one list, and leaves the check lint to the check port
- the cleanup the change reveals is in the change: the log verb magic numbers
- every fact stands in one place: the case points at this ticket and at one-reading-proves-one-file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
