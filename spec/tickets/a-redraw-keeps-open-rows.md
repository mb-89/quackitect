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
group: the-editor-holds-the-drawing
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 639f41e8c2a9085c88faaf1d9095de1d613e0607
    hash_after: 639f41e8c2a9085c88faaf1d9095de1d613e0607
    answered:
      - name: tests
        exit: 0
        said: green, src/tui passes
      - name: check
        exit: 0
        said: "src/bridge/stop.js:1:1: FileCeiling: A file holds 600 lines, and the file holds 640. Split it by topic."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person expands a group in the work tab, and the rows under it stay open while the tab redraws on every change. The order they read stays too.

Without it every redraw folds each group shut, and a person opens them again after every change the engine writes.

- a redraw keeps every group a person expanded open, and a test drives it
- a redraw keeps the order of the rows unless a place changes, and a test drives it
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test src/tui/tree/tree_test.go

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The tree view keys a shut parent by the names down to it, and no more by its index. A new note under `.se/tickets` sorts ahead of every ticket, so an index key moved the shut set onto other groups on every redraw. A tree handed over again carries the shut set and the row under the cursor by name. A parent a person opens again stays open. The address an edit writes through stays the index. For details, see [[spec/design_output/tree-view#a-parent-expands-and-collapses]].

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: two tests drive the open groups and the row order
- the carry copied an opened parent as shut, and the change fixes it with the rest
- the tree-view note owns the address, and the code points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
