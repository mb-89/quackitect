# The tree view

One view draws a tree and a table at once. Every tab wanting rows with a shape
takes this one, and a page in a browser takes the same requirements later. Qt is
where the shape comes from.

- The view shall draw items in a tree, and a parent shall collapse and expand.
- The view shall take one key of an item a column, so one view serves many shapes.
- The first column shall carry the name and the nesting.
- The last column shall take the space the columns before it leave, and it shall cut its text there.
- A field holding long text shall stand in the last column.
- The view shall open the details of the selected item on Enter.
- The name shall carry a link, and a click on it shall open what the link names.
- The view shall sort by a column.
- The view shall filter, in the language the log filter reads.
- A node shall stand while it matches, or while a child of it matches.
- The filter panel shall offer presets, and a preset can carry a key of its own.
- Each tab shall hold its own filter.

# The columns read the item

An item carries data, and a column names the key it draws. So the same view
draws tickets, notes and the rows this tree grows later.

A ticket shows it:

| column | what it reads | why there |
|---|---|---|
| the first | the name, nested by group | the tree stands in the first column |
| the second | the state | a short field reads whole |
| the third | the description | the last column cuts, and long text belongs there |

A note shows the same shape, and its front matter is the keys the columns name.

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
