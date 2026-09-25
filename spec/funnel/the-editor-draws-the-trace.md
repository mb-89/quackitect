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
details of the selected item: its local trace, with where it comes from on the
left and what it feeds on the right. An arrow beside a name opens the file.

The owner's rulings stand below. A ruling here waits for a design input, since
a funnel note holds no decision of its own.

# What stands open

| the question | what hangs on it |
|---|---|
| the sidebar of the editor | the next editor discussion opens there |
| a verb giving hints over the structure, from the trace, the design text and the code | the owner discusses it next, and the research names a first set of rules and a baseline that fails on new findings alone |
| suspect links and impact analysis | a changed section marks the code pointing at it for a read |
| pings as signals a reader subscribes to by selector | level three draws them on the trace |
| the process in the centre, with artifacts on the left | level three builds it over this trace |
| where a group of the owner's own lives | the matrix editor stores it there |
| the index tables the views need | pointers in code comments, headings and block-list frontmatter reach the index, and the prototype stops parsing them itself |
