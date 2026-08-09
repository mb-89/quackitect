---
id: template-node-table
statement: A fillable table over standing nodes — the rows are the nodes, the columns are their frontmatter, and editing either side changes the same thing.
editor: node-table
resolves: artifact
line_pattern: "^\\| .+ \\|"
line_help: "one row per node; the first cell is the node, the rest are its frontmatter values"
---

# node-table

The rows are NODES and the columns are FRONTMATTER KEYS on them. Typing in a
cell writes that key on that node. Editing the note and saving shows here at
the next look.

There is no second copy. The form is a window onto the register, the way a
Bases view is a window onto a vault.

## What the field declares

```
- name: probes
  template: node-table
  of: raid
  items:
    - $assumptions
  columns:
    - probe
    - probed
```

- `of` — which kind of node a row may be.
- `items` — where the rows come from. A fixed list of ids, or a live source.
- `columns` — the frontmatter keys, in order. These are the editable cells.

## The rows are not yours to choose

`items` names a SOURCE, and the source decides. `$assumptions` is every
standing assumption in the register, whichever record wrote it. A new one
appears the moment somebody writes it; a closed one drops out.

That is what makes the field a standing artifact rather than a snapshot. The
state stands while every row is filled, so a new row un-fills it — which is
correct, because the claim the state makes stopped being true.

(`$inbox` freezes on signing, deliberately, and this does not. A retro
answered the notes pending when it walked. A register is answered as it
stands.)

## Every cell is required, and the prompt lives in the cell

A node is minted with its columns carrying a MARKDOWN COMMENT saying what
belongs there.

```
probe: <!-- what the check found. Start with holds, false, unprobed or scheduled. -->
```

The comment shows in the cell, dimmed. Replacing it with plain text is what
answers the field. A still-commented cell counts as UNANSWERED, exactly like
an empty one, and the submit refuses it by name.

So the field explains itself where the answer will go. Nothing invents a
placeholder somewhere else that could drift from what the node actually asks
for.

Where the honest answer is "no check exists yet", write THAT, with its
reason. Naming a gap is an answer. Leaving the comment there is not.

## What the reader sees

Each row leads with the node as a LINK. Clicking it opens the note in the
editor, with the full statement and everything around it.

The table carries only the cells being edited. The node is one click away, and
copying it here would fork the truth.

## Stored form

A markdown table, so the file stays readable to somebody who never opens the
form.

```
| raid | probe | probed |
| --- | --- | --- |
| [[raid-lane-works-on-posix]] | unprobed — needs a second platform | |
```

The stored copy is a RENDERING. It is rebuilt from the nodes on every look, so
an edit made in the note wins over whatever the file happens to hold.
