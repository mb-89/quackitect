---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: cloud-boxes-ask-nobody/gate
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
group: the-engine-fixes-its-faults
parent: cloud-boxes-ask-nobody
record:
  - step: do
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 2f985b2f0954a30dd384a8d16a37b342320bb2c8
    hash_after: 2f985b2f0954a30dd384a8d16a37b342320bb2c8
    answered:
      - name: tests
        exit: 0
        said: green, 50 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: ask
        hash: 82e625c5652e38ff
        size: 167
    def: eee19cdc3d1d980c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`spec/design_output/level0.md` says under the answer hold that `AskUserQuestion` passes it. The cloud exception belongs there too, beside the two lists the draft names

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/answer-door.test.js test/level0/answer.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The answer hold in `spec/design_output/level0.md` said `AskUserQuestion` passes it. That holds on a desk. On a cloud box `holdsCloudAsk` refuses the ask first, so the note now says so beside the hold, and points at the file owning the door. The answer door's tests cover the hold the line describes, and the cloud case waits in `test/level0/cloud-ask.test.js` for its parent.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one sentence beside the hold line
- the change reveals no cleanup
- the note points at `src/bridge/cloud-ask.js`, which owns the door

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
