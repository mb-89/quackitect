---
kind: [[ticket]]
state: open
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
urgent: true
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tests-meet-the-doors-once
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The dry probe reads level zero on a fresh box whatever tickets the tree holds open, so the check answers the tree and not the queue.

<!-- breaks, as text: what breaks if it is never done -->
A gate point mints a tagged ticket, and a tagged ticket stands first in every pull. The probe clone pulls it ahead of its own leaf, the clear check fails, and the check stays red while any tagged ticket stands open, so no point can hand back.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `grouped` in `src/scripts/probe-clear.js` takes the tag off every ticket in the clone but its own leaf, and `test/level0/probe-clear.test.js` proves it
- `./RUNME.sh probe dry` passes its clear check while a tagged ticket stands open in the tree
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

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
