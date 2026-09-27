---
kind: [[ticket]]
state: open
step: do
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
record:
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 073ee8bceb5f741069f3b62ef927ce9165d4395e
    hash_after: 073ee8bceb5f741069f3b62ef927ce9165d4395e
    inputs:
      - name: ask
        hash: 0aae906b76d1f73b
        size: 961
      - name: [[spec/tickets/the-queue-moves-to-plan]]
        hash: ec8f43b68ad91062
        size: 13436
      - name: [[spec/tickets/rationale-drops-release-row]]
        hash: baca88acba217ea8
        size: 3558
    def: 2280015d497a3abd
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

Split the sentence. The owner rules the split is the answer, and no change to the tests gate. The approach of the-queue-moves-to-plan now stands closed, so a hand writes the split there.

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

The owner rules the split is the answer. The door keeps every agent out of `approach` and `seen`, closed ticket or open, so the owner's hand in the editor makes the split. In `spec/tickets/the-queue-moves-to-plan.md`:

| the line | the text it takes |
|---|---|
| the approach, the row sentence | A row carries what the two read off a ticket. That is the name, the path, the group, the todo and the mark, then `depends_on`, the failed hand-backs and the plan's order. |
| the approach, the capture sentence | `placesIn` in `src/scripts/work-answer.js` takes an optional `it.capture`. It hands the hook the free lists before the sort, the rows in hand and every row. It hands it the overrides, the add days, the weights, the clock and the answer too. |
| tests-red, `seen` | Every new case fails on its own assertion over stubs that answer nothing. The queue reads an empty list, the outline an empty map, and every compare reads even. |
| tests-red, `checked` | two items: the Go cases read the rows a caller hands in, and the capture case runs over the fake doors in `work-doors.js` |

The `do` step passes on `./RUNME.sh lint spec/tickets/the-queue-moves-to-plan.md` once the split stands.
