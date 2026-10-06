---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: lease-waits-meet-a-fake-clock/gate
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
group: tests-meet-the-doors-once
parent: lease-waits-meet-a-fake-clock
record:
  - step: do
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 6dfbeb401e018bde23aea1559bcf256a49f188be
    hash_after: 6dfbeb401e018bde23aea1559bcf256a49f188be
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   93.8  in all"
    inputs:
      - name: ask
        hash: 54fd4bfa316ef1e6
        size: 162
    def: 4cf644d72e823f8e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

startHang stands at five minutes, the same span as RUN_TIMEOUT_MS in both contract suites. Set the guard under the suite timer, so the start names the hang first.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`startHang` in `src/index/main.go` stands at four minutes, under the five minutes each contract suite gives one run of the entry. So a hung index meets the start's own guard first, and the fault names the hang. The guard ends a wait where the index neither stands its door nor exits. Readiness decides every other wait: the door standing, or the index exiting. `TestAStartGivesUpOnAHungIndex` holds the guard on a fake start clock.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the guard sits under the suite timer
- the cleanup it reveals is in it: the new `starts` lands in the same change, with the wording point riding it
- the span stands once, as `startHang`, and the comment beside it names why it sits under the suite timer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
