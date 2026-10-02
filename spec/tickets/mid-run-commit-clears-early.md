---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-split-deployment-takes-over/gate
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
group: module-processes-switch-over
parent: the-split-deployment-takes-over
record:
  - step: do
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: d1eab366bf4f81540199dcecef1d9af9b3f4625c
    hash_after: d1eab366bf4f81540199dcecef1d9af9b3f4625c
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/the-split-deployment-takes-over.md:293:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: cebac4a131c19e23
        size: 159
    def: 3134c855268208f1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the pending mark is a bool, so a commit answering an earlier run clears a run sent while the process computes, and a reader then reads before the second answer

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/placements_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Placements in src/index/procs.go numbers the runs it sends each instance. Each inputs ask the process makes records how many runs it covers. A commit clears the instance's wait only where that ask covers every run sent. A module process folds the runs that reach it mid-compute into one later run, so a count of runs against commits overcounts, and the number an ask covers holds. An exit still clears the wait, and a restart's first ask covers every run sent while it stood down. TestACommitAnsweringAnEarlierRunHoldsTheSettleForTheLater plays the process over a peer. It goes red on the old bool, where the settle ends on the answer to the first run.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the mark the reader waits on now reads the run the commit answers
- the cleanup: quack io asks no inputs, and no IO instance reads a wire today, so the guard its own ticket asks for stays there
- one place: the sent and covered maps stand in Placements beside pending and gone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
