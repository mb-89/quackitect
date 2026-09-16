---
kind: [[ticket]]
state: closed
urgency: now
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
    hash_before: cdb0cc9d5eca391c8b52b12ddcd132acdabb9c29
    hash_after: cdb0cc9d5eca391c8b52b12ddcd132acdabb9c29
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The reviewer reads a group's retro off the group ticket, where the route writes it, and reports present where it stands. A reader of the report trusts the retro line.

Today the reviewer reads the retro off the handover file alone, and a group branch carries none. So every done group reads retro absent, and the line says nothing.

- `./RUNME.sh branch review <group>` reads the retro chapter of the group ticket, and a test drives it over a fixture
- a branch with a handover file keeps its reading, and the test drives both roads
- the report on a done group with a written retro says present

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/review.test.js

## check

    ./RUNME.sh check

## says

The review verb read the retro off the handover file alone, and a group branch carries none. So every done group read retro absent. Now a branch with no brief takes its group ticket as the handback, and the retro reads off that ticket. A filled line under the retro chapter reads as present, and placeholders and headings say nothing. A branch with a brief keeps its reading.

## checked

- the change follows the ask: the verb reads the group ticket, and a test drives both readers
- the cleanup the change reveals is none: the report and its count stand as they were
- the reading stands in the review library alone, and the design chapter points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
