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

The header carries the tabs, in a row. The help key stands at its right end, as
`alt+?` does today. Everything else standing in that header today moves into
the help.

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

# The right pane holds one

The pane holds the help, the details or the filter, and one of them at a time:

| the key | what the pane holds |
|---|---|
| `alt+?` | the help |
| Enter, on the log | the details of the selected row |
| `alt+f` | the filter |

The key opening a pane closes it again, and the pane stands shut after that.

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

The arrows scroll the pane, and `w` and `s` move the log, the way they do
today. The mouse is the open question. A click on a tab opens that tab, and the
owner wants to read how well that holds in the editor's own terminal. The
numbers on the tabs are the answer where the mouse falls short.

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

# What waits

The tabs after the log wait for a note of their own. This one settles the
frame, and the first tab is the log as it stands today.
