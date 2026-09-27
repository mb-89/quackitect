---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-road-has-a-caller/design/review
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
process_hash: 2b5ab398855a1aba
parent: every-road-has-a-caller
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 8a35e04867b8bec04a384ed584f2cf5af2a7a948
    hash_after: 8a35e04867b8bec04a384ed584f2cf5af2a7a948
    why: the-judge-leaves-the-code answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`judged` in `.claude/skills/level0/hooks/pull-tool.js` still stops on false alone. The first ask line stays unmet, and its case stands `todo`. The owner writes `judge.enabled !== true` there, and the case turns on.

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
