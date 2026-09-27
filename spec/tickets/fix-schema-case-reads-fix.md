---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: fix-groups-end-the-chain/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: fix-groups-end-the-chain
record:
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 7fc025544e76c0dcd0a14857788aa1f9a9e1efb1
    hash_after: 5cccff223679f289c79d31aebc0150503cc799ca
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 9441f8ed3e9f332c
        size: 347
    def: a022b773045b25a9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no red test decides the schema done_when line. The ticket front sets additionalProperties false, but no tracked ticket carries fix: true, so ./RUNME.sh check passes with or without the field. Add a case validating a group front carrying fix: true against spec/schemas/ticket.schema.yaml, or record the line as a checkpoint the implementer answers.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/schema.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The ticket schema names fix, a boolean on a group ticket, which a fix group carries and the dispatch writes. A contract case mints a ticket off the real schema, sets fix: true, and finds no fault naming fix, and a word in place of the boolean refuses. Against the schema before this change the same ticket meets Schema.fix, so the case decides the schema line of fix-groups-end-the-chain, which the gate found no test deciding.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case validating a group front carrying fix: true against the ticket schema
- the change reveals no cleanup
- the field stands once, in spec/schemas/ticket.schema.yaml

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
