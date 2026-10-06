---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-tests-meet-the-doors/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: go-tests-meet-the-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 64eae39231075495c292ec8e20977012f4920a42
    hash_after: 64eae39231075495c292ec8e20977012f4920a42
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes
      - name: check
        exit: 0
        said: "  114.7  in all"
    inputs:
      - name: ask
        hash: 9bbc9cfde4a928fb
        size: 224
    def: ce7faccd2ca3d01b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft says a contract test in its door's folder needs no key, but Door.Holds in src/owns/owns.go checks Files alone where a door names files; Holds answers true for a contract path whatever files says, and a case pins it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns/owns_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Door.Holds in src/owns/owns.go answers true for a path the door names under contract before it reads files. So a door naming files holds its contract tests too. TestADoorHoldsItsFolderOrItsFiles pins it, with a door naming files that holds test/contract/clock.test.js and leaves test/contract/disk.test.js out. It landed in 5dbf75bb3.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the gate point: Holds reads the contract key first, whatever files says
the change reveals no cleanup
the rule stands once, in Door.Holds, and the doors note points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
