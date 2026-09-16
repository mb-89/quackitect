---
kind: [[handover]]
status: done
urgency: soon
---

# Where it stands

The window is a frame of tabs, and the tree view stands whole beside it. Six
tickets land, one commit each, each with the test that covers it.

| the step | what lands | its ticket |
|---|---|---|
| the frame | the strip of tabs, the numbers, the split, the footer | [[spec/tickets/the-window-grows-a-frame]] |
| the help | three bands out of registered keys | [[spec/tickets/the-help-reads-the-cursor]] |
| the tree | items, columns reading keys, expand and collapse, the last column cutting | [[spec/tickets/the-tree-draws-its-columns]] |
| the base file | a reader for the view declaration | [[spec/tickets/a-base-file-says-it]] |
| the filter | the log's language over an item, and a parent standing for a match | [[spec/tickets/the-tree-takes-a-filter]] |
| the editing | Enter, Escape, the fill, and the completion out of a schema | [[spec/tickets/a-cell-takes-an-edit]] |

Two notes carry the design: [[spec/design_output/viewer]] for the window, and
[[spec/design_output/tree-view]] for the view every tab after the log takes.

One defect the work turns up lands with it. `hang` measures a wrapped line's
indent in bytes, so a line carrying a character wider than a byte wraps two
columns off. It measures in runes now.

`./RUNME.sh check` answers 0. 997 node tests pass, the Go tests of both modules
pass, the doors hold and the projections read. 67 lines stand at warning, and
the check allows them. The tally sits where it sits, and this branch answers
none of these three:

| the warning | why it stands |
|---|---|
| `Schema.Placeholder`, 29 | the ticket notes of this tree, each waiting for a hand |
| `FileCeiling`, 7 | `cli.js`, `pull.js`, `work.js` and four others, each over 600 before this branch |
| `MagicNumber`, 29 | the numbers the viewer and the scripts already carry |

# What waits

| what waits | what it takes |
|---|---|
| the work browser | a tab drawing the tree view, a folder of base files under `spec`, and a source of items |
| the tab keys | `Move` on the tab, so up, down, the page keys, Home and End reach the open tab |
| a filter a tab | the filter line moves off the window and onto the open tab, which the footer already asks |
| sorting | by several columns, in the order a person picks them |
| the presets | `groups`, `counts` and `sort` stand in the base format, and `ReadBase` reads past them |
| lazy loading | a page size, and a source answering a narrowed set |
| the editor by type | a cell reading the type its schema names, and a mark carrying its editor open |
| the rows that stay behind | `Take` and `Fill` answer them, and nothing draws the answer yet |

Five things stay out of this branch, the way the brief says:

- the mouse, and what a click reaches
- grouping by a column
- taking an edit back
- copy and paste over a range
- a menu on a row

Two free tickets still wait for a person, and this branch leaves them alone:
`the-mouse-reaches-the-window` and `a-link-click-opens-it`.

# What surprises me

| the surprise | what it costs |
|---|---|
| the help bubble drops a band wider than the pane | one rewrite of the help drawing |
| a global key still moves the log alone | a row under **What waits** |
| the YAML reader reaches one module | a module split, a stamp and a check step |
| a rename over a file reaches past its target | a diff of the move |
| a built binary reaches a commit | two amends |
| the mechanical rules catch the notes late | a pass over every note this branch writes |

**The help bubble draws no band.** `FullHelpView` takes groups of bindings and
columns them, and it drops a group wider than the width the caller hands it. A
band of sentences is wider than half a window, so the whole band comes out as
one ellipsis. The window draws the bands itself now, over the wrapping the
details already use. That is the first dead end, and it costs one rewrite.

**A key that moves the log is no key that moves the window.** The frame
registers up, down, the page keys, Home and End as global, and each one still
calls the log's own mover. With one tab that reads right, and it is wrong: a
second tab wants `Move` on the tab interface. The tree view carries its own
`Move` and `Scroll` already, so the join is small. The row above names it.

**The YAML reader stands inside the server's module.** Reading a base file
wants it, and `package main` in a module of its own reaches nobody. So the base
file step turns into a module split. `src/yaml` holds the reader and the loose
value readers now, and the server and the viewer both take it. Two things
follow, and neither one announces itself:

- the viewer's stamp hashes one folder, so a change in the shared module leaves a stale binary. It hashes every folder the viewer builds from now.
- `./RUNME.sh check` runs the viewer's Go tests alone, so the shared module stands with no cover in the check. It runs both now.

**A rename over a whole file reaches past its target.** Exporting `flat` to
`Flat` catches local variables of the same name in two functions. The build
stays green, which is what makes it worth catching. The step that finds it is a
diff of the moved file against its original. A move is worth a diff even where
the tests pass.

**Two binaries reach a commit.** `go build ./...` in a module folder writes the
binary beside the source, and `git add -A` takes it twice. Both come out by
amend, and `.gitignore` names all three now.

**The mechanical rules have a shape.** Four of them catch this branch again and
again:

| the rule | what it asks |
|---|---|
| `CodeComment` | a comment after the first line of code carries a `[[link]]`, so prose belongs in the file header or the design note |
| `Markup` | a heading holds five words |
| `Shape` | a run of four paragraphs carries a table between them |
| the handover schema | a retro stands in the present tense |

Writing the note first and the code second costs less than fixing the note
after.

## How this branch runs

<!-- level0: the brief this branch opens with says these steps, and the next
reader of this file wants them -->

1. Run `./RUNME.sh branch sync` FIRST, so an old branch works against what the
   tree holds now.
2. Commit and push each time you finish a thing.
3. Write your result and your retro into this file, replacing what stands here.
4. Run `./RUNME.sh branch sync` again, then `./RUNME.sh check`.
5. Run `./RUNME.sh branch done`, which sets the status and pushes.
6. Run `./RUNME.sh branch release` instead where you stop early.
7. Run `./RUNME.sh branch merge <name>` from main to take it in, then
   `branch close`. A cloud box stops at step 4, because the harness holds main
   shut there and a cloud box opens no pull request.
