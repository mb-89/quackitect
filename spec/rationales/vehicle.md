---
kind: [[rationale]]
explains: [[spec/design_output/vehicle]]
---

# Why

v3 could record which copy drove a project, and resolving one always failed.
It wrote a path. The path went stale the first time either tree moved, and the
record then named a folder holding something else.

v4 answered with three parts:

| part | what it survives |
|---|---|
| an identity made at install | the copy moving |
| a project naming that identity | the project moving |
| a register from identity to place | both, on any machine |

## 1. The guess was confident

The method root used to be the folder two above the executable. That holds only
where the program runs out of its own bin folder. Run from anywhere else, it
still named a folder, just as confidently.

A lint over that guess filed findings against files that had nothing to do with
anything. A stray copy under the per-user data folder made every program under
the temporary folder answer that folder as its method root.

So the walk looks for a marker the method tree actually carries, and answers
empty where there is none. Empty is a thing a caller reports and stops on.

## 2. Registering bought nothing

v3 made a person register both roots by hand. v4 dropped that ceremony.

| what v3 asked | what v4 does |
|---|---|
| register both roots | attach on the first start |
| name the copy | the install makes its identity |
| pick a driver | one copy on the machine answers itself |
