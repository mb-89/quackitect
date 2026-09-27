---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-gate-asks-a-bless/design/review
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
parent: a-gate-asks-a-bless
record:
  - step: do
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 1e7b4a507d67fcf3b326d46092c2e445e937953a
    hash_after: 1e7b4a507d67fcf3b326d46092c2e445e937953a
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:145:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: dc8fac5daeaecc39
        size: 202
    def: 99fa1a62aef2e988
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask names spec/schemas/process.schema.yaml, which takes its steps by $ref from ticket.schema.yaml; the schema case reads a process file carrying bless on a gate, so it decides the line the ask names

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/schema-bless.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

test/contract/schema-bless.test.js reads the tracked spec/schemas/process.schema.yaml and spec/schemas/ticket.schema.yaml, and checks a process file carrying bless on a gate against the process schema. That decides the line the ask names, because the process schema takes its steps by $ref from the ticket schema.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the case reads a process file, not a ticket alone
no cleanup revealed
the case reads the schemas where they stand and copies no step shape

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
