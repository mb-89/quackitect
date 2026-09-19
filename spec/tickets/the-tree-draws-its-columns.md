---
kind: [[ticket]]
state: draft
urgent: true
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
group: work/the-window-grows-tabs
---

# Ask

The window holds a frame, and every tab after the log draws rows with a shape.
The design input asks for one view drawing a tree and a table at once.
[[spec/design_input/the-tree-view-editor]]

The gain is one view for every such tab. A shape becomes a list of columns and
a list of items. So the work browser and the tabs after it write no drawing of
their own.

Without it each tab draws its own rows. The nesting, the column widths and the
cutting then read differently in each one, and a person learns each tab again.

- a column reads the key it names
- the last column takes the room the others leave
- the last column cuts its text, and a row fills the width it takes
- a parent collapses and expands, and one call reaches every parent
- a declaration saying flat draws every item at the left, with no mark
- `go -C src/viewer test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    go -C src/viewer test ./...

## check

    ./RUNME.sh check

## says

`Tree` holds the columns, the items and whether the view nests. It flattens the
items into rows, reading the addresses a person collapsed, and the items stay
as they stand.

A column names the key it reads:

| the column | the room it takes |
|---|---|
| the first | the room its declaration names, and it carries the mark, the nesting and the name |
| the middle | the room its declaration names |
| the last | what the ones before it leave, and it cuts its text there |

So a row fills the width the tab hands it, at every width.

`Header` draws the line of column names and `Rows` draws the rows. A tab joins
the two, so the names stand still while the rows scroll.

A flat view draws every item at the left, with no mark and no nesting, and a
parent there collapses nothing.

## checked

- the change follows the ask: the items, the columns, the nesting and the cutting land
- the cleanup it reveals: the log draws its own names the same way, and the design output points at that
- the view stands in one note, and the code points at its anchors

# Discussion

No tab draws this view yet, because a tab wants a source of items. The tab and
its source wait for the ticket that reads the declaration.
