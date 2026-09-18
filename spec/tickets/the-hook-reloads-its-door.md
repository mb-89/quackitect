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
    reads: [[spec/guidance/working]]
    needs: ["work test"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: c09c0b53954b3c40b357b9fab98d68a461fdd0d9
    hash_after: c09c0b53954b3c40b357b9fab98d68a461fdd0d9
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A fix to a lib under the hook reaches the running session. Today the hook imports its libs once at session start. So a reviewer hand that fixes the ticket door writes through the old door for the rest of the session. Done is a reload on a change to a lib file, or a check that names a hook older than its lib.

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/reload.test.js

## check

    ./RUNME.sh check

## says

The server imported its doors and libs once, so a fix to one reached no running session. Now the server reads its own code at the first event and again after every tool run. A file that differs restarts the server through its own restart road, and the log names the file. The next event lands on the new code, and the session goes on, because the bridgehead holds no state.

## checked

- the change follows the ask: the reload on a change stands, and the log line names the file
- the cleanup the change reveals is none
- the roots stand in one module, and the design chapter points at it

# Discussion

A reviewer hand on the first pull run fixed the ticket door for two chapters of one name. The session kept refusing under the old door. The payload road of the pull went around it.
