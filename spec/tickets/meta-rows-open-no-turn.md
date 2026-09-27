---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: answers-read-the-last-text/design/review
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
parent: answers-read-the-last-text
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: b029ad717c9c42574f610a707e5c50954130c112
    hash_after: b029ad717c9c42574f610a707e5c50954130c112
    answered:
      - name: tests
        exit: 0
        said: green, 18 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-joins-the-queue.md:161:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry th"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a transcript `user` row with `isMeta` or `isCompactSummary` carries no `tool_result` block, so the approach reads it as an owner row and cuts a turn there, scoring a progress line before it as an answer. Take an owner row as one carrying neither mark, and add a case in `test/level0/verbs.test.js`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/verbs.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The change under `answers-read-the-last-text` built `opensTurn` in `.claude/skills/level0/lib/voice.js` to skip a row marked `isMeta` or `isCompactSummary`. The case a tool result row and a meta row open no turn, in `test/level0/verbs.test.js`, puts both marks between a progress line and the answer. It gets the answer back alone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: an owner row carries neither mark, and a case holds it
- the cleanup: none stands
- the rule stands in `opensTurn` once, and this ticket points at the case

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
