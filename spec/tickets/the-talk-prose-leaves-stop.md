---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-stop-reads-the-state/design/review
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
parent: the-stop-reads-the-state
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 4617d7685207b334ceb740d75284b51f28befe0d
    hash_after: 4617d7685207b334ceb740d75284b51f28befe0d
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-joins-the-queue.md:161:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry th"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`spec/design_output/stop.md` names `the-owner-asks-to-talk` in the claimed-over-checks passage, in "A talk follows a report" and in the example rules block. The draft only updates the new rule and the `helpers-running` row, so rewrite or drop those passages along with the rule

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/contract/stop-rules.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`spec/design_output/stop.md` names the talk rule nowhere. The three passages read this way now:

- the claimed-over-checks passage names `the-owner-holds-the-step`
- `A talk follows a report` says a rule running `a-report-stands` fires on the needs table, and that no shipped rule runs it
- the example re-prompt block asks the owner-step question

A grep of every shipped file for the old id answers nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: each passage stands rewritten
- the cleanup: none stands
- each rule stands named in the rules file, and the design output points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
