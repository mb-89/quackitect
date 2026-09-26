---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-owners-words-travel-verbatim/design/review
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
parent: the-owners-words-travel-verbatim
record:
  - step: do
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 8c51fde3dee50bd4f5a80cdff8b2ea6f07a433ad
    hash_after: 8c51fde3dee50bd4f5a80cdff8b2ea6f07a433ad
reason: became
successors: [the-owners-words-travel-verbatim]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft carries no `size` list, and its route copy predates the `size` field of `spec/processes/standard.yaml`. The approach reaches files the ask leaves out: `spec/processes/standard.yaml`, `src/scripts/pull-when.js`, `.claude/skills/level0/lib/schema-mint.js`, `test/contract/process.test.js`, `test/contract/question-grades.test.js`, and every handover writer

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
