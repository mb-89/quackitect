---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-land-through-pull-requests/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: groups-land-through-pull-requests
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 8b2dabca78f9e134a0e6c41ca8339960e4b2e062
    hash_after: 8b2dabca78f9e134a0e6c41ca8339960e4b2e062
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e0eefdaa96530ac1
        size: 170
    def: c1e6301a5c8b9caf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

leaves in src/scripts/work.js ends on "Run ./RUNME.sh branch merge <name> from main", and the approach leaves that line; point it at the pull request the work skill opens

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-done.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch done ended by telling the box to run branch merge from main, which the pull request road retires. It now tells the box to open the pull request over the branch against main with auto-merge on, as the work skill says. The done case asserts the new line and the absence of branch merge.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the last line of leaves points at the pull request
- the desk review list in work-review.js keeps branch merge, since a desk still merges there
- the line points at the work skill and the design input, and repeats neither

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
