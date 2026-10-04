---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-port-to-go/gate
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
group: retro-verbs-run-in-go
parent: retro-verbs-port-to-go
record:
  - step: do
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: f830dc6af0fd6a1a452c5d7275eb1306823d8d33
    hash_after: f830dc6af0fd6a1a452c5d7275eb1306823d8d33
    answered:
      - name: tests
        exit: 0
        said: green, 22 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "  102.6  in all"
    inputs:
      - name: ask
        hash: 9d53708e28a10fc8
        size: 315
    def: 6733c78151e933e7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's size list leaves out src/scripts/pull.js and test/level0/pull-leaves.test.js, which the SE_MINTED decision touches; and tests-red says test/level0/experiment.test.js leaves whole while the draft keeps its process case, so implement names the final list and removes that file with its imports of retro.js

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-leaves.test.js test/contract/experiment.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The sweep removes test/level0/experiment.test.js whole, with its imports of retro.js: its two audit cases stand in src/quack/retro_audit_test.go, and its third read only the constant the contract test reads off the route. The final file list of the port, pull.js and pull-leaves.test.js among it, stands in the says field of the port ticket's tests-green, and this ticket points there instead of copying it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the file leaves, and the final list stands in one place
- the cleanup the sweep reveals rides the same change: the Go comments citing a deleted file now say what is
- the list stands once, on the port ticket, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
