---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-port-to-go/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: retro-verbs-run-in-go
parent: retro-verbs-port-to-go
record:
  - step: do
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: ef4392ae17d6bdcda5d2071ea8d8828cddab99dc
    hash_after: ef4392ae17d6bdcda5d2071ea8d8828cddab99dc
    answered:
      - name: tests
        exit: 0
        said: green, 20 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   73.1  in all"
    inputs:
      - name: ask
        hash: 044df26da4755c1a
        size: 192
    def: 6733c78151e933e7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

pull.js lets any hand that sets SE_MINTED in its env pass the queue; bind the pass to a name the mint wrote for this session, or state the cost in spec/design_output/config#the-engine-controls

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-leaves.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The ask offers two roads, and this takes the second: spec/design_output/config.md, under The engine controls, now says how Go retro new hands its child pull the queue pass through SE_MINTED, and what that costs. Binding the pass to a name the mint wrote needs a record of the session's mints, and the mint and the pull belong to other groups of phase 11, which port them now. The private note se-minted-skips-the-queue carries the cage refusal to the retro, which decides it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the cost stands in the chapter the ask names
- the cleanup it reveals: the stale line saying retro new sets minted in process now says what is
- the fact stands once: the design note states the pass and its cost, and the note and this ticket point there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
