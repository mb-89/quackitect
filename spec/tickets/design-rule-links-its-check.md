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
    hash_before: db4fb41e8c7e54c303527b109d088fa491386662
    hash_after: db4fb41e8c7e54c303527b109d088fa491386662
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/a-cloud-group-asks-nobody.md:250:179: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

rule 4 of `spec/guidance/review/design.md` restates the refusal `spec/design_output/pull.md` owns. Link the check in its place.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/question-grades.test.js test/contract/process.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Rule 4 of `spec/guidance/review/design.md` links the table under "A finding rides out" in `spec/design_output/pull.md`, which owns the child-name refusals. The rule stops restating the cap and the taken name.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches rule 4 alone, as the ask names
- the change reveals no cleanup
- the refusals stand in the `pull.md` table alone, and rule 4 points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
