---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: open-tasks-run-in-shadow/gate
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
group: open-tasks-shadow-lands
parent: open-tasks-run-in-shadow
record:
  - step: do
    hand: box d81c1a402acf · claude-code-remote
    hash_before: c7bffea3e238220779dba281b27e248e9ba83552
    hash_after: c7bffea3e238220779dba281b27e248e9ba83552
    answered:
      - name: tests
        exit: 0
        said: green, 26 test(s) pass in 1 file(s); green, src/modules/migration passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ae409f2e570c06ab
        size: 282
    def: d47a5887fb2dcccc
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask names migration/config/slices/openTasks, and the catalog refuses a segment other than lowercase (src/q/check.go, segment and BadName), so the draft spells it open-tasks; the ask and the owner-read step still carry the owner's spelling, so the owner confirms open-tasks there

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration src/quack test/contract/tree.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The slice key lands as migration/config/opentasks, and the default file sets migration.opentasks. The catalog refuses a capital, which rules out openTasks. A variable maps a key of two levels alone, which rules out migration.slices.open-tasks. One lowercase word under migration passes both, as the phase switches beside it do. The merge reads this call.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs from the ask spelling, and the Discussion says why
the cleanup: none beyond the key, which open-tasks-run-in-shadow lands
one place: the key stands in src/modules/migration and the default file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The implement step lands the key as `migration/config/opentasks`, and the default file sets `migration.opentasks`. The catalog refuses a capital, so `openTasks` fails there. A variable maps a key of two levels alone, so `migration.slices.open-tasks` fails the round trip in `test/contract/tree.test.js`. The owner confirms `opentasks`, or names another single lowercase word.
