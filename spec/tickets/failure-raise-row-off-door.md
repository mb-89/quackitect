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
    hash_before: fd534ce9966194852ad3fcdb91ebd219e8bdb3af
    hash_after: fd534ce9966194852ad3fcdb91ebd219e8bdb3af
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: d3c19cc4ac30458a
        size: 251
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft shapes the row through sayLine by hand, beside Raised.Row in src/failure/raise.go, which the design note names as the row owner. Feed the level, said and failure.IDField off Raised into sayLine, the id under extra, so one place owns the row.

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

failure raise takes its log row from Raised.Row in src/failure/raise.go, the row owner the design note names. It feeds that row's level, kind and said into sayLine, with the id under extra, so the verb shapes no row of its own. The raise test asserts the row it writes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the row comes off Raised.Row
- the cleanup the change reveals, the hand-built row, leaves with the change
- the row shape stands once, in Raised.Row

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
