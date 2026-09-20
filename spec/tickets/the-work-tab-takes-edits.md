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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-work-tab-reads-tickets
step: do
record:
  - step: do
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 85636697a3660bb523f58498c5a385da3471f72d
    hash_after: 85636697a3660bb523f58498c5a385da3471f72d
    answered:
      - name: tests
        exit: 0
        said: green, src/tui passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The work tab takes the cell edit the tree view holds, and an edit writes the ticket through the write door. So a person edits a ticket where they read it.

<!-- breaks, as text: what breaks if it is never done -->
The cell edit stands in the tree view and no tab wires it, so the work tab reads and writes nothing.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- an edit in the work tab writes the field to the ticket, which `go -C src/tui test ./...` covers
- the write meets the door, so a field the verbs own refuses the edit

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The work tab wires the cell edit the tree view holds. A cursor picks the
column, `e` opens the cell, and Enter writes the field into the ticket's own
front. For the keys and what each column meets, see
[[spec/design_output/tui#the-work-tab-takes-edits]].

| what | where it stands |
|---|---|
| the door | the ticket schema, read for `x-engine` and `enum`, so the tab holds no list |
| the write | `withField` in `workedit.go`, one top-level field, quoted where a reader trips |
| the marks | `u` and `t` flip a mark on the row or the marked rows, and write it |
| the carry | a tree handed over again keeps the cursor, the selection and the open groups |

So a field the verbs own refuses the edit with the same words the door says,
and a column the index derives refuses it too. The base file gains a `group`
column, because that is the field a person moves work with. The cases stand
the tree's own schema and a note on disk beside the fake door.

## checked

- the change follows the ask: an edit writes the field, and the cases cover the write and the refusal
- the cleanup it reveals: the tree answers what a write reached, so the tab writes each item once
- every fact stands once: the keys stand in the TUI note, and the door rule stays in the schema note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
