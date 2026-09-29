---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: pull-verbs-become-actions/gate
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
group: quack-verbs-land-in-shadow
parent: pull-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: f117b517098b19c70bc337b4b6c3940116b950af
    hash_after: f117b517098b19c70bc337b4b6c3940116b950af
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: fa76b29ef26ac28b
        size: 194
    def: 894320b5dd55a1cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list names pull-hand.js once, but holdsVerb answers there at two sites, the hand-out filter at line 285 and the lacking check at line 426; the builder wires or leaves each on purpose

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/branch-needs.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull ticket named pull-hand.js once among its callers, where holdsVerb answers in two functions. A table under its Discussion names takeable and admits, and names WORK_VERBS as the owner of the branch verbs. The engine owns the draft fields, so the correction stands where the implement step reads it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and lands under Discussion since the door keeps the draft fields to the engine
- the table also names the table that replaced BRANCH, which the earlier fix revealed
- each caller stands once in the table, and the file owns the code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
