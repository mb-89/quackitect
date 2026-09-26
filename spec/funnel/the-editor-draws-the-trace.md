---
kind: [[funnel]]
about: the views the editor draws over the trace, the levels a config declares, and what the index derives for them
---

# Scope

The trace view stands as a prototype under `prototype/trace-view`, and the
header of `build3.py` there names the build. It reads the index and the git
history, and it writes one page that opens offline. Nothing in it reads a
language model: every name, group and hint comes from code.

The editor splits in two panes, and a handle between them moves the split.
The top pane holds the overview or the open level. The bottom pane holds the
details of the selected item, which is its local trace. Where it comes from
stands on the left, and what it feeds stands on the right. An arrow beside a name opens the file.

The owner's rulings stand in a design input, since a funnel note holds no
decision of its own.

# The rulings

For details, see [[spec/design_input/the-editor-draws-the-trace]].

# The views on offer

| view | where it stands | what it costs |
|---|---|---|
| V | the overview | a level count past the page width crowds the arms |
| columns | the overview and every level | one column a level, so a deep chain scrolls to the right |
| tree | every level | one level deep, so a jump moves to the level of the target |
| structure matrix | every level | a large level pages or folds its groups |
| mapping matrix | two levels, adjacent or not | a path over a middle level composes its links |
| block diagram | design outputs and sections | a double-click opens a block, and the breadcrumbs lead out |
| levelled map | design outputs | a cycle holds every member in one box |
| onion | design outputs | the adapter line rests on a share of imports alone |
| call graph | code files | a call resolves by name, so two functions of one name blur |
| city | the overview | a floor needs a minimum height, so a note with many sections stands taller than its measure |

# What stands open

| the question | what hangs on it |
|---|---|
| the sidebar of the editor | the next editor discussion opens there |
| a verb giving hints over the structure, from the trace, the design text and the code | the retro calls it, and it writes notes. For details, see [[spec/funnel/the-retro-reads-the-structure]] |
| suspect links and impact analysis | a changed section marks the code pointing at it for a read |
| pings as signals a reader subscribes to by selector | level three draws them on the trace |
| the process in the centre, with artifacts on the left | level three builds it over this trace |
| where a group of the owner's own lives | the matrix editor stores it there |
| the index tables the views need | pointers in code comments, headings and block-list frontmatter reach the index, and the prototype stops parsing them itself |
