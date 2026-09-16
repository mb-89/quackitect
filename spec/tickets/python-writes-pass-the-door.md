---
kind: [[ticket]]
state: draft
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
---

# Ask

The shell door refuses every road that writes a tracked file from a shell, and a hand writes through Read, Edit and Write alone. So every write meets the rules, whichever program carries it.

Today the door reads the command's verbs, and a python or node one-liner that writes a file passes it. This box wrote seven files that way in one session, and the rules read none of them.

- a python, node, perl or ruby command writing a tracked file meets a refusal, and a test drives it
- the same command over a file the rules leave alone passes, and a test drives it
- the refusal names the file and the program, as the sed refusal does

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
