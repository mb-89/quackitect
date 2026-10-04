---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-dead-entries/gate
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
group: box-verbs-run-in-go
parent: box-verbs-dead-entries
record:
  - step: do
    hand: box 660db8e33adc · claude-code-remote
    hash_before: b37ab3806bfc901189afc7d2f4c54c47635ec1a1
    hash_after: 84c41366cddd6fc899c4fe5f4f38e4e5688c930f
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   48.6  in all"
    inputs:
      - name: ask
        hash: af5b2ace1d8b6df3
        size: 152
    def: 7b24a90da64c22ca
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/extension.md says src/scripts/editor.js makes the link. After this change editorlink.go makes it. Point both sections at the Go file.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/editorlink_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The extension note named src/scripts/editor.js as the hand that links the sidebar and writes the editor list. The Go setup does both now, in src/quack/editorlink.go. So the two sections name that file, and the dangling link section names the Go case that holds it. The size golden reads the note at its new length.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the one note the ask names, and the size golden that counts its lines
- the Go case it names stands and passes
- the note points at the file that owns the link, and repeats none of its code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
