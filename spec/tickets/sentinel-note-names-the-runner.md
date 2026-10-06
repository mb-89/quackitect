---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: sentinel-fires-watches/gate
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
group: failures-stand-registered
parent: sentinel-fires-watches
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 0558800df12968672354fb309f4a9313ef1c282c
    hash_after: 0558800df12968672354fb309f4a9313ef1c282c
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 1ff62c8d0bdce062
        size: 335
    def: 3be54dfd84be35f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/failures.md says Sentinel takes the registry, the clock door and a hand, and that the engine runs the reaction, while src/failure/sentinel.go NewSentinel takes a Runner and runs the reaction itself, raising failure-reaction-fails; the note's chapter names the Runner and the sentinel as the hand running the reaction

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/failure/sentinel_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The sentinel chapter of the failures design note now matches the code. NewSentinel takes a Runner beside the registry, the clock door and the hand, and the sentinel runs a fired failure reaction through it, raising failure-reaction-fails where the reaction fails. The note said the engine ran the reaction, which no code does.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and names the Runner and the sentinel as the hand running the reaction
- the change reveals no cleanup
- the note names NewSentinel and the Runner, and src/failure/sentinel.go owns their shape

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
