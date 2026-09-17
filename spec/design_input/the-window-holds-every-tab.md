---
kind: [[design_input]]
---

# Scope

The log viewer grows into one window holding every tab this tree needs. This
note covers the frame alone. That is the header of tabs, the help reading what
stands under the cursor, the pane on the right, and the footer of status marks.
The log is the first tab, and the tabs after it wait for their own note.

Textual is the shape the owner wants. Writing again what it already settles
costs more than it returns.

# The header holds the tabs

The header carries the tabs, in a row, and `alt+?` at its right end. Those two
are the whole header. Everything else standing there today moves into the help,
`alt+L` and the log level among them.

A tab carries a number, one to nine, and the number opens it. Nine tabs is the
ceiling, and a tree wanting a tenth says so then.

# The help reads the cursor

`alt+?` opens the help in the pane on the right, the way it opens today. The
help names three bands, in this order:

| band | what it names |
|---|---|
| global | every key the window holds, whatever stands open |
| the tab | every key the open tab adds |
| the selection | every key the selected thing adds |

So a person pressing `alt+?` reads what to do next, wherever they stand.

Every key comes out of a registration, and no hand writes a second list. What
the window knows about the open tab and the selected thing is what the help
draws. A key nobody registers reaches the help nowhere, and works nowhere.

# The window is a split

The left side holds the bigger picture, and the right side holds the details of
whatever stands selected there. That split is the window, and every tab takes
it.

The right side holds one thing at a time:

| the key | what the right side holds |
|---|---|
| Enter | the details of the selection, as the log rows show today |
| `alt+?` | the help |
| `alt+f` | the filter |

The key opening one closes it, and the right side goes back to the details. So
one key opens and shuts one thing, and the details are the resting state.

# The footer carries status

The footer carries status marks at fixed places, so nothing shifts as a mark
comes and goes. A mark stands dark where its thing stands off.

| where | the mark | it stands when |
|---|---|---|
| the right end | the log level, in four columns | always |
| beside it | a funnel | a filter holds |

The list grows as the tree grows. The header and the footer both stand at every
size, and the tab between them scrolls.

# The keys and the mouse

The numbers one to nine open the tabs, wherever a field takes no letters. Tab
and the arrows move inside the two sides of the split. A field taking letters
holds every key it reads, and the numbers reach the tabs again once it lets go.

`alt+?` is the one way to the help, and the question mark alone goes.

The mouse is the open question. A click on a tab opens that tab, and the owner
wants to read how well that holds in the editor's own terminal. The numbers on
the tabs are the answer where the mouse falls short.

# What the framework gives

Measured against what this tree already builds with:

| what | where it stands | what it gives |
|---|---|---|
| `bubbles/key` | `key.Binding`, with `WithKeys` and `WithHelp` | a key, its name and its sentence, in one value |
| `bubbles/help` | `ShortHelpView` and `FullHelpView` | a rendered help, and groups of bindings in columns |
| `bubbletea` | `WithMouseCellMotion`, `MouseMsg` | a click with its column and row, and the wheel |
| `lipgloss` | the styles the viewer already uses | the header, the footer and the frame |

So the three bands are three groups of bindings, and the help bubble draws
them. A binding carries its own sentence, so the registration the help reads is
the registration the key reads.

What no library gives, and this tree writes:

- the tab strip, and the number opening a tab
- the hit test taking a click to the tab under it
- the registry naming the open tab and the selected thing
- the footer, its fixed places, and each mark

# Where a person watches it

A cloud session shows messages, files and diffs. The docs name the ways in as a
browser, a phone, a desktop app and a terminal, and each one opens on the
conversation. A shell inside the session's own box stands outside that list, so
a window built here reaches a person three ways:

| the road | what a person gets |
|---|---|
| `claude --teleport` | the session and its branch land in their own terminal, where the window runs whole |
| `--frame` | one drawing of the window, for a reader at a screen with no terminal |
| the sidebar | the editor draws the same values, and the panel holds the local road |

The browser road waits on a copy this tree writes twice. Bubble Tea builds for
a terminal, and a build for the browser fails on the terminal it asks for. So
the window stays a terminal window, and the frame is what a cloud session
shows.

# The work browser

The tab after the log is a work browser, and it opens on a tree.

The branch listing takes long enough today that a person waits on it. The tab
wants it quick, and what takes the time waits for a look of its own.

# The tree view

The work browser opens on one tree view, and every tab drawing rows with a
shape takes the same one. It holds its requirements in a note of its own, and
the window asks for that view whole. [[spec/design_input/the-tree-view-editor]]

The window adds one thing: `alt+f` opens the filter of the tab standing open,
and the footer marks the tab holding one.

# What waits

The tabs after the log wait for a note of their own. This one settles the
frame, and the first tab is the log as it stands today.
