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
- The declaration shall say whether a view nests or stands flat.
- A button shall expand every row, and a button shall collapse every row.
- The view shall take one key of an item a column, so one view serves many shapes.
- The first column shall carry the name and the nesting.
- The last column shall take the space the columns before it leave, and it shall cut its text there.
- The column headers shall stand still while the rows scroll.
- A click on a header shall sort by that column, and a second click shall turn it around.
- The view shall sort by several columns, in the order a person picks them.
- The view shall load the rows it draws, and leave the rest until a person reaches them.
- The view shall page, in a page size a person picks.
- A person shall reorder, resize, pick and hide the columns.
- The declaration shall hold the columns a view opens with, and what a person moves shall stay out of it.
- The view shall open the details of the selected item on Enter.
- A value this tree resolves shall draw as a link, and a click shall open what it names.
- The view shall filter, in the language the log filter reads.
- A node shall stand while it matches, or while a child of it matches.
- The filter panel shall offer presets, and a preset can carry a key of its own.
- Each tab shall hold its own filter.
- A person shall edit a value in the cell holding it.
- An edit shall take Enter as its yes, and Escape shall put the old value back.
- Shift with Enter shall write the value into every row of the view, where the field takes it.
- The completion shall read the schema of a field, and the values standing in the data otherwise.
- The editor of a cell shall read the type its schema names.
- A cell holding a mark shall carry its editor open, so one click flips it.
- A declaration shall say what a view draws.
- The sort and the filter shall stand between the data and the view, and leave the data as it is.

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

A folder under `spec` holds the views, one file a view, and the editor fills
from that file. So a new view is a file and no code change. How a tab reaches
a view waits for the design output.

The third and the fourth tree write that file in Obsidian's own base format,
and this tree takes the same one. `spec/views/work.base` on the fourth branch
is the case to read.

| what that file says | the key it uses |
|---|---|
| what a row is | `filters`, as a list of tests joined by `and` |
| the columns, in order | `order` |
| how wide a column opens | `columnSize` |
| what opens the note | `properties`, with `opensNote` |
| the named filters a reader picks | `groups`, and `pinned` for the one on top |
| what a view counts | `counts`, each with its own filter |
| the sort it opens with | `sort` |
| what stands collapsed | `collapsed` |

One file holds several views under `views`, each with a name. So the presets a
person clicks are the groups, and the columns a view opens with are the order.

| what the file says | what it decides |
|---|---|
| where the rows come from | the notes, the tickets or another answer |
| the columns, in order | the key each one draws |
| the nesting | the key a child reads to find its parent |
| the link | what a click on the name opens |
| the presets | the filters the panel offers |


# Enter opens the details

