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
    hash_before: 8854e3aebe77a124ceb481bbf62652a66af43543
    hash_after: 08385dac91e25386e16895a85be938418eed0721
    answered:
      - name: tests
        exit: 0
        said: green, 32 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 623423ce8e322082
        size: 230
    def: 76beff46e9d5f076
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

size names src/scripts/dispatch-write.js and test/level0/work-doors.js, and the tests-red diff needed no work-doors change; drop what the build leaves untouched, and drop the --dry-alone refusal naming this ticket from dispatch.js

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

The build commit 061bd246 touches five files, and test/level0/work-doors.js stands among none of them. The size list stands under the draft leaf of the closed parent, so the parent's Discussion carries the true list. The refusal naming this ticket stands nowhere in dispatch.js, so no code changes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the Discussion says why the list lands under Discussion
- the cleanup is none: git show 061bd246 names the files, and dispatch.js holds no refusal
- the list stands once, under the parent's Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The `size` list stands under the draft leaf of the closed parent, so the files the build touches land as a list under the parent's `Discussion`. That list leaves out `test/level0/work-doors.js`. The refusal naming this ticket stands nowhere in `src/scripts/dispatch.js`.
