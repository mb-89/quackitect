---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-queue-views-agree/design/review
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
parent: the-queue-views-agree
record:
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 9d9636b664b1242f2ac31ff359fac8ce5029854a
    hash_after: 9d9636b664b1242f2ac31ff359fac8ce5029854a
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "src/scripts/pull-hand-of.js:61:38: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    inputs:
      - name: ask
        hash: a450aa1637157a59
        size: 383
    def: 67a88a4c3e102bfa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the behind read touches `refsHere` in `src/scripts/work-stands.js`, `spec/design_output/work.md` and `remoteSaying` in `test/level0/work-doors.js`, which the ask leaves out. The group-row line needs them. `remoteSaying` answers neither `rev-parse origin/main` nor a `merge-base` per listed ref today, though the callers list says it does, so the builder adds both answers to the fake

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work-rows.test.js test/level0/work-list.test.js test/level0/work-stands.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fake remote in work-doors.js answers the trunk tip and a base for each listed ref. A ref reads level unless its case names an older base, and then it reads behind. The three behind cases name that base, so the fake owns both answers. The files the ask leaves out stand as the-queue-views-agree landed them, because the group row needs them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fake answers both reads the finding names, and the group row keeps the files it needs
- the cleanup this work reveals, the commit door reading a bare command, lands with the-queue-views-agree
- the trunk tip stands once in the fake, and each case names its base alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
