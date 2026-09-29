---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: actions-answer-over-http/gate
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
group: quack-verbs-land-in-shadow
parent: actions-answer-over-http
record:
  - step: do
    hand: box d84fcad60110c · claude-code-remote
    hash_before: 6eb3bbfbab273dae6773bf0343e234298c8469b2
    hash_after: 6eb3bbfbab273dae6773bf0343e234298c8469b2
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/wait-key-meets-its-wiring.md:41:387: Vocabulary: waitkey stands outside the words this tree writes. Write a"
    inputs:
      - name: ask
        hash: 40affed6f1a8486d
        size: 118
    def: 545a0133c6b1cae7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the 400 for a body the input type refuses and the 422 for a refusing module carry no case in src/index/actions_test.go

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A post over /v1 answers 400 where its body fails the input type, and 422 with the reason where a module refuses a request. A case now holds each answer, beside the cases on the wait.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change adds the two cases the ask names, in src/index/actions_test.go
- the change reveals no cleanup: the fake accept gains one refusal and nothing else
- the reason text stands once, in the fake accept, and the case reads it off the answer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
