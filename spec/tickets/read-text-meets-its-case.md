---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: readers-take-the-go-topics/gate
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
group: read-topics-switch-over
parent: readers-take-the-go-topics
record:
  - step: do
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 0790635c4699aef6990d210b7d142e22928d7056
    hash_after: 0790635c4699aef6990d210b7d142e22928d7056
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 0bf0f819f11929d7
        size: 122
    def: 0582d525609d7fdb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

readsText in src/bridge/findings.js moves to quack prose per the approach, and no case in topic-readers.test.js decides it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/topic-readers.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

readsText in src/bridge/findings.js takes the past veto's kept findings off quack prose where migration.prose reads new, and topic-readers.test.js holds a case that runs it over a fake quack answer keeping nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the readsText case decides the move to quack prose
- the cleanup the change reveals stands in the group's first change
- every fact stands in one place: keptOf in quack-topic.js serves readsProse and readsText both

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
