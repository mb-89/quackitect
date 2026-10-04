---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-verbs-run-in-go/accept
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
parent: read-verbs-run-in-go
record:
  - step: do
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 40c11b40b4622e89170144b18d9b67e727ce8f40
    hash_after: 971c8368c6ee32c3b33ba230b143eceeea025a0e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   36.3  in all"
    inputs:
      - name: ask
        hash: a5c6aaec9008bc3e
        size: 150
    def: b523d80c2c6f4b51
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

indexSays in src/quack/verb_index.go prints every answer as JSON, where se-index prints the text of a why answer, so index why prints its tree as JSON

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verb_index_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go index verb printed every answer as indented JSON, so index why printed its tree as a JSON object. It now prints the text of a why answer, as se-index prints it, and links, notes and find keep the shared JSON print.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: index why prints the text
- the cleanup the change reveals is in the change: none past the verb
- every fact stands in one place: the why method stands named once in verb_index.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
