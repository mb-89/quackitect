---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-moved-input-marks-steps/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-process-stays-editable
parent: a-moved-input-marks-steps
record:
  - step: do
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: c0d54a7f1673923006a2e1addd450b62fcb29f03
    hash_after: c0d54a7f1673923006a2e1addd450b62fcb29f03
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:145:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e40b7e72eb84e9b3
        size: 157
    def: 90b8f9f7c0b698b1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

SCHEMA in test/level0/pull-schema.js copies the record shape of the ticket schema, so inputs, def and stale land there beside spec/schemas/ticket.schema.yaml

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance-hand.test.js test/level0/restart-box.test.js test/level0/person-step.test.js test/level0/retro-new.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

SCHEMA in test/level0/pull-schema.js carries stale, def and inputs on a pass record, matching spec/schemas/ticket.schema.yaml, so a test ticket holding the pass hashes that a-moved-input-marks-steps writes passes the test schema.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the three fields stand in the test schema
no cleanup revealed
the test schema copies the ticket schema by the ask own design, and the fields match it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
