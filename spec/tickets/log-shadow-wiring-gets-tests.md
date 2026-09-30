---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-topic-lands/gate
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
parent: the-log-topic-lands
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 61a4a9ada9e1914d999a8ece4ac716cd9d45e7ab
    hash_after: 61a4a9ada9e1914d999a8ece4ac716cd9d45e7ab
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 8fe2134e246d1334
        size: 227
    def: 6c1ad5c4fe724f6a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/log-shadow.test.js calls logShadow alone, so the log verb in src/scripts/log-verb.js can drop the call while every case passes; add a case that runs the verb over fake doors and reads the shadow row off the fake log

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/log-shadow-wiring.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

test/level0/log-shadow-wiring.test.js runs the log verb over fake doors, and reads one shadow row off the fake log where migration.log reads shadow, and none where it reads old, so a verb that drops the shadow call now fails a case. The shadow row carries the stamp of the row read apart as stamp, since the log door writes its own at over any field of that name. The file landed with log-shadow-reads-unfiltered-rows, and the log golden lands here.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: a case runs the verb and reads the row off the fake log.
The cleanup the change reveals rides in it: the golden the log tests read lands beside the case.
The fake doors stand once, in the test file.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
