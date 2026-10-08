---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-verbs-raise-and-register/gate
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
group: failures-stand-registered
parent: failure-verbs-raise-and-register
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: fc2c608f22299b4a2b46ffd5924e3ac9334c4c4c
    hash_after: 3dd7bfc928123b4abb844c586e9e62f60d650988
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: ecb179b12e7f1b35
        size: 213
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

count keys each row by jsText of its failure field, so a failure row with no id counts under undefined. Skip it. logFiles also reads the rotated files, wider than the session log the ask names, so name that scope.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

failure count keeps a row only where its kind is failure and its failure field holds an id, so a row naming no id counts nowhere. It reads the session file alone, since a retro collects the rotated files, and the function comment names that scope.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: TestFailureCountAnswersEachIdWithItsCount holds a row with no id and one with an empty id, and neither counts
- the cleanup the verb points reveal rides the same change, each with its own case
- the session log path stays in sessionLog, and the count reads it from there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
