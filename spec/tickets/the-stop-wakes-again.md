---
kind: [[ticket]]
state: closed
urgent: true
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
    hash_before: b7208dc09ad8eab430e341c81013c768c484aa3b
    hash_after: b7208dc09ad8eab430e341c81013c768c484aa3b
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

One standing stop ends the turn, and nothing prompts after it. The owner reads the stop line and the turn is over.

Today the plugin prompts again after a standing stop: a refused helper answer, or the hold-open line saying the turn ends with no stop. The owner sees two ends of one turn, and the second one lies.

- a turn ending on a standing stop line meets no prompt after it, and a test in `test/level0` drives it
- a helper's refused answer reaches no owner turn, and a test drives it
- `./RUNME.sh serve` stops on each stop hook run under the debugger, and shows its reason and what prompts after

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/stop-door.test.js

## check

    ./RUNME.sh check

## says

A test now drives the stop door over a fake box. A standing stop line ends the turn with no block, and a helper's turn end passes untouched. A turn with no stop line holds with the ask. The log line of every stop carries the first line of what prompts after. The serve verb under the debugger sets a break flag. The hook then pauses at every stop with the reason, the claim and what prompts after.

## checked

- the change follows the ask: the door tests stand, and the debugger pauses on the flag the serve verb sets
- the cleanup the change reveals is none

# Discussion

The second end the owner saw came from the answer door and the tooth's cap, and both stand fixed in earlier tickets. This one pins the door's behavior in a test and gives the owner the debugger road.
