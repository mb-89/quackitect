---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: engine-verbs-hold/accept
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
group: engine-verbs-hold
parent: engine-verbs-hold
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 148504cdd3fa0863367153b6780726fd11f1b3c6
    hash_after: b78e3b00753867472470d2e7ba2a475963b75f0e
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   53.1  in all"
    inputs:
      - name: ask
        hash: 55232c9e21657d01
        size: 171
    def: 6b3cd8b993bfc9f5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

In src/branches/test.go the testVerb doc comment now sits above goldenReaders, and the goTestNames comment above goTestTexts. Move each comment back onto its own function.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

cd src && go vet ./branches/ && go test ./branches/ && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

In the branches test file, the doc comment of the test verb sits on its own function again, and so does the one naming the test functions a Go file holds. An earlier edit had stacked each above its neighbour. The golden readers and the test texts keep their own comments. Only comments move.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: each comment sits on its own function, and the neighbours keep theirs
the cleanup: none revealed past the move
one place: each comment stands once, above the function it names

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
