---
kind: [[design_input]]
---

# Scope

One view draws a tree and a table at once, and a person edits the rows in it.
Every tab drawing rows with a shape takes this one view. Work tickets are the
first thing it draws, and a database answer is a later one. A page in a browser
takes the same requirements. Qt is where the shape comes from.

# What it does

- The view shall draw items in a tree, and a parent shall collapse and expand.
- The view shall take one key of an item a column, so one view serves many shapes.
- The first column shall carry the name and the nesting.
- The last column shall take the space the columns before it leave, and it shall cut its text there.
- The view shall sort by a column.
- The view shall open the details of the selected item on Enter.
- The name shall carry a link, and a click on it shall open what the link names.
- The view shall filter, in the language the log filter reads.
- A node shall stand while it matches, or while a child of it matches.
- The filter panel shall offer presets, and a preset can carry a key of its own.
- Each tab shall hold its own filter.
- A person shall edit a value in the cell holding it.
- The completion shall read the schema of a field, and the values standing in the data otherwise.
- A declaration shall say what a view draws, and a tab shall name the view it takes.

# The columns read the item

An item carries data, and a column names the key it draws. So the same view
draws tickets, notes and the rows this tree grows later. A note shows its front
matter that way, and its keys are the columns.

A ticket is the first case, and it stands as an example:

| column | what it reads |
|---|---|
| the first | the name, nested by group |
| the second | the state |
| the third | the description |

A long field reads well in the last column, because that one takes the space
the others spare. Sorting says which column a person reads by, so the order
above binds nothing.

# A declaration says the view

A folder under `spec` holds the views, one file a view. A tab names a view, and
the editor fills from that file. So a new view is a file and no code change.

| what the file says | what it decides |
|---|---|
| where the rows come from | the notes, the tickets or another answer |
| the columns, in order | the key each one draws |
| the nesting | the key a child reads to find its parent |
| the link | what a click on the name opens |
| the presets | the filters the panel offers |

The third and the fourth tree hold a syntax for this already. Reading those
decides the shape here, and this note asks for the same one where it fits.

# Enter opens the details

A column cutting its text costs a reader nothing, because Enter opens the whole
item beside the tree. The details hold every field, the way the log rows do
today. [[spec/design_output/viewer#the-details]]

# The name is a link

The name carries a link, and what the link opens depends on what the item is:

| the item | what a click opens |
|---|---|
| a note | the note |
| a work ticket | the note in the editor |

A terminal draws a link as an escape a person clicks, and the editor's own
terminal takes the click. The viewer of the third tree does something like it,
so the road stands open. What the click reaches waits for a look of its own.

# The filter

The filter reads the language the log filter reads, over the fields an item
carries. So a person learns one language and uses it in every tab.
[[spec/design_output/viewer#the-filter-language]]

| what a person does | what the view does |
|---|---|
| types a filter | keeps every node matching it |
| types a filter a child matches | keeps the parent, so the child stands reachable |
| opens the filter panel | reads the presets, and takes one on a click |
| leaves the tab | the filter holds, and the footer marks it |

A preset is a filter somebody writes down. The log holds one for prompts and
replies, the work browser holds its own, and a preset carrying a key opens on
that key.

# A cell takes an edit

A person flips a state in the cell holding it, and the note stays shut. So a
tab full of states is a tab where the states change, one click a change.

The edit writes back to the thing the row comes out of, which is the note for a
ticket.

# The completion knows the field

An edit offers what the field takes:

| what the field carries | what the completion offers |
|---|---|
| a schema | the values that schema names, and those alone |
| no schema | every value standing in the data, and a new one a person types |

Obsidian is the shape. A field bound to a schema takes a person to the values
it holds, and a free field learns from what the tree already carries.
