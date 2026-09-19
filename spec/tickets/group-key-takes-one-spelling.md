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
group: the-rules-hold-themselves
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
---

# Ask

A ticket names its group under `group`, and two spellings stand: the ticket's
own name, and the branch `work/<name>`. `childrenSay` reads the first alone, so
a group whose children carry the second passes its children step with every
child still open.

| what a child carries | what the group does |
|---|---|
| `group: <name>` | the children step waits for that child |
| `group: work/<name>` | the engine reads past the child, and the group passes |

`the-window-grows-tabs` stands that way today. One spelling stands after this:
the write door refuses the other, or the reader takes both.

The gain is a group that closes over no work still standing open.

Without it a group reads done while its children stand open, and the record
names the engine as the hand.

- a ticket naming its group as a branch comes back refused, or reads as the bare name
- `the-window-grows-tabs` carries the spelling the engine reads
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/ticket.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

One spelling stands, and it is the group's own name. The door refuses the other:

| what lands | where |
|---|---|
| the refusal | `groupFaults` in `.claude/skills/level0/lib/ticket.js` |
| the case reading its message | `test/level0/ticket.test.js` |
| the description naming the group ticket | `spec/schemas/ticket.schema.yaml` |

A `group` opening with the branch mark comes back with the bare name to write in
its place. The field's description names a branch today, which is where the
second spelling comes from, so it names the group ticket instead.

The reader stays as it stands, so one spelling reaches `childrenSay` and no
group closes over an open child.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask on its first road: the door refuses, and the reader keeps one spelling
- the cleanup it reveals: the field's description names the group ticket, so the spelling reads off the schema
- each fact stands once: the door owns the refusal, and the case reads the message it writes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- `the-window-grows-tabs` stands nowhere in this tree, so the second line of the ask needs no fix.
- `grep -c "^group: work/" spec/tickets/*.md` answers none, so no ticket on disk carries the branch spelling.
