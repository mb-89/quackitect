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
    hash_before: bb1cee6d59ca5ad4dc0f790be1d9fcff38d175e4
    hash_after: bb1cee6d59ca5ad4dc0f790be1d9fcff38d175e4
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

the draft gives `the-owner-holds-the-step` no `decides` and no `priority`, so nothing says it outranks `work-still-stands` (80) and `the-last-line-names-no-stop` (50), the rules that make the waiting turn loop. Name both in the rules file and in `spec/design_output/stop.md`

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

`the-owner-holds-the-step` in `spec/config/stop/level0.yml` decides by claim at priority `88`, with no `yields`. So it stands over `work-still-stands` and `the-last-line-names-no-stop`, the two continues that looped the wait. The case the owner's step outranks every continue that loops the wait, in `test/contract/stop-rules.test.js`, holds the rank.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the rule names its decision and its rank
- the cleanup: none stands
- the rank stands in the rules file once, and the case reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
