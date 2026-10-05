---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-fits-its-budget/gate
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
group: the-check-fits-its-budget
parent: the-check-fits-its-budget
record:
  - step: do
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: a1de090b797013827bfbc21307b5d316fc80b86e
    hash_after: a1de090b797013827bfbc21307b5d316fc80b86e
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   99.7  in all"
    inputs:
      - name: ask
        hash: a5b89fbe47483a74
        size: 246
    def: 30024539343bec95
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Discussion stands empty, though the approach says it carries the numbers. done_when 2 compares battery.parts.go against the measure before, cold and warm, so take that measure at 63c619f0d and write it under Discussion before implement lands.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/schema.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent's Discussion holds the measure before the change, taken on this box at the commit that opens the ticket. It gives the battery's parts on two runs, the Go tests alone cold and with builds cached, and the slow packages alone and inside the full run. A second chapter records that go test caches no result of a run carrying -skip, which the check passes for the red list.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: the measure stands under the parent's Discussion, taken at bcafef356, whose code matches 63c619f0d
- cleanup: the skip finding goes into the parent's implement step, where goGate changes
- one place: the numbers stand in the parent's Discussion alone, and this ticket points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
