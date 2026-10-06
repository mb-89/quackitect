---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-verbs-raise-and-register/gate
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
parent: failure-verbs-raise-and-register
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: f0d1a245c96f290a2a1bf2412a41a1bbc05506a9
    hash_after: f0d1a245c96f290a2a1bf2412a41a1bbc05506a9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 804c5b0780a588d8
        size: 275
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

failure new builds the node text by hand, beside verb_mint.go, which writes a note in the shape its schema names and parses --field=value through fieldFlag. Reuse that writer or fieldFlag, and quote each remedy, so a colon in a remedy leaves the YAML NodeOf reads back whole.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

failure new reads its flags through fieldFlag and writes the node through check.Minted, the writer the mint uses, so the node takes the shape the failure schema names. The writer quotes each remedy, and TestFailureNewWritesTheNode reads back a remedy holding a colon whole through NodeOf.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the verb reuses both the mint writer and fieldFlag
- the cleanup the change reveals, the hand-built text, leaves with the change
- the shape stands once, in the failure schema, and the verb writes through it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
