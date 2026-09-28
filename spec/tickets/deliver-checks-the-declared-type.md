---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: actions-answer-typed-results/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-foundation-closes-its-gaps
parent: actions-answer-typed-results
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: c927cd96002f63044506b6ae9a864b0dc041feae
    hash_after: c927cd96002f63044506b6ae9a864b0dc041feae
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes
      - name: check
        exit: 0
        said: "spec/tickets/the-index-meets-fake-modules.md:278:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: fd859a7c2234c545
        size: 200
    def: 665d3f050422822e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Store.Deliver checks the last answer against the type q.Answers declares, and refuses a mismatch naming the action. The draft assumes no check, so a declared type can drift from what a caller receives

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/q/send_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

q.Answers now records the type it declares on the registration.
Deliver checks the last answer against that type once the requests end. It refuses a mismatch, or a nil answer, with an error naming the action, the type it got and the type declared.
An action with no q.Answers answers as before, unchecked.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the refusal names the action, and a case reads it.
The parent's own implement puts back the output fields beside the new type, since its replay took them out. The two changes share q.Answers and touch different fields.
The refusal's wording stands once, in Deliver.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
