---
kind: [[ticket]]
state: closed
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
group: the-tree-names-its-things
step: do
record:
  - step: do
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 2b044e5bd1517469d24bfe28274d7f9e79e5bd7e
    hash_after: 2b044e5bd1517469d24bfe28274d7f9e79e5bd7e
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

The tree view draws its rows and narrows them, and a person changing a value
has to open the note. The design input asks for an edit in the cell holding the
value. [[spec/design_input/the-tree-view-editor]]

The gain is a tab where the states change. A person flips a state in the cell,
one key a change, and the note stays shut. The fill turns a long afternoon of
edits into one.

Without it a person opens a note for every value they change. The tab then
reads the work and changes none of it.

- an edit opens on the cell under the cursor, holding the value it carries
- Enter writes the value, and Escape puts the old one back
- the fill reaches every row the view holds, and a filter says how far
- the completion offers the schema's values, and the data's where no schema names any
- `go -C src/tui test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test src/tui/treeedit_test.go

## check

    ./RUNME.sh check

## says

`Open` takes a column and opens an edit on the cell under the cursor, holding
the value it carries. The edit draws in that cell, so a person reads the row
while typing into it.

| the key | what the view does |
|---|---|
| Enter | writes the value, through the row's address |
| Escape | puts the old value back |
| Enter with shift | writes the value into every row the view holds |

The fill reaches the rows standing at that moment, so a filter says how far it
goes. `Take` and `Fill` each answer the rows that keep the value they carry, so
the view says which rows stay behind.

A `Schema` says what a field takes. The completion offers those values, or
every value standing in the data where no schema names any, and what a person
types narrows the offer.

## checked

- the change follows the ask: the two keys, the fill and the completion land
- the cleanup it reveals: the edit reaches the item through its address. The row and the item stay one thing
- the editing stands in one chapter, and the code points at its anchors

# Discussion

Three things the design input names wait for the tab that draws this view:

- the editor reading the type its schema names
- a cell holding a mark carrying its editor open
- how the view draws the rows that stay behind

A caller builds the schema out of the schemas this tree holds, and a view with
none reads its own data.

Taking an edit back stays out, the way the design input says.
