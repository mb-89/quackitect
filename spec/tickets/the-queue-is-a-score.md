---
kind: [[ticket]]
state: open
urgent: true
depends_on: [one-urgency-stands]
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-work-editor-draws
step: do
---

# Ask

The pull drops what waits, then sorts the rest by an urgency word. So a ticket
three others wait on takes the place its own word names, as though it stood
alone. The thing unblocking the most work goes last as often as first.

A score answers it. Each term weighs one fact, the config holds the weights,
and the queue reads the sum:

| the term | what it does |
|---|---|
| urgent | overrides every other term, so an urgent ticket goes first |
| how many tickets wait on this one | raises it, and the more wait the higher |
| the chain under it | the count walks the whole chain, so a blocker of a blocker counts |
| how long it has stood | raises it, so nothing sits forever |
| how often a hand failed on it | raises it |
| waiting on a ticket still open | out of the queue, and the board still draws it |
| a step a person owns | out of the agent's queue, and first in the person's |

Taskwarrior weighs urgency this way, and the term this tree lacks is the one
for blocking others. `depends_on` and `successors` both stand in the schema, so
the graph is there to walk.

The walk reaches the whole chain. A ticket blocking one that blocks ten counts
eleven, so the thing at the root of a stalled chain rises to the top. At the
scale this tree carries the walk costs nothing worth naming.

Two rules keep the number honest:

- The weights stand in `spec/config/level0.json`, beside `failsBeforePerson`.
  So tuning the queue costs an edit.
- One decider answers, and the column reads it. A board disagreeing with the
  pull is worse than a board with no column.

A hand failing `work.failsBeforePerson` times already puts a person step in, and
`branch escalate` runs the same road. So a ticket leaving the agent's queue for
a person is a rule this tree holds, and the score reads it.
[[spec/design_output/pull#a-person-step-goes-in]]

The gain is a queue that says what to do next, and says why.

- the score reads the terms above, and the config holds every weight
- a ticket more tickets wait on scores above one fewer wait on
- a ticket waiting on an open ticket leaves the queue, and the board draws it
- a flag on the verb writes the order, and the column reads that answer
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

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
