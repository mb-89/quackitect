---
kind: [[ticket]]
state: closed
group: findings
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: 59867fba24a4bd2b1a35c4b19a22692cbda61603
    hash_after: 59867fba24a4bd2b1a35c4b19a22692cbda61603
    answered:
      - name: tests
        exit: 0
        said: green, 18 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

The command line's main stands behind a guard, so a test importing src/scripts/cli.js registers its cases and runs them. Today the import meets the usage and the exit. So test/level0/outside-hand.test.js passes empty, and the test-first door reads a pass that proves nothing. Done when node --test test/level0/outside-hand.test.js reports its cases, and a case that fails turns the run red.

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh branch test test/level0/outside-hand.test.js test/level0/paths.test.js test/level0/server-crash.test.js

## check

./RUNME.sh check

## says

The command line dispatches its verb behind a guard, so a test importing it registers its cases and meets no exit. The guard stands as `runsHere` in the paths library, and the server reads it there too. The register case the empty pass hid names the file the reader reads, and writes the marker the reader wants. So it passes on the reader's own terms.

## checked

- the change follows the ask: the file reports its cases, and a failing case turns the run red
- the cleanup is in the change: the server reads the one guard, and the register case names its file
- every fact stands in one place: the doors note holds the guard, and the code points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
