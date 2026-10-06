---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: one-routine-checks-the-fleet/gate
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
group: the-fleet-watches-itself
parent: one-routine-checks-the-fleet
record:
  - step: do
    hand: box 238560a34a48 · claude-code-remote
    hash_before: ed2d13204e8b9208ae3464fbee8f0f684a672cd2
    hash_after: ed2d13204e8b9208ae3464fbee8f0f684a672cd2
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  107.8  in all"
    inputs:
      - name: ask
        hash: b703c63af6aa222d
        size: 320
    def: d30540c12b845b77
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`fleetPrompt` runs `./RUNME.sh cloud fleet`, which `Cloud` lacks until the-fleet-verb-watches-boxes lands its implement. The ticket names no `depends_on`, so the person ticket can store a routine whose verb answers the usage. The ticket gains `depends_on: the-fleet-verb-watches-boxes`, or the person ticket waits on it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fleet routine's prompt runs ./RUNME.sh cloud fleet, a verb the-fleet-verb-watches-boxes adds. The routine ticket now carries depends_on: the-fleet-verb-watches-boxes, so the queue builds the fleet verb first. The person ticket that stores the routine therefore stores a prompt whose verb exists. The change touches one field of one ticket and no code, so the check covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The ask names two roads; the change takes depends_on, the first one, since it orders the routine itself and the person ticket with it.
- No cleanup follows: the field stands on the ticket, written by ticket set.
- The order stands once, in the depends_on field.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
