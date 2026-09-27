---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-landing-takes-a-verb/design/review
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
group: the-verbs-land-whole
parent: every-landing-takes-a-verb
record:
  - step: do
    hand: box d7a55188b9103 · claude-code-remote
    hash_before: 00e9a7c00bce93f41a5757b61a312dd0b428f977
    hash_after: 00e9a7c00bce93f41a5757b61a312dd0b428f977
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/rename.js:170:1: correctness/noUnusedFunctionParameters: This parameter to is unused."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a `git mv` under `spec/tickets` meets rule 6 and rule 7 both, and answers two rows for one command.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A `git mv` under `spec/tickets` answers `TicketMovesByRename` alone, which names the rename verb. The git-write rule leaves that command to it. [[spec/design_output/bash#git-writes-take-verbs]] owns the rule, and a case in `test/level0/bash.test.js` asserts the one row.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: one command answers one row, and the case asserts it
- the cleanup: none stands, because the branch carries the change already
- the rule stands in the design note alone, and this ticket points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
