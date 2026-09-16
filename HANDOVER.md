---
kind: [[handover]]
status: held
urgency: soon
---

# Where it stands

Two design inputs stand on trunk, and the window waits for its first line of
code:

- [[spec/design_input/the-window-holds-every-tab]]
- [[spec/design_input/the-tree-view-editor]]

The log viewer draws one window today, in `src/viewer`, with a header, a list
and one pane. It becomes a window of tabs, and the log is the first tab.

Two free tickets wait for a person, and this branch leaves them alone. They
are `the-mouse-reaches-the-window` and `a-link-click-opens-it`.

# What waits

| step | what lands |
|---|---|
| the frame | the header of tabs, the numbers opening them, the split, and the footer |
| the help | three bands out of registered keys: global, the tab, the selection |
| the tree | items, columns reading keys, expand and collapse, the last column cutting |
| the base file | a reader for the view declaration, in Obsidian's format |
| the filter | the log's language over an item, and a parent standing while a child matches |
| the editing | Enter, Escape, the fill, and the completion out of a schema |

Each step lands as its own ticket, its own commit and its own test. Mint one
with `./RUNME.sh mint ticket <path> --process=trivial`, and name this branch
under `group`.

A cloud box runs no terminal, and every step above still holds a test:

| the road | what it covers |
|---|---|
| a model test, as `src/viewer/model_test.go` writes them | a key message in, a view string out |
| `logview --frame --size WxH` | the whole window, drawn once, on standard out |
| a program under `tea.WithInput` and `tea.WithOutput` | a script of keys against the real loop |

Five things stay out of this branch:

- the mouse, and what a click reaches
- grouping by a column
- taking an edit back
- copy and paste over a range
- a menu on a row

Run `./RUNME.sh check` last, write the result and the retro into this file, and
run `./RUNME.sh branch done`.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh branch sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh branch sync` again, so main comes in last too.
   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.
5. Run `./RUNME.sh branch done`, which sets the status and pushes.
6. Run `./RUNME.sh branch release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
7. Run `./RUNME.sh branch merge <name>` from main to take it in, then
   `branch close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
