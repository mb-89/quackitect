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
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A hand writing a field the engine owns loses nothing and blocks nothing. The
engine puts the field back to the value it holds, lets the rest of the write
land, and says which field it restored.

<!-- breaks, as text: what breaks if it is never done -->
The ticket door refuses the whole write over one engine field. A field the
hand-back hands to the engine then carries whatever the hand wrote. Where that
text breaks a rule, no hand may fix it, and the push door refuses the ticket.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a write to an `x-engine` field lands with that field back at its value on disk
- the answer names the field it restored
- a case under `test/level0` writes `state` and a prose field at once, and the prose lands
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
