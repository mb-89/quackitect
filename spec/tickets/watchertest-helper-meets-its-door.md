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
    hash_before: 57bf6b20e40bbccb58927b0775c064d010811d95
    hash_after: 091949a6459274bc68d2dc815a5c1aff48ee6ba5
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes; green, src/q/qtest passes; green, src/watcher/watchertest passes
      - name: check
        exit: 0
        said: "   63.4  in all"
    inputs:
      - name: ask
        hash: 804106931740878c
        size: 266
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/watcher/watchertest/watchertest.go carries an OutsideInDoors marker on os to make the folders a real watch hears. The last gate said to leave no marker on a fake or its helper, so the helper takes the disk door, or the file goes under the watch door's files key.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns/tests_tree_test.go src/q/qtest/clock_test.go src/watcher/watchertest/watchertest_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The helper under src/watcher/watchertest now reaches the disk through its own door.go, as every Go package past the modules does. A new watch door in src/watcher/owns.yaml names that file and the watch contract suite. The wall clock in src/q/qtest carried five markers of the same kind, so src/q/qtest/owns.yaml declares a wall door over the clock names it uses, and the markers leave. TestNoFakeOrTestHelperWalksAroundADoorMarkedOrNot in src/owns refuses any walk in a fake or a test helper, marked or not. It went red on both helpers before the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, on the disk door road: the helper reaches the disk through door.go, and the watch door files key names it.
the cleanup this change reveals stands in the change: the wall clock in src/q/qtest carried the same markers, and its door lands here too.
each owns.yaml declares its door once, and doors.md links to the declaration chapter with no copy of the new doors.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The wall clock in `src/q/qtest/wall.go` carries the same markers on the clock, so a door at `src/q/qtest` declares it too. The new tree test refuses any walk in a fake or a test helper, marked or not. The two helper suites show the helpers still behave once their markers leave:

    ./RUNME.sh test src/owns/tests_tree_test.go src/q/qtest/clock_test.go src/watcher/watchertest/watchertest_test.go
