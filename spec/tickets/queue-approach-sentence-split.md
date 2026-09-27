---
kind: [[ticket]]
state: open
step: answer
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Split the sentence naming `it.capture` under the approach of [[spec/tickets/the-queue-moves-to-plan]], or rule that the `tests` gate reads `check --errors` where a change touches no code. The door keeps every agent out of that approach. The queue hands [[spec/tickets/rationale-drops-release-row]] out ahead of the review that sends the draft back, so no agent reaches the fix.

Open the file on `work/open-tasks-land-in-shadow` and cut the sentence at line 122 in two:

    git checkout work/open-tasks-land-in-shadow && git pull
    $EDITOR spec/tickets/the-queue-moves-to-plan.md
    ./RUNME.sh lint spec/tickets/the-queue-moves-to-plan.md

- the pass of `rationale-drops-release-row` stands still at do
- the review of `the-queue-moves-to-plan` stands behind it in the queue

- `./RUNME.sh lint spec/tickets/the-queue-moves-to-plan.md` names no sentence past the cap
- `./RUNME.sh ticket pull rationale-drops-release-row --pass` answers that the step passes

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
