---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: one-review-a-ticket/verdict
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
parent: one-review-a-ticket
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: dca96a657a3148c2a80dfafad93f68ecff200332
    hash_after: dca96a657a3148c2a80dfafad93f68ecff200332
    answered:
      - name: tests
        exit: 0
        said: green, 63 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/findings-reuse-the-note-mint.md:62:1: Shape: A run holds 3 paragraphs with no list, table or diagram betwee"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`minted` in `src/scripts/pull-writes.js` copies the note mint of `src/scripts/ticket.js` and skips its `askFaults` read. Build both through one function.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-findings.test.js test/level0/pull-leaves.test.js test/level0/ticket-verb.test.js test/level0/ask-lint.test.js test/level0/pull-fails.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`routedTicket` in `src/scripts/ticket.js` mints a ticket off a route and reads its Ask through `askFaults`. `note` and `minted` both call it, so one function owns the mint.

The pull's evidence read refuses a private name on the verdict row before `minted` runs, and a child's Ask is that row. So the Ask read on a child refuses nothing new, and the existing tests of both callers cover the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `ticket.js` and `pull-writes.js` alone, as the ask names
- the cleanup drops the imports the shared mint replaces
- the mint stands in `routedTicket` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
