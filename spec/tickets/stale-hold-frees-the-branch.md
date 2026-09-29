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
step: do
group: loose-fixes-99f4547
record:
  - step: do
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 1008c8da753be30fbd933e5d1bf7ed202ccdcf1b
    hash_after: 1008c8da753be30fbd933e5d1bf7ed202ccdcf1b
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 55a118ea4d6696c2
        size: 606
    def: df12650931d480c9
reason: done
---

# Ask

A work branch frees itself once its tip stands quiet past `work.staleAfter`. A fresh box then takes it over, and the queue keeps moving.

Without it, the push door refuses every push to a branch no box works. That covers `branch release` and a fresh `branch take`, so the branch stands locked for good.

- `./RUNME.sh test test/level0/prepush.test.js` passes a stale hold, and refuses a fresh one
- `./RUNME.sh test test/level0/work-held.test.js` takes over and releases a stale hold, and writes the hand-over in the record
- `./RUNME.sh config work.staleAfter` answers `30m`
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh test test/level0/prepush.test.js test/level0/work-held.test.js

## check

./RUNME.sh check

## says

The work landed on main through PR 29, commit 645be27b3, before this group took the ticket, and this branch carries main. A hold whose tip stands quiet past work.staleAfter frees its branch, so a fresh box takes it over. The prepush and work-held tests pass, and work.staleAfter answers 30m. So this step passes on that evidence, and redoes nothing.

## checked

- the change stands on main as the ask names it, and nothing departs
- the verification reveals no cleanup
- the stale span stands once, as work.staleAfter in spec/config/level0.json

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
