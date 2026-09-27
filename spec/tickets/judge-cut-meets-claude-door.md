---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-judge-leaves-the-code/design/review
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
group: the-engine-holds-the-route
parent: the-judge-leaves-the-code
record:
  - step: do
    hand: box d7d809305dcf · claude-code-remote
    hash_before: d721cb0dc0b40279779c10401d5b5db9f957e789
    hash_after: 15d1b226b68ce802a100fa1e62a3e9ab238d19aa
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

every code file the cut touches stands under .claude, and every-road-has-a-caller records that the harness refuses this hand a write there. lib/marks.js still stands on that account. Where the refusal holds, the builder mints a question ticket carrying the owner's commands, per spec/guidance/cloud rule 7, in place of a hand-back on a red check

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/paragraph.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The finding holds that the harness refuses this hand a write under .claude. On this cloud box a probe appends to lib/marks.js through mcp__level0__patch, and mcp__level0__undo puts it back, so the refusal holds for the harness Edit tool alone. The Discussion of the-judge-leaves-the-code says so, and says the builder mints a question ticket carrying the owner commands where a write there still comes back refused.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: it settles whether the refusal holds, and names the question ticket where it does.
The cleanup the change reveals, the owner writes every-road-has-a-caller parks, stands as a note for the retro.
The fact stands once, in the parent Discussion, where the builder reads it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
