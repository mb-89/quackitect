---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-finishes-its-asks/design/review
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
group: each-thing-stands-in-place
parent: the-retro-finishes-its-asks
record:
  - step: do
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 369747f2d2d23b0c32c84a8f997445dbbce5e624
    hash_after: 8679c99ea163b6a2e7ffa4de21f59b9be17cebf6
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a promotion carries `what`, `from` and `to` and no `id`, as `faultsOf` in `classes.js` reads it, so `mintFaults` names it by `what` or its place in the list, where the class loop names `one.id`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/retro-mint.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`mintFaults` in `src/engine/retro/mint.js` now reads `record.promotions` beside `record.classes`.

- a promotion whose `tickets` names nothing needs a `ticket` with `name`, `gain`, `breaks` and `done_when`, as an open class does
- a promotion carries no `id`, so `promotionName` names its fault by `what`, or by its place in the list where `what` stands empty
- `ticketFaults` holds the field check both loops share, so the rule stands in one place
- `mint` still walks the classes alone, and the parent ticket adds the promotion loop

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change follows the ask, or the discussion says why it departs: a promotion's fault reads `promotion "<what>"`, or `promotion <place>`, never `undefined`
- [x] the cleanup the change reveals is in the change, or is a note of its own: the class and promotion checks share `ticketFaults`
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: the ticket fields stand in `ticketFaults` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
