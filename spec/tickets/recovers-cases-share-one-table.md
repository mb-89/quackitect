---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: copilot-hooks-run-in-go/gate
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
group: javascript-leaves
parent: copilot-hooks-run-in-go
record:
  - step: do
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 1e0fe3e31c57e89346650201a87e0ab7128f39a5
    hash_after: 0c189442e6f71803c904b9892d131d3ced813ba9
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   90.4  in all"
    inputs:
      - name: ask
        hash: b887f3df6f4c6e76
        size: 173
    def: 8ef89bb937e4b7cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the recovers cases move to one table under `src/modules/hooks/testdata`, which `down_test.go` and `cage.test.js` both read, so the JS cage and the Go port hold one contract.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/cage.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The commands a down hooks door lets through, and the ones it keeps guarded, stand in `src/modules/hooks/testdata/recovers.json`. The JS cage test imports the table, and the Go port of the guard embeds it. A case added there reaches both, so the two guards hold one contract.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change follows the ask.
- The Go case stays red on its own assertion until the copilot ticket ports the guard.
- The cases stand in the table alone, and both tests point at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
