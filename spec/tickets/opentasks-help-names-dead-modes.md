---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-count-chain-leaves/gate
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
group: open-tasks-switch-lands
parent: the-count-chain-leaves
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: e8041818162f2aa99ef0a72f40a998704ccac1e7
    hash_after: e8041818162f2aa99ef0a72f40a998704ccac1e7
    answered:
      - name: tests
        exit: 0
        said: green, 45 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f74d098d30fce01a
        size: 144
    def: afe0d22bb9adb010
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the migration.opentasks help in level0.schema.json still describes old and shadow. After the delete no reader acts on them, so rewrite the help.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/config.test.js test/level0/projection.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The migration.opentasks help in spec/config/level0.schema.json names the key as the record of the open tasks slice. It says the badge, the work tab's brackets and its queue column read the index, and that the old and shadow values reach no reader since phase 2 switched over.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the help describes what a reader acts on
the cleanup: the enum keeps old and shadow as the record, and the help says so
one place: the schema owns the help, and the projections follow it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
