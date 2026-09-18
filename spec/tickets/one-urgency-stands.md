---
kind: [[ticket]]
state: open
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
group: the-work-editor-draws
step: do
---

# Ask

`urgency` holds three words: `now`, `soon` and `whenever`. Two of them say the
same thing, because a ticket the owner has yet to raise sits where the score
puts it. So the field becomes one mark: urgent, or nothing.

The score orders everything under the mark, and the mark overrides the score.
So a ticket reads urgent or it does not, and the queue needs no middle word.
[[spec/tickets/the-queue-is-a-score]]

The change reaches five places:

| what holds it | what it does today |
|---|---|
| `spec/schemas/ticket.schema.yaml` | an enum of three words |
| `src/scripts/work.js` | `URGENCY`, and `urgencyOf` |
| `src/scripts/pull.js` | `URGENCY` again, and the sort reading it |
| `src/scripts/ticket.js` | mints `urgency: whenever` |
| every ticket standing | 72 of them carry a word |

`URGENCY` standing in two files is its own fault. One name holds it after this,
and the other file reads that one.

The gain is a field a person answers in one press. A three-word scale asks a
person to rank what they have yet to think about, and two of its answers order
nothing.

- the schema holds one mark, and the three words stand nowhere
- one module owns the name, and the other reads it
- every standing ticket carries the new shape
- a ticket minting today takes the new default
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

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
