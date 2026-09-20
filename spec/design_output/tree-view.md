---
kind: [[design_output]]
---

# Scope

`src/tui/tree.go` and `src/tui/treedraw.go` hold the view drawing a tree
and a table at once. This note covers the items, the columns, the nesting and
what the view draws. Every tab drawing rows with a shape takes this one view.
[[spec/design_input/the-tree-view-editor]]

Sorting by several columns, the presets panel, lazy loading and a page size
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

A gutter stands before every row, the way the log's does. The selected row
wears the bar in the gutter and the background under every cell. So a person
reads where they stand the same way in every view, and the mouse reads a
column past the gutter.

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

## A tab joins the two

`Header` draws the line of column names, and `Rows` draws the rows. A tab joins
the two, so the names stand still while the rows scroll under them. The log tab
draws its own names the same way. [[spec/design_output/tui#the-columns-stand-still]]

## The name column nests

The first column draws the mark, the nesting and the name, whatever key it
reads. A row stands two columns in for each step of depth. The mark reads `▾`
while the item stands open, `▸` while it stands collapsed, and blank on an item
with nothing under it. So the mark says which row is a group, and no column
says it again.

The key under `nest` in the base file says how a child finds its parent. A row
whose value under that key names another row's name stands under it, at any
depth. A row naming a parent nobody holds stands at the left. `workitems.go`
builds that tree off the rows the index answers, and a branch informs a row's
standing and nothing more.

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

# The filter reads an item

The view filters in the language the log filter reads, so a person learns one
language and types it in every tab.
[[spec/design_output/tui#the-filter-language]]

An item answers the three questions the language asks of a row:

| the question | what an item answers |
|---|---|
| a bare word | the name, then every value, in the order of the keys |
| `name: value` | the name for `name`, and the key of that name otherwise |
| `details: word` | every key and its value, a line each |

A key no item carries matches nothing, the way a column no row carries does.
[[spec/design_output/tui#a-name-nobody-knows]]

## A parent stands for it

A node stands while it matches, or while an item under it does. So a match deep
in the tree stays reachable, and the road to it stands with it.

| what stands | why |
|---|---|
| a matching item | it matches |
| a parent of a match | the road to the match |
| a child matching nothing | nothing, and it goes, even under a parent that matches |

A parent the filter empties of children carries no mark, because nothing stands
under it. The filter reaches no row under a shut parent, because a shut
parent draws no child at all.

# A sort holds several keys

The sort stands beside the filter, between the data and the view. It orders the
items of one level and leaves the items themselves as they stand, so the
nesting survives every order a person picks.

| what a person does | what the sort does |
|---|---|
| presses a column head | puts that key at the end of the list |
| presses the same head again | turns that key around |
| presses it a third time | drops that key, and the ones beside it stand |
| presses another head | adds that key under the first |

A later key breaks the ties an earlier one leaves. Two values reading as
numbers compare as numbers, and a row carrying no value for a key stands after
the rows that carry one.

A view opens on the order its base file names, under `sort`. The work view
opens on the rows a person owns, then the place the queue gives.

# A flag draws a letter

A row carries one boolean key a flag, and one column draws them as letters.
Every letter stands upper in its fixed place, lit or not, the way the funnel
in the footer stands. A letter wears a colour where its key reads true, and
grey where it reads false. The first place draws the state's own first
letter, so a row reads `O` for open, `D` for draft and `C` for closed before
its marks:

| the letter | the key it reads | its tone |
|---|---|---|
| the state's first | the state, as its value | good on `open`, bad on `draft`, plain on `closed` |
| U | the ticket carries the urgent mark | bad |
| W | a hand holds it | good |
| C | the group holds a branch on the cloud | good |
| T | a todo forces its place, which [[spec/design_output/pull#a-todo-forces-a-place]] reads | bad |

The letters hold fixed places, so nothing shifts as one lights. The keys stay
ordinary keys, so a person filters on `urgent: true`, and `not urgent: true`
keeps the rest.

A letter, its key and its tone stand under `flags` in the base file. A flag
marked `value` draws its value's first letter in place of one. It names a
tone a value under `tones`, so `open` and `closed` wear two colours. A new
flag costs one line there, because the key already stands. The `flags` map of
[[spec/design_output/tui#colours]] holds the colours. A good tone wears the
green, a bad one the red, and no tone the plain colour.

The details draw every flag in the column's order, one a line, with its key
and its value. Each wears the colour the column gives it.

# A preset carries its sort

A preset is a filter a person writes down, and it carries a sort beside it. A
press writes the filter into the line the pane holds. So it reads and clears
like one a person types, and the sort takes hold with it.

| what a press does | what stands after it |
|---|---|
| a press on a preset | its filter stands in the line, and its sort goes in |
| the same press again | the line clears, and the sort stays |
| a line a person types | it is the whole filter, and a preset is one way to write it |

A preset stands under `groups` in the base file, with its `filters` and its
`sort`. One the file marks `pressed` opens the line when the view opens. So a
person reads the filter that narrows the rows, and clears it in the pane. A
preset carrying a sort and no filter keeps every row, so an empty line is
that view. The pane and its presets are the window's, and every tab offers
its own rows. [[spec/design_output/tui#the-filter-pane-takes-letters]]

A sort reads any key an item carries, in a column or not. So a preset orders
the rows by a time the table hides, and the newest done ticket stands first.

A slice is the same thing over the values one column carries. A column answers
the buttons, so a slice costs no line in the file and moves as the data does.

# A value carries a link

A value this tree resolves draws as a link, and a click opens what it names.
The terminal takes the link as the escape every terminal reads, and the
editor's own terminal opens a file address in the editor. `link.go` writes the
escape.

| the value | what the link opens |
|---|---|
| the name of a row, in the table | the note the row's path names |
| a group, in the details | that group's ticket |
| a note link in the ask | the note it names, a ticket by its bare name |

A value resolving to nothing draws as text. The tree holds the address of a
name under `LinkOf`, and a tree naming none draws the names as text.

# A base file says it

A view comes out of a file, in the base format the vaults write. So a new view
is a file and no change to the code. One file holds several views under
`views`, each with a name. The keys outside `views` stand for every view in it.

| the key | what it says |
|---|---|
| `views` | the views, each a map with a `name` |
| `order` | the columns, in order, each naming the key it reads |
| `columnSize` | the room a column opens with, by key |
| `filters` | the tests a row passes, as a list joined by `and` |
| `nest` | the key a child reads to find its parent, and a view naming none stands flat |
| `collapsed` | what stands collapsed |
| `properties` | the fields, and the one with `opensNote` says what a click opens |

A view's own key wins over the file's, but for `filters`, where the file's
tests and the view's join with `and`. So the file says what a row is, and a
view narrows it further.

A test reads as a line of the filter language.
[[spec/design_output/tui#the-filter-language]]

| how a test stands in the file | what the reader takes |
|---|---|
| a quoted line, as a vault writes it | the line |
| a map of one key, as this tree's own language reads unquoted | `key: value`, the line again |

`ReadBase` answers the views, or the one reason it reads none: no map, no
`views`, a view naming itself nowhere, or a view naming no column. `groups`,
`counts` and `sort` wait for the tickets that use them, and `ReadBase` reads
past them.

## One reader holds the yaml

`src/yaml` holds the reader, as a module of its own that takes no dependency.
The server and the viewer both take it, so one subset stands and no module
copies it. [[spec/design_output/schema#the-yaml-a-schema-reads]]

# A cell takes an edit

A person edits a value in the cell holding it, and the note stays shut. So a
tab full of states is a tab where the states change, one key a change.

| the key | what the edit does |
|---|---|
| open | the cell takes a line to type into, holding the value it carries |
| Enter | the view writes the value, and the cell stands as it reads |
| Escape | the view puts the old value back |
| Enter with shift | the view writes the value into every row it holds |

`Open` takes the column, and answers whether a cell stands under the cursor.
`Take`, `Fill` and `Drop` each close the edit. The edit draws in the cell
holding it, so a person reads the row while typing into it.

An edit reaches the item through its address, so the row the view draws and the
item the tree holds stay one thing.

## The fill reaches the view

The fill reaches every row the view holds at that moment, so a filter says how
far it goes. A row the filter drops keeps the value it carries.

## A fill reaches the marks

A person marks rows, and a fill standing over marks reaches those rows alone.
With no mark standing the fill reaches the view, so the plain fill stays what it
is:

| what a person does | what the view does |
|---|---|
| a press on a row | that row takes a mark, and a press again takes it off |
| shift and a row | every row from the last mark to this one takes one |
| a fill over marks | the value reaches the marked rows |
| a change to the filter | every mark goes |

A mark a person cannot see is a row a fill writes blind, so a narrowing drops
them all. This is how a person moves work between groups: mark the rows, write
`group` in the cell, and every marked row takes it.

## A schema refuses a value

`Take` and `Fill` each answer the rows that keep the value they carry. So the
view says which rows stay behind, and a person reads why the fill reaches fewer
rows than the view draws. Nothing else marks them yet, and how the view draws
the answer waits for the tab.

# The completion knows the field

A `Schema` says what values a field takes, and a view takes one or takes none:

| what the field carries | what the completion offers |
|---|---|
| a schema naming values | those values, and the field takes nothing else |
| no schema, or one naming none | every value standing in the data, and a new one a person types |

The offer keeps every value holding what a person types, the way the filter
matches, and it ignores case.

A caller builds the `Schema` out of the schemas this tree already holds, and a
view with none reads its own data. [[spec/design_output/schema]]

The work tab is the first to wire the edit, and a key there flips a mark in
place of an editor standing open. For details, see
[[spec/design_output/tui#the-work-tab-takes-edits]]. The editor reading the
type its schema names still waits.
