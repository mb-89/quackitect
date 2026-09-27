---
kind: [[ticket]]
state: closed
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
  - step: answer
    hand: the engine
    stale: [[spec/tickets/rationale-drops-release-row]]
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 00f01a2b5ac11890412d3d2bf00bf3cf83aa5792
    hash_after: 00f01a2b5ac11890412d3d2bf00bf3cf83aa5792
    inputs:
      - name: ask
        hash: 0aae906b76d1f73b
        size: 961
      - name: [[spec/tickets/the-queue-moves-to-plan]]
        hash: ec8f43b68ad91062
        size: 13436
      - name: [[spec/tickets/rationale-drops-release-row]]
        hash: 217a401698f56467
        size: 4030
    def: 2280015d497a3abd
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: c9e50b5f92bbb2e27e36930330a6533ccc7df825
    hash_after: c9e50b5f92bbb2e27e36930330a6533ccc7df825
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/queue-approach-sentence-split.md:79:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: answer
        hash: 74d4a9d69648aef3
        size: 181
    def: 9395391d8c0e6392
reason: done
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Split the sentence naming `it.capture` under the approach of [[spec/tickets/the-queue-moves-to-plan]]. Or rule that the `tests` gate reads `check --errors` where a change touches no code. The door keeps every agent out of that approach. The queue hands [[spec/tickets/rationale-drops-release-row]] out ahead of the review that sends the draft back, so no agent reaches the fix.

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

Split the sentence. The owner rules the split is the answer, and the tests gate stays as it stands. The queue ticket closes, and its lint names no sentence past the cap.

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/contract/vale.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The owner rules the split is the answer. The queue ticket closes done, and ./RUNME.sh lint spec/tickets/the-queue-moves-to-plan.md names no sentence past the cap. rationale-drops-release-row passes do on a green check, so nothing waits on the split.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the answer: the lint over the queue ticket passes, and the release row ticket closes
- the cleanup it reveals stands as notes: the pull tool records a person as the hand
- the change adds no fact

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
