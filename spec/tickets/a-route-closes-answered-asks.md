---
kind: [[ticket]]
state: open
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
