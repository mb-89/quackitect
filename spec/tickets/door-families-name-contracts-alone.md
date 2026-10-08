---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: test-walks-move-onto-fakes/gate
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
group: doors-declare-what-they-own
parent: test-walks-move-onto-fakes
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: d81e21859c88aaeb38c266d28a3e22fd135d86d5
    hash_after: fab45bf4c27f831e3bd931546e2e0c52619adeb4
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "   67.2  in all"
    inputs:
      - name: ask
        hash: 88d1a6d06aff47b4
        size: 459
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the family table of spec/design_output/doors.md still names src/quack/cli_test.go, src/quack/dump_test.go, src/quack/main_test.go, src/quack/placements_test.go, src/quack/io_test.go, src/index/watch_test.go, src/watcher/watcher_test.go and src/watcher/watchertest/watchertest_test.go as door tests of a real thing, and after the moves none of them reaches one. The owner tests each door against the real thing once, so each row names its contract files alone.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Three family rows of spec/design_output/doors.md now name their contract files alone: the placements row names src/quack/box_doors_contract_test.go, the index door row names src/index/index_contract_test.go, and the file watch row names src/modules/files/watch_contract_test.go. Each list matches the contract key of the owns.yaml beside it. TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit in src/imports reads the real note and names any test waiting on the box with no span there, and it passes with the dropped files gone, so none of them sleeps or spawns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the eight files leave their rows, and the audit guard holds the claim that none of them waits on the box. src/quack/cli_test.go, dump_test.go and main_test.go still serve an index over a temp folder, and src/index/watch_test.go opens a watch over one. The note .se/tickets/root-cases-take-their-doors.md holds that work, and the sibling watchertest-helper-meets-its-door holds the watchertest helper.
the cleanup this change reveals stands in the note and the sibling ticket named above, so the change carries none.
every contract file stands once in the owns.yaml contract key, and the family rows name those same files with no second list.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
