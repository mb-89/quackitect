---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: dispatch-writes-the-bundles/gate
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
parent: dispatch-writes-the-bundles
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: fed248a140a261d0783c5b67d7c407254d11c117
    hash_after: 8269139533e5b20b234f429bfaf85a02ff5a6b6a
    answered:
      - name: tests
        exit: 0
        said: green, 32 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 1426f0bce0761427
        size: 234
    def: 76beff46e9d5f076
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach opens work/<name> on a commit off the trunk tree, which markOff in src/scripts/work.js already makes but does not export; export it and call it from dispatch, and add src/scripts/work.js to size, in place of a second copy

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit 061bd246 makes the change: work.js exports markOff, dispatch-write.js calls it, and the dispatch tests hold the commit it answers. The size list stands under the draft leaf of the closed parent, so the parent's Discussion names work.js in its place.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask in code, and the Discussion says why the size line lands under Discussion
- the cleanup is none: one markOff stands, and dispatch-write.js imports it
- the parent's Discussion points at the commit, and repeats no code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- Commit `061bd246` exports `markOff` from `src/scripts/work.js` and calls it from `src/scripts/dispatch-write.js`, and `test/level0/dispatch.test.js` holds it. The `size` list stands under the draft leaf of the closed parent, and a hand here writes no evidence under another leaf. So the file lands as a line under the parent's `Discussion` in its place.
