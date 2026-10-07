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
    hash_before: e725d847b071742c7fef5dfdb60daccffaab53f4
    hash_after: e725d847b071742c7fef5dfdb60daccffaab53f4
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "    2.0  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 04cd056225c057a4
        size: 158
    def: d907da3320d46c29
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ratio rule says fixtures count toward the test lines and the ceiling stands near one to one per package, in the owner's words, beside the ratio guard link

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

Rule 7 of spec/guidance/code/testing.md carries the ratio in the owner words: fixtures count toward the test-to-code ratio, which is about 1:1 at most per package. It names the ratio guard and links the model section owning the guards. The rule sits beside the fixture rule, since the guidance schema caps a note at 15 items. The change touches no code, and ./RUNME.sh lint reads the note clean.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, in the owner words, beside the ratio guard link
the cleanup: none revealed
one place: the model section owns the guard, and rule 7 points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
