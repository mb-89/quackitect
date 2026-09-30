---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: ops-keeps-one-state/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-foundation-closes-its-gaps
parent: ops-keeps-one-state
record:
  - step: do
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 9f9fc56fa6a6b628115a60ff4659937b8bb1e77e
    hash_after: 9f9fc56fa6a6b628115a60ff4659937b8bb1e77e
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/index passes
      - name: check
        exit: 0
        said: "src/scripts/work-answer.js:120:1: correctness/noUnusedFunctionParameters: This parameter all is unused."
    inputs:
      - name: ask
        hash: f6bf73c7b86ef8f6
        size: 165
    def: 142a3bffc2ed37c7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

once commits-name-their-writer lands, Store.Drop refuses a name another writer owns, the way Commit then does, with a case beside TestADropRefusesANameNobodyProvides

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/q/store_test.go src/index/ops_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Store.Drop now refuses a name whose registration the writer it names does not carry, and leaves every value standing. The check runs through Writer.holds, which commits-name-their-writer can reuse for Commit. The ask waits for that ticket to land first, and this change departs from it: Drop carries its own check now, since a drop of another writer names nothing Commit decides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and says why it lands before commits-name-their-writer
the cleanup stands in the change: the index sweep drops through the ops writer, which carries ops/<id>
Writer.holds stands once in src/q/q.go, and Drop and the coming Commit check both read it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
