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
step: do
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: d68c95e4900e9c43f675fb0ba41059d4cdc1506c
    hash_after: d68c95e4900e9c43f675fb0ba41059d4cdc1506c
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes; green, src/modules/work passes; green, src/modules/migration passes; green, src/index passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: cd8470031958af01
        size: 633
      - name: [[spec/tickets/open-tasks-switch-lands]]
        hash: 3a1cd0d2ae37c584
        size: 6455
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The phase-2 shadow ran against this tree's own ticket tree, and the old count and the index's `work/open-tasks` read the same. Turning `migration.phase2switch` on lets a box take [[spec/tickets/open-tasks-switch-lands]], so the badge and the work tab's brackets read one name.

While the switch reads false, `branch take` passes the group over, and the old path and the new one both stand in the tree.

- `./RUNME.sh config` reads `migration.phase2switch true spec/config/level0.json`
- `./RUNME.sh log --kind shadow` names no mismatch of the open-tasks slice after a run of the old path beside the index
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/work src/modules/work src/modules/migration src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The phase-2 shadow ran against this tree: the old path (branch list --json through work.PlacesAt, the count the badge and the work tab read) beside the index value work/open-tasks, with migration.opentasks at shadow and the index door standing. Four samples read 29/29, 29/29 after this ticket opened held, 30/30 after a plan todo was added, and 28/28 after two todos finished. ./RUNME.sh log --kind shadow names no row, and shadow_test proves a mismatch writes one. So migration.phase2switch turns true, and a box may take open-tasks-switch-lands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json, projections rewritten by ./RUNME.sh project with nothing changed
- the cleanup it reveals: the shadow writes nothing on a match or a silent door, so an empty log alone proves nothing; the samples above stand as the proof, and a note parks the gap
- every fact stands once: the samples live on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
