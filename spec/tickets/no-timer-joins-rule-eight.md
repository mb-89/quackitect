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
    hash_before: 6dcbae7a0c500653adfada2c5471165ee0e978ce
    hash_after: 6dcbae7a0c500653adfada2c5471165ee0e978ce
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "    2.0  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: fe63f53b9f7f3cf4
        size: 172
    def: d907da3320d46c29
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

testing.md rule 8 already says take the clock as an argument; the no-timer rule extends rule 8 with the purity guard's clock kind and its link, and stands as no second rule

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

Rule 8 of spec/guidance/code/testing.md takes the no-timer rule: start no timer in a test, and the purity guard names a function reaching the clock in place, with the link to the model section owning the guards. No second rule stands. The change touches no code, and ./RUNME.sh lint reads the note clean.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: rule 8 carries the no-timer rule and the purity link
the cleanup: none revealed
one place: the model section owns the clock kind, and rule 8 points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
