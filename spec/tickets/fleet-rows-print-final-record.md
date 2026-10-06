---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-fleet-watches-itself/accept
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
group: the-fleet-watches-itself
parent: the-fleet-watches-itself
record:
  - step: do
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 88f3663409e021c7925a5f575e10045e221a1410
    hash_after: 88f3663409e021c7925a5f575e10045e221a1410
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    4.0  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: 92d99af5e052eaf1
        size: 155
    def: 9c36b7ae9dac47ce
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

cloud fleet prints no model, cost or final line, though each row carries them off the record, so the fleet shows no final record. The row prints the three.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/fleet_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

cloud fleet now prints each box's model, cost and final line after its pull request, off the record entry its last hand wrote, so the fleet shows the final record the ask names. The final line stands last, since it holds spaces. TestFleetPrintsTheFinalRecord covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change follows the accept point: the row prints the three it already carries.
- No cleanup follows from one printed row.
- The fields stand once on boxRow, and the row reads them there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
