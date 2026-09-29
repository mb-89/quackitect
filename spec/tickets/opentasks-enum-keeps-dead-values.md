---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: open-tasks-switch-lands
parent: open-tasks-switch-lands
step: do
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: 81ce58a468a6f3361504971e72964ca997c2be3d
    hash_after: 81ce58a468a6f3361504971e72964ca997c2be3d
    answered:
      - name: tests
        exit: 0
        said: green, 45 test(s) pass in 2 file(s); green, src/modules/migration passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: fd06f155015d133c
        size: 260
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The opentasks key still offers old and shadow, and the migration module registers old as its default. No reader acts on either value since phase 2 switched over. Cut both from the schema enum and the module, so new stands alone, and project the commands again.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration test/level0/config.test.js test/level0/projection.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The accept of open-tasks-switch-lands found the old and shadow values still offered after phase 2 switched over. The schema enum now holds new alone, the migration module registers new as its default, and the projection removes the two commands that set old and shadow. The module test wants new with nothing set.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: new stands alone in the enum and the module
the cleanup: the two projected commands leave with the values
one place: the schema owns the enum, and the projection follows it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
