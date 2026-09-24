---
kind: [[ticket]]
state: closed
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
group: the-review-lands-overnight
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 724bd9ddd7d9ea31bb039839d3fec8758401ca0c
    hash_after: 724bd9ddd7d9ea31bb039839d3fec8758401ca0c
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
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

    ./RUNME.sh branch test test/level0/write.test.js test/level0/rewritten-event.test.js test/level0/ticket.test.js


## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check


## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A write to a ticket field the engine owns lands with that field back at its
value on the disk. The rest of the write lands beside it. `restoredFields` in
`lib/ticket.js` swaps the rows of each moved field for the disk's. The write
door hands the write on with a note naming each field, and the bridgehead
carries that note beside the rewritten event. An edit moving engine fields
alone lands nothing, so the door refuses it and names them.


## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and an edit moving engine fields alone refuses, because nothing of it lands
- the cleanup: the bridgehead carries a note beside a rewritten event, which the note naming the field needs
- the rule stands in `schema.md#the-verbs-own-their-fields`, and the code points there


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
