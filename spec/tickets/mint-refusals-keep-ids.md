---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 45973f5931060ec4d24c2f9684db17a93876ea5f
    hash_after: 45973f5931060ec4d24c2f9684db17a93876ea5f
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/failure passes
      - name: check
        exit: 0
        said: "  117.5  in all"
    inputs:
      - name: ask
        hash: 178b043a4f010497
        size: 224
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft gives the mint one id, yet its refusal text comes from fieldsIn, withRoute, check.Minted, pull.EmptyGroup and pull.ClosedGroup, and the errs form also catches the usage text and the I/O error prints in verb_mint.go

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_mint_test.go src/quack/verb_failure_test.go src/failure/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each refusal the mint verb prints now raises its own node through the failure door, which prints the message, the id at its level and the remedy, and logs the row. The ids name the source of each: mint-kind-unknown, mint-fields-refused off fieldsIn, mint-route-refused off withRoute, mint-path-stands, mint-shape-refused off check.Minted, mint-group-empty off pull.EmptyGroup, and mint-group-closed off pull.ClosedGroup. The usage text and an I/O fault print as they stand, so the red refusal test reads the mint form (errs, why) alone. raisedOnto in verb_failure.go prints the lines and writes the row for both the failure verb and the mint.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one id per refusal source, and the usage and I/O prints stay out of the form
- the remedy text inside pull.EmptyGroup and pull.ClosedGroup belongs to the pull move, pull-callers-name-stillheld
- each remedy stands in its node under spec/failures, and raisedOnto stands once in verb_failure.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
