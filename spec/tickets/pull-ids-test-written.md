---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
group: failures-stand-registered
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 4610c803ba5e0b04a308426cc57941dd1b1bc33d
    hash_after: 3672f4030c81334fc379ae91da6cc00357ad889c
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "  118.8  in all"
    inputs:
      - name: ask
        hash: 4a1698ab95306eca
        size: 230
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the done_when line where go test ./src/pull/ reads the ids meets no red test, since tests-red wrote TestMovedRefusalsPassTheFailureDoor alone and none of the four tests the draft names; write them at implement against failure.Fake

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/pull/pull_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestRefusalsNameTheirIds in src/pull/pull_failure_test.go drives the cloud pull into eight refusals over a fake registry. Each row checks the id at its level and its remedy beneath the message, and the log row carrying the id. Two cases beside it check stillHeld and the branch check the same way. The mint's ids stand checked in src/quack/verb_mint_test.go, and the take's case rides take-moves-stands-refusals, since the take raises no id yet.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask for the pull: go test ./src/pull/ reads the ids; the take case moves to the take ticket, where its ids land
- the cleanup the change reveals: none past the take case, which its own ticket carries
- every fact stands in one place: the cases read the ids the sites raise, and copy no remedy off a node

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
