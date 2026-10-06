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
group: level-zero-smoke
step: do
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: aa36e8dc9fc1aabf9c512f9084678edc5c96a7bb
    hash_after: aa36e8dc9fc1aabf9c512f9084678edc5c96a7bb
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   64.1  in all"
    inputs:
      - name: ask
        hash: 21c287832893a013
        size: 445
    def: df12650931d480c9
reason: done
---

# Ask

The client of se-index stop waits until the door process has exited before it returns, so a caller removing the tree after a stop meets no folder a running door holds. Without it the smoke probe on Windows throws EBUSY on the clone's folder, since the stop only asks the door to leave and Windows refuses to delete a folder a running process stands in.

- go test ./src/index -run TestAStopWaitsOnTheDoorItStops passes
- ./RUNME.sh check exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/reach_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The stop answer now names the door's pid, and the client of se-index stop waits on that process before it returns. On Windows the wait holds the door's process handle until it exits, so the smoke probe removes a clone no running door holds and meets no EBUSY. On unix the wait does nothing, since a folder takes its removal while a process stands in it. The client skips the wait where the pid names itself.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the stop client returns once the door exits, on the platform where that matters
the cleanup: the merge of main dropped the branch's untodo for main's unparked, which fixed the same fault
the pid fact stands in the stop answer alone, and the client reads it from there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
