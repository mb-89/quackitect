---
kind: [[design_output]]
---

# Scope

`src/viewer/tree.go` and `src/viewer/treedraw.go` hold the view drawing a tree
and a table at once. This note covers the items, the columns, the nesting and
what the view draws. Every tab drawing rows with a shape takes this one view.
[[spec/design_input/the-tree-view-editor]]

The declaration a view comes from, the filter over it and the editing of a cell
each wait for a ticket of their own.

# The view draws a tree

A view carries three things: the columns, the items and whether it nests.
`NewTree` takes the three and flattens the items into the rows it draws.

| what | what it holds |
|---|---|
| `Item` | a name, the values its columns read, and the items under it |
| `Column` | the name in the line of column names, the key it reads, and the room it takes |
| `Tree` | the columns, the items, the nesting, and where the cursor stands |

The view keeps the items as they stand. What a person collapses lives in the
view, and the flattening reads it, so the data stays as it is.

## An item carries its keys

An item holds its values under the keys a column names. So one view draws
tickets, notes and the rows this tree grows later, and a new shape is a list of
columns and no code.

A ticket stands as the case to read:

| column | the key it reads |
|---|---|
| the first | the name, nested by group |
| the second | the state |
| the third | what it says |

# The columns read the item

Each column but the last takes the room its declaration names. The last takes
what the ones before it leave, and cuts its text there with an ellipsis. So a
long field reads in the last column at every width, and a row fills the width
the tab hands it.

## The columns stand still

`Header` draws the line of column names, and `Rows` draws the rows. A tab joins
the two, so the names stand still while the rows scroll under them. The log tab
draws its own names the same way. [[spec/design_output/viewer#the-columns-stand-still]]

## The name column nests

The first column draws the mark, the nesting and the name, whatever key it
reads. A row stands two columns in for each step of depth. The mark reads `▾`
while the item stands open, `▸` while it stands collapsed, and blank on an item
with nothing under it.

# A parent expands and collapses

| what a person does | what the view does |
|---|---|
| toggles a parent | the items under it go, or come back |
| collapses a row with nothing under it | the cursor goes to its parent, and that parent shuts |
| collapses every row | every parent shuts, and the cursor goes to the top |
| expands every row | every parent opens |

A row holds its address, as `0/2/1`, and the view holds the address of every
parent standing shut. So an item arriving or leaving costs the view nothing it has to
carry by hand.

## A flat view nests nothing

A declaration saying flat draws every item as a row of its own, at the left,
with no mark and no nesting. A parent there collapses nothing, because every
item already stands.
