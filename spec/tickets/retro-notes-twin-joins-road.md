---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-become-actions/gate
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
parent: retro-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 730d2dacdbf9ecb950348d8d47d346d879ef164d
    hash_after: 730d2dacdbf9ecb950348d8d47d346d879ef164d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "test/level0/retro-usage.test.js:35:1: complexity/noAdjacentSpacesInRegex: This regular expression contains unclear uses "
    inputs:
      - name: ask
        hash: 7fc4c38f0d42a53b
        size: 203
    def: f77f3daa2180b2fe
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no red test holds retro notes in twinVerbs in src/quack/verbs.go, so the shadow done_when line passes with the twin left off the road; a case in src/quack/verbs_test.go asserts twinVerbs keys retro notes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The road keys retro notes among its shadow twins in src/quack/verbs.go, and TestTheRoadHoldsRetroNotesAmongItsTwins in src/quack/verbs_test.go asserts it. Before this case, dropping the twin from the table left every test green, so the shadow line of the ask passed with the twin off the road.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: one case asserts the twin table keys retro notes and the road sends it to both sides in shadow
no cleanup follows from a one-case test
the twin stands in twinVerbs alone, and the test reads that table

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
