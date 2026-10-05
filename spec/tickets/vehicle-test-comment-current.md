---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: window-verbs-run-in-go/accept
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
group: window-verbs-run-in-go
parent: window-verbs-run-in-go
record:
  - step: do
    hand: box 05659fab4226 · claude-code-remote
    hash_before: d6b1d021051a61186ebfa05df6a1261904f18efa
    hash_after: ac16a8111c510eb04f55360bba3706e55687b317
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/verbs passes
      - name: check
        exit: 0
        said: "   66.7  in all"
    inputs:
      - name: ask
        hash: db71aefcadd69181
        size: 83
    def: 66bb314c32a9b6ac
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/verbs/vehicle_test.go names theVehicle, which left with vehicle-verb.js

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The comment over the vehicle action case in src/modules/verbs/vehicle_test.go named theVehicle, the JavaScript function that left with vehicle-verb.js. It now names vehicleTwin in src/quack, the Go verb that answers the vehicle words. The stub case comment names the node module, the index module each action hands its words to, so it stays.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the comment names the function that answers now
- the cleanup: the stub comment beside it reads true and stays
- each fact stands once: the comment points at the verb, and src/modules/verbs/vehicle.go names its file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
