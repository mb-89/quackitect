---
kind: [[ticket]]
state: closed
group: the-verbs-answer-their-asks
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
step: do
record:
  - step: do
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: d534080231656c1cb52e33de5437ef8493c55dbc
    hash_after: d534080231656c1cb52e33de5437ef8493c55dbc
    answered:
      - name: tests
        exit: 0
        said: green, 26 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 3 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A ticket whose ask another group answers closes on the road it stands on.

<!-- breaks, as text: what breaks if it is never done -->

| where the hand stands | what it meets |
|---|---|
| `implement/tests-red` on a `standard` route | a leaf taking a red test, where the ask wants no hunk |
| the fail road | the leaf goes back to itself, and the cap parks it |
| the next box | the same ask, and the same wall |

`state: closed` takes `done` or `became`, and neither says another ticket answers this ask. [[spec/tickets/a-return-asks-another-hand]] stands at that wall today.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a hand closes a ticket whose ask stands answered, and the record names the work answering it
- the close runs through the pull, so the route and the record hold it
- `./RUNME.sh test` covers the close and the reason it writes
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The hand-back takes a fourth verdict, `--answered <ticket>`. It closes the
ticket in hand with `reason: answered`, and the record entry's `why` names
the ticket answering the ask. The pull refuses the flag bare, a ticket
standing nowhere, and the ticket naming itself. The hand-back checks the hold
and the hand, as a became does. It reads no field of the leaf, because the
answering ticket carries the evidence.

| what changes | where |
|---|---|
| the verdict flag, and its dispatch | `src/scripts/pull.js` |
| the close, and the record entry | `src/scripts/pull-writes.js` |
| the tool's input, and its argv | `.claude/skills/level0/lib/pull.js`, `src/scripts/pull-tool.js` |
| the reason enum | `spec/schemas/ticket.schema.yaml`, and the two copies the tests serve |
| the road, beside became | [[spec/design_output/pull#answered]] |

Why: a ticket standing at a leaf its ask no longer wants meets a red test or
the fail road. Neither `done` nor `became` says another ticket answers it. The
reason and the record say so now, and the group's children step counts the
close as a pass.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the close runs through the pull, and the record names the answering ticket
- the cleanup the change reveals is in the change: the usage lines, the tool enum and the schema copies
- every fact stands in one place: the road stands under [[spec/design_output/pull#answered]], and the code points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
