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
    hash_before: 2fd27fae928427cc2fe3bb5eaaf4acfcc9d50a1a
    hash_after: 1c615815d79e05b532074055c4730cfe4fbb3ef7
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/log passes
      - name: check
        exit: 0
        said: "   38.5  in all"
    inputs:
      - name: ask
        hash: db8cdae5bf8dae07
        size: 116
    def: 4d5ec233e043428a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the say action in `src/modules/log/log.go` says it appends through its program. After the port a Go verb answers it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/log/say_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The say action hands log --say to the node module, which runs the registered Go log verb since the port. Its NoUndo line still named a JavaScript program, so it now names the Go log verb, and the say case asserts that wording.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the say action names the Go verb
- the cleanup the change reveals is in the change: none past the line
- every fact stands in one place: the line stands in log.go alone, and the case reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
