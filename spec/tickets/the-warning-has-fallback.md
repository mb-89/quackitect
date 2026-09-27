---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-reply-follows-its-prompt/design/review
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
parent: a-reply-follows-its-prompt
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 851a7ae372449579b7f535fc683775b86c2778e5
    hash_after: 851a7ae372449579b7f535fc683775b86c2778e5
    answered:
      - name: tests
        exit: 0
        said: green, 49 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-joins-the-queue.md:161:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry th"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The probe decides whether the session reads a `prompt.submit` event rewritten through `answer.event`. The probe table names the owner's fallback for the same-message road alone. Add the row for the rewritten prompt reaching no session: the ask's second line goes back to the owner with the probe's log

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

The probe's table now names a fallback for the warning too. Where the session reads the prompt without the `warns` line, that line goes back to the owner with the probe's log. The probe stands unbuilt, because this box loads no function hooks. Its table rides the note `the-probe-reads-the-reply`, and the group's retro decides that note into a ticket.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the row for a rewritten prompt reaching no session stands beside the same-message row
- the cleanup: the probe's two questions stand in one table, in one note
- the table stands in the note alone, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
