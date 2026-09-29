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
    hash_before: 592c5e4f54eb6302da3cd50ce390d1d46000d715
    hash_after: 592c5e4f54eb6302da3cd50ce390d1d46000d715
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/wait-key-meets-its-wiring.md:41:387: Vocabulary: waitkey stands outside the words this tree writes. Write a"
    inputs:
      - name: ask
        hash: 87b8320a18ad63b1
        size: 120
    def: 545a0133c6b1cae7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Called.Gone encodes a time.Duration as nanoseconds; name the unit in the 202 schema or answer seconds, as the wait reads

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

A post over /v1 answers the time gone by in seconds, the unit the wait reads, and its schema names the unit. The OpenAPI case reads that description off the 202 schema.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change answers seconds, as the ask offers, and names the unit in the schema
- the change reveals no cleanup past the body type the route already carries
- the unit stands once, in the doc tag of calledBody.Gone, and the case reads it off the document

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
