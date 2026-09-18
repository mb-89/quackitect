---
kind: [[ticket]]
state: open
urgency: now
depends_on: [the-work-answer-lands]
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

The work tab says it stands empty. This ticket puts the tree view in it, over
the tickets this tree holds, and a base file says the columns.

| the column | what it reads |
|---|---|
| the name | the ticket's file name, nested by `group` |
| the state | `state` |
| the flags | the boolean keys a later ticket joins into letters |
| the progress | the leaf the ticket stands on, of the route's leaves |
| the queue place | the order the written answer carries |
| what it says | the ask's first line, in the last column |

`spec/views/work.base` declares them, and `ReadBase` reads that shape today.
The file filters to `kind: ticket`, and `nest` names `group`.

The view redraws on a write. The index answers a registered query, and the
window's own door takes the call, the way it takes a tab today. For details, see
[[spec/design_output/viewer#a-second-launch-hands-over]].

The gain is a board a person reads. Every later ticket in this group adds to a
tab that already draws, so each one lands small.

- `./RUNME.sh tui work` draws every ticket, nested under its group
- a write to a ticket redraws the tab with no key pressed
- a ticket in no group draws at the left, with no mark
- the filter reads the log's language over a ticket's keys
- nothing here writes a ticket, and the edit waits for its own ticket
- `go -C src/viewer test ./...` is green
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
