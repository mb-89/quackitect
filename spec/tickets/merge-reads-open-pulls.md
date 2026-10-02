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
    hash_before: b51f0e318950b6c98b7c2815d241ae65b810912a
    hash_after: b51f0e318950b6c98b7c2815d241ae65b810912a
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 8749b7a299d1bc3d
        size: 179
    def: c1e6301a5c8b9caf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

refs/pull/<n>/head stays on origin after a pull request closes unmerged, so the refusal holds a closed pull's branch until a new commit; give the refusal a road past a closed pull

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-merge-cloud.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch merge refuses a branch whose tip a pull request head carries. A closed pull keeps that head ref on origin, and git reads no pull state, so the refusal held a closed pull's branch until a new commit. The refusal now names a road past it: the person who sees the pull closed runs branch merge with --closed, and the merge runs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the refusal names --closed, and --closed runs the merge
- no cleanup shows past the refusal and its note line
- work.md carries the road once, and the code comment points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
