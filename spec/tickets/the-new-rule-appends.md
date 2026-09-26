---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-small-ask-stays-small/design/review
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
group: the-owners-word-reaches-work
parent: a-small-ask-stays-small
record:
  - step: do
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: f130d8cc6b2d7951eb3d69dd93b2d948def3689d
    hash_after: f130d8cc6b2d7951eb3d69dd93b2d948def3689d
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-owners-words-travel-verbatim.md:154:1: ListItem: A sentence in a list item holds 20 words, and this one"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a rule placed after rule 6 in `spec/guidance/tickets.md` renumbers rules 7 to 15, and `spec/rationales/tickets.md` sections 8 to 15 and the `Examples` rows 11 and 14 key on those numbers. Append the rule as rule 16, or renumber every reference with it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/question-grades.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The trivial route joins rule 6 of `spec/guidance/tickets.md`, the rule that owns the mint. The note stands at its rule cap, so a sixteenth rule meets the lint.

No rule moves its number, so every rationale section and `Examples` row keeps its key. The rationale argues it under `## 6.`

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change departs from the ask's two roads, since the cap refuses rule 16, and this ticket says why
- no cleanup stands revealed
- the rule stands once, in rule 6, and the rationale points at its number

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
