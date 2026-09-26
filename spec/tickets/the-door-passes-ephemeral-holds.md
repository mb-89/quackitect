---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-todo-joins-the-queue/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-gates-read-the-state
parent: the-todo-joins-the-queue
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 95d67aff16c594533d5cd32eb13796817cc24f6a
    hash_after: 95d67aff16c594533d5cd32eb13796817cc24f6a
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-road-stands-first.md:39:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

an ephemeral ticket stands in the hold alone with no file, so `ticketFault` passes the held name before it reads the folders, and a case drives it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/named.test.js test/level0/bash-ticket.test.js test/level0/pull-todo.test.js test/level0/bash-commit.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`ticketFault` in `src/engine/named.js` reads the held names before it reads the ticket folders, so an ephemeral ticket passes with no file behind it. The case an ephemeral hold's ticket passes with no file behind it, in `test/level0/named.test.js`, holds it. This commit carries the parent's whole change, which its own close names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the held name passes ahead of the folder read
- the cleanup: the case in `bash-commit.test.js` now names the ticket its hold carries
- the rule stands in `level0.md` under `A write names its ticket`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
