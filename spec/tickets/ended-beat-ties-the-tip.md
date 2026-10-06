---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: holds-beat-with-the-session/gate
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
group: boxes-hold-and-hand-back
parent: holds-beat-with-the-session
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: cdd49b15af4987f64558259353a031a63af7c9ed
    hash_after: 5059682d8ff95e8694d7430c3f8a9f0e234c9bd5
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.8  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: ad6fae52fdcd1af9
        size: 264
    def: 493538c21ebdc181
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach reads an ended beat dead where it stands newer than the tip, and dates carry seconds alone. TestAnEndedHoldMovesUnderTakeOverAtOnce stamps the beat in the same second as the tip, so a strict compare flakes. Read an ended beat dead at or after the tip.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/beat_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Git dates carry seconds alone, so both readers of a hold, the Go take and list and the push door, read an ended beat dead at or after the tip. A case stamps the end in the tip own second and takes the hold over.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change adds one case to the beat tests
- the case drives a real repository as the package tests do
- the case names the tie in its comment
- the compare stands once in each reader, and the design table names the rule

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
