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
    hash_before: 67763afd77debc3f28c6bb33068bd1eae5fc1f6b
    hash_after: 139668c9bebfc7b1d09b95ca66589c9735495744
    answered:
      - name: tests
        exit: 0
        said: green, 32 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f85e114a966e3669
        size: 129
    def: 76beff46e9d5f076
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no case holds the .se/.runtime/dispatch worktree removed and the box checkout unmoved after a run; add one beside the write cases

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

The case holding the worktree removed after a push, with the box checkout unmoved, stands in test/level0/dispatch.test.js from dispatch-cuts-the-fix-name. This adds its twin over a refused push: land removes the worktree in its finally, and no case drove that path. The new case goes red with the finally removal gone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and adds the refused path the standing case leaves open
- the cleanup it reveals is the untested finally, and the new case holds it
- the case reuses the standing helpers and constants, so each fact stands in one place

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
