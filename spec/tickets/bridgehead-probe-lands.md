---
kind: [[ticket]]
state: closed
urgency: now
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
process_hash: 62642eaf8f9c9c53
group: the-bridgehead-imports-its-vehicle
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 39cbb2c3e3cff6d32bdb112b4b9dbef6610994c4
    hash_after: 39cbb2c3e3cff6d32bdb112b4b9dbef6610994c4
    answered:
      - name: tests
        exit: 0
        said: green, 40 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 4 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The probe under test/fixtures/bridgehead lands with its tests and its chapter. A probe writes its code before its tests, because the answer decides what the tests say. So this ticket takes the trivial route, and the one under the standard route becomes it. Without it the stub branches lean on a chapter no test holds. Done is three things:

- `node --test test/level0/bridgehead.test.js` answers green, so the bridgehead forwards session.start, tool.call and turn.complete
- `SE_SLOW=1 node --test test/contract/bridgehead.test.js` answers green: the client passes the probe, and a headless turn answers the canary
- spec/design_output/level0.md carries the chapter A bridgehead imports a copy, naming the shape that holds and the three that fail

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/bridgehead.test.js test/contract/bridgehead.test.js test/level0/pull.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The probe plugin stands under test/fixtures/bridgehead, with a fake vehicle beside it. Its module reads the vehicle file at session start and imports the module it names. Then it hands every event to the vehicle through a mirror of the harness hand. Four import shapes go through the client. The chapter A bridgehead imports a copy names the one that holds: a relative path to a copy inside the plugin folder.

Three things land with it:

- the unit test proves the forwarding on a fake harness
- the contract test asks the client to check the probe. Under SE_SLOW it runs one headless turn in a throwaway stub.
- the test verb names the tap reporter, because node past 23 answers a pipe with the spec reporter
- a became hand-back reads no field of the leaf, because the successor carries the work

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask. The standard ticket becomes this one, because a probe writes its code first.
- the cleanup is in the change: the tap reporter and the became check. The tool name finding waits as a private note.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
