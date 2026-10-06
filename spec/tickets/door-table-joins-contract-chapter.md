---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: each-door-meets-one-test/gate
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
group: tests-meet-the-doors-once
parent: each-door-meets-one-test
record:
  - step: do
    hand: box 0e8770600b2b · claude-code-remote
    hash_before: 157e9a2c998b1851ab5b1ea06254a8528df91871
    hash_after: 157e9a2c998b1851ab5b1ea06254a8528df91871
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  115.3  in all"
    inputs:
      - name: ask
        hash: 4430f1a82728536e
        size: 120
    def: d6b34b181afb7e04
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the doors note already holds One contract test per door, so the audit table extends that chapter and opens no second one

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/cli-doors.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The chapter One contract test per door in the doors note takes the audit table, and opens no second chapter. One table names each JavaScript door, its fake and its contract suite, and one names each Go door the same way, a door with no fake or no suite among them. A third names each family of tests reaching a real door outside those suites, with its fate: a door test, a build once a package run, or a move onto a fake under a child ticket. The note names the one state a module holds, the memo namePatterns, as the named exception. The change touches no code, so the doors suite and the check cover it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the table extends the standing chapter, and no second chapter opens
- the cleanup it reveals rides as fates in the table: the branch verbs, the quack verbs, the pull and the index and session suites each name a child ticket the parent mints
- every fact stands in one place: the fake contract points at the model note, and the table names files, not their counts

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
