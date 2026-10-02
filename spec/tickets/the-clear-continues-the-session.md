---
kind: [[ticket]]
state: draft
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
---

# Ask

A session past `context.handoverAt` clears its own conversation and keeps working: it writes `.se/HANDOVER.md`, the conversation clears, and the next one opens on the resume prompt and reads the handover through `read-handover`. The handover stays inside the session, and hands nothing to another box.

Today a cloud box writes the handover, ends its turn, and stands idle with the clear in hand, so the queue stops on every box that reaches the key.

- the dry probe drives a session past a low `context.handoverAt` through the handover and the clear, ends the turn, and its `clear` check sees `/clear` run, then the resume prompt submitted. `./RUNME.sh probe dry` decides it
- the stops fold answers the clear whichever of `turn.complete` and `classic.Stop` lands first, in cases of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- the plugin runs `/clear` and the resume prompt outside the hook the turn waits on, in a case of `test/level0`. `node --test test/level0/door-clear.test.js` decides it
- `./RUNME.sh check` exits 0

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
