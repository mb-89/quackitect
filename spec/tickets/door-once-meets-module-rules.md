---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: code-and-test-rules-stand-in-guidance/gate
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
group: code-is-pure-tests-behave
parent: code-and-test-rules-stand-in-guidance
record:
  - step: do
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: ee88ee6645c66567018bdb3bcd41834ac124d82f
    hash_after: ee88ee6645c66567018bdb3bcd41834ac124d82f
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "    2.1  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 769749a0fc347cc3
        size: 271
    def: d907da3320d46c29
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the door-once rule (the command line first, a module port only for an edge the command line cannot reach) contradicts testing.md rules 11 to 14 as written, which send every Go module to the fake index; the implement step rewords 11 to 14 as the port tests for those edges

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/guards_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Rule 11 of spec/guidance/code/testing.md opens on the door-once rule: test a behavior at the command line, and take the fake index for an edge it cannot reach. Rules 12 and 14 open on the same edge, so the module rules read as the port tests the command line leaves. The rationale argues it under section 11. The change touches no code: ./RUNME.sh lint reads both notes clean, and the tests field names a green test since a field expecting green cannot take the check.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and folds door-once into rule 11, since the guidance schema caps a note at 15 items
the cleanup: the cap binds the implement step, which adds the other test rules, so they fold into standing rules too
one place: the rationale holds the argument, and rule 11 holds the instruction

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
