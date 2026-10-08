---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: lint-without-vale
step: do
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 8f590c7d414b0901c3583b809d2dc9857a1558aa
    hash_after: cd3dd99aaa103d373aee0f8a7be96e13d84f295d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   62.8  in all"
    inputs:
      - name: ask
        hash: 62f8f05b76cac26f
        size: 490
    def: df12650931d480c9
reason: done
---

# Ask

A vehicle's lint reads the method's rules under the project's own, as the wiring reads the work root and then its vehicle.

The rules load reads the work root alone. A project under a vehicle holds no `spec/config/styles`, so its load fails, the readers go quiet and the editor draws `RulesLoad` on every file.

- `./RUNME.sh branch test src/quack/rules_test.go` passes a case where a rule file stands under the vehicle alone and loads.
- `./RUNME.sh check` exits 0.

view: none

from: none

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/rules_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rules load reads each rule file from the work root, and else from the vehicle the binary stands in, as the wiring reads. A project under a vehicle holds no spec/config/styles, so before this its load failed and every reader went quiet. The removed styles assembly once brought the method's styles down under the project's own, and this keeps that road with no copy.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: a rule file under the vehicle alone loads, and the work root's file stands over the vehicle's
the cleanup the change reveals: none, since rulesAt keeps its callers and the cache keys on the pair
every fact stands in one place: the vehicle comes from vehicleOf, which the wiring reads too

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
