---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: prose-checks-run-in-go/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: prose-checks-run-in-go
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: f3452632da99c4720ef469541f0742c55155f2e3
    hash_after: f3452632da99c4720ef469541f0742c55155f2e3
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: ask
        hash: e42d7a433a0eae95
        size: 173
    def: 76c1d849e1b5a0b5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the rows test shadowProse alone, so an unwired shadow passes every test while log --kind shadow stays empty; add a case per caller that reads the shadow row off the fake log

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prose-shadow-wiring.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

test/level0/prose-shadow-wiring.test.js drives each caller of the prose shadow, readsProse, findingsOver and voiceOver, over fake doors, and reads one shadow row off the fake log where migration.prose reads shadow, and none where it reads old. An unwired caller now fails a case. The file landed with prose-shadow-hooks-reads-text, whose change it proves.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: one case a caller, each reading the row off the fake log.
The change reveals no cleanup.
The fake doors stand once, in the test file.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
