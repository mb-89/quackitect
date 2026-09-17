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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A box out of a fresh clone runs one command and reads every rule, so a cloud
session spends its first minutes on the work.

<!-- breaks, as text: what breaks if it is never done -->
The check probes the server and stops at the probe, so the rules over the tree
stay unread. A cloud box starts no server, so every cloud session meets the
same wall and answers it by hand.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh check` reaches the rules on a box running no server, and says what the probe found
- the check answers red where a standing server fails its health call, which a test over a fake door holds
- `./RUNME.sh doctor` keeps naming the server, because that verb is where a reader asks after it

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
