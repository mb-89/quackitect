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
    hash_before: 5525016fbec6eb611720b9363f3b8ef3f35b200d
    hash_after: 5525016fbec6eb611720b9363f3b8ef3f35b200d
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 50 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The canary rides the first answer, and the work the agent names as next follows in the same turn. The owner reads one answer and sees the work start.

Without it the agent writes the canary line, ends the turn, and the owner types the same ask twice. The log of this box carries that moment at the first answer of the session.

- the canary text says the line rides an answer and closes no turn, and `./RUNME.sh standing` prints that text
- a stop after a first answer naming a next step meets the hold-open line, and a test drives it

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/stop.test.js

## check

    ./RUNME.sh check

## says

The canary block now says the line rides the answer and closes no turn. It asks the agent to do the step the answer names in the same turn. The standing verb prints that block, out of the one library both the hook and the command line read.

The free stop of a new session takes an exception. Where the first answer names a next step, the session-is-new rule fires no more and the turn holds open. A sentence opening on next, then I, or I and a verb of the agent's own act names a step. A table, a heading and the stop line stand outside that reading.

## checked

- the change follows the ask: the text says it, the standing verb prints it, and the rule holds the turn
- the cleanup the change reveals is in it: the canary block moved out of the bridge into the library
- the block stands in one library, and the bridge and the command line read it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