A column cutting its text costs a reader nothing, because Enter opens the whole
item beside the tree. The details hold every field, the way the log rows do
today. [[spec/design_output/tui#the-details]]

# A value carries a link

The view carries links, and the name is one case. A value reading as an address
draws as a link, and a click on it opens what it names:

| the value | what a click opens |
|---|---|
| a web address | the page |
| a path this tree resolves | the file it names |
| the name of a note | the note |
| the name of a work ticket | the note in the editor |

A value resolving to nothing draws as text. So the rule reads once: a value
this tree resolves is a link, and everything else is a word.

A terminal draws a link as an escape a person clicks, and the editor's own
terminal takes the click. The viewer of the third tree does something like it,
so the road stands open. What the click reaches waits for a look of its own.

# The filter

The filter reads the language the log filter reads, over the fields an item
carries. So a person learns one language and uses it in every tab.
[[spec/design_output/tui#the-filter-language]]

| what a person does | what the view does |
|---|---|
| types a filter | keeps every node matching it |
| types a filter a child matches | keeps the parent, so the child stands reachable |
| opens the filter panel | reads the presets, and takes one on a click |
| leaves the tab | the filter holds, and the footer marks it |

A preset is a filter somebody writes down. The log holds one for prompts and
replies, the work browser holds its own, and a preset carrying a key opens on
that key.

One filter line reaches every column, because the language already names a
column: `state: open` narrows one field and a bare word searches them all. So
the view carries one line to type into, and the columns carry no boxes of their
own.

# A cell takes an edit

A person flips a state in the cell holding it, and the note stays shut. So a
tab full of states is a tab where the states change, one click a change.

The edit writes back to the thing the row comes out of, which is the note for a
ticket.

| the key | what the edit does |
|---|---|
| Enter | writes the value, and the cell stands as it reads |
| Escape | puts the old value back |
| Shift with Enter | writes the value into every row of the view |

Qt calls that a delegate, and the two keys are what a person there expects. The
fill reaches every row the view holds at that moment, so a filter decides how
far it goes. A row whose schema refuses the value keeps the value it carries,
and the view says which rows stay behind.

# Many rows, and the filter

The view loads the rows it draws, and a person reaching further asks for more.
A page size a person picks says how many stand at once. Both keep a long answer
cheap.

A filter reads every row, and lazy loading holds most of them back, so the two
pull against each other. The filter goes to the source:

| the source | where the filter runs |
|---|---|
| the index over the notes | the index answers the matching set |
| a database | the query carries the filter |
| a small answer already in hand | the view filters what it holds |

So the source answers a narrowed set, and the view draws the first page of it.
A source answering no filter hands its rows over, and the view says so while it
reads them.

# What the terminal carries

Measured against what this tree builds with today. Bubble Tea draws, `bubbles`
carries a table of flat rows, a text input and a help, and `lipgloss` measures
and cuts. Everything else below is this tree's own code.

| what this note asks | what stands ready | the size |
|---|---|---|
| a tree with expand and collapse | nothing | small: a depth a row, and a set of the open ones |
| columns reading keys of an item | a table of flat rows | small |
| headers standing still | the table draws a header | small |
| the last column cutting its text | `lipgloss` measures and cuts | small |
| sorting by several columns | nothing, and the rows sit in memory | small |
| the filter, and the parent of a match | the log filter reads the language today | small |
| a preset panel | nothing | small |
| the base file a view comes from | a YAML reader stands in the tree | medium |
| an editor in a cell | a text input | small |
| Enter, Escape and the fill | nothing | small |
| the completion out of a schema | the schema reader stands in the tree | medium |
| a mark editor standing open | nothing | small |
| lazy loading, and a page size | nothing, and the source answers the page | medium |
| a click on a header to sort | a mouse message carries its column and row | medium: the column edges are ours |
| dragging a column wider, or aside | motion messages arrive while a button holds | medium |
| picking and hiding columns | nothing | small |
| a link on the name | this tree writes the escape itself | small, and the terminal decides the click |
| pasting into a cell | a paste arrives as a message | medium |
| copying a range out | the clipboard wants a door of its own | medium |
| taking an edit back | nothing | medium |
| a menu on a row | nothing | medium |

So the terminal carries the whole of this note. The rows reading `medium` carry
the risk, and three of them stand in the chapter below, which waits.

Two questions a person settles by trying:

| the question | what settles it |
|---|---|
| does the mouse reach a terminal inside the editor? | a spike, in that terminal |
| does a click on a link open the note? | the same spike, on one row |

# What waits

Some parts of the shape wait, and the note names each one:

| what waits | why |
|---|---|
| grouping by a column | the fourth tree draws it badly beside a frozen row, so it waits for a design that holds |
| taking an edit back | the first copy runs without it, and the second one takes it |
| copy and paste over a range | a terminal reads a paste as keys, so the road wants a look |
| a menu on a row | the same question, and the keys carry the acts meanwhile |

# The completion knows the field

An edit offers what the field takes:

| what the field carries | what the completion offers |
|---|---|
| a schema | the values that schema names, and those alone |
| no schema | every value standing in the data, and a new one a person types |

Obsidian is the shape. A field bound to a schema takes a person to the values
it holds, and a free field learns from what the tree already carries.
